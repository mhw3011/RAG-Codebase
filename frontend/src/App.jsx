const API_URL = import.meta.env.VITE_API_URL;
import { useState, useRef, useEffect } from "react";
import axios from "axios";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import FileTree from "./components/FileTree";
import buildFileTree from "./utils/buildFileTree";

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const [selectedCode, setSelectedCode] = useState(null);
  const [files, setFiles] = useState([]);

  const fileTree = buildFileTree(files);
  const chatRef = useRef();

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const handleUpload = async () => {
    try {
      setUploadStatus("loading");

      const res = await axios.post(`${API_URL}/api/upload-repo`, {
        repoUrl,
      });

      const id = res.data.sessionId;
      setSessionId(id);

      const filesRes = await axios.get(`${API_URL}/api/files/${id}`);
      setFiles(filesRes.data);

      setUploadStatus("done");
    } catch (err) {
      console.error(err);
      setUploadStatus("idle");
    }
  };

  const handleAsk = async () => {
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/query`, {
        sessionId,
        question,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setQuestion("");
  };

  const getLanguage = (file = "") => {
    const f = file.toLowerCase();

    if (f.endsWith(".py")) return "python";
    if (f.endsWith(".java")) return "java";
    if (f.endsWith(".cpp")) return "cpp";
    if (f.endsWith(".ts")) return "typescript";
    if (f.endsWith(".tsx")) return "tsx";
    if (f.endsWith(".jsx")) return "jsx";
    if (f.endsWith(".json")) return "json";
    if (f.endsWith(".html")) return "html";
    if (f.endsWith(".css")) return "css";
    if (f.endsWith(".js")) return "javascript";

    return "javascript";
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <Box
        sx={{
          width: "260px",
          backgroundColor: "#0f172a",
          color: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>
          Codebase AI
        </Typography>

        <TextField
          size="small"
          placeholder="Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          sx={{ backgroundColor: "white", borderRadius: 1, mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploadStatus === "loading"}
          sx={{
            backgroundColor: uploadStatus === "done" ? "#22c55e" : "#3b82f6",
            "&:hover": {
              backgroundColor: uploadStatus === "done" ? "#16a34a" : "#2563eb",
            },
          }}
        >
          {uploadStatus === "loading" ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : uploadStatus === "done" ? (
            "Uploaded"
          ) : (
            "Upload Repo"
          )}
        </Button>

        <Box sx={{ mt: 3, overflow: "auto", flex: 1 }}>
          <FileTree
            tree={fileTree}
            onSelect={(file) =>
              setSelectedCode({
                file: file.file_path,
                name: file.file_path?.split("/").pop(),
                code: file.code || "",
              })
            }
          />
        </Box>
      </Box>

      {/* CHAT */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#f1f5f9",
        }}
      >
        <Box
          sx={{
            width: "800px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: "white",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography variant="h6">Ask your codebase</Typography>
          </Box>

          {/* CHAT */}
          <Box
            ref={chatRef}
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                }}
              >
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Box
                    sx={{
                      fontSize: "15px",
                      lineHeight: 1.7,
                      color: "#0f172a",
                      "& p": { margin: "6px 0" },
                      "& code": {
                        backgroundColor: "#e2e8f0",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        fontSize: "13px",
                      },
                      "& pre": {
                        backgroundColor: "#0f172a",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        overflowX: "auto",
                      },
                      "& h1, & h2, & h3": {
                        margin: "10px 0 6px",
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </Box>

                  {/* SOURCES */}
                  {msg.sources?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontSize: "12px", color: "gray" }}>
                        Files:
                      </Typography>

                      {msg.sources.map((s, idx) => (
                        <Box key={idx} sx={{ mt: 1 }}>
                          {/* FILE NAME */}
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "black",
                              mb: 0.5,
                            }}
                          >
                            📄 {s.file}
                          </Typography>

                          {/* FUNCTION (CLICKABLE TEXT) */}
                          <Typography
                            onClick={() =>
                              setSelectedCode({
                                file: s.file,
                                name: `Lines ${s.startLine}-${s.endLine}`,
                                code: s.code,
                              })
                            }
                            sx={{
                              fontSize: "14px",
                              ml: 3,
                              color: "#60a5fa",
                              cursor: "pointer",
                              fontWeight: 400,
                              display: "inline-block",
                              textDecoration: "underline",
                            }}
                          >
                            Lines : {s.startLine}-{s.endLine}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
            {loading && <CircularProgress size={20} />}
          </Box>

          {/* INPUT */}
          <Box sx={{ p: 2, backgroundColor: "white", display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Ask something about the repo..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button variant="contained" onClick={handleAsk}>
              Send
            </Button>
          </Box>
        </Box>
      </Box>

      {/* MODAL */}
      <Dialog
        open={!!selectedCode}
        onClose={() => setSelectedCode(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedCode?.name || "Code Preview"}</DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: "12px", mb: 1 }}>
            {selectedCode?.file}
          </Typography>

          <SyntaxHighlighter
            language={getLanguage(selectedCode?.file)}
            style={oneDark}
          >
            {selectedCode?.code || "// No code available"}
          </SyntaxHighlighter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
