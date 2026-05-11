import express from "express";
import { cloneRepo } from "../services/gitService.js";
import { getAllFiles } from "../utils/fileReader.js";
import { extractCodeChunks } from "../services/parserService.js";
import { getEmbedding } from "../services/embeddingService.js";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();

router.post("/upload-repo", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl is required" });
    }

    // 1. Clone repo
    const { sessionId, repoPath } = await cloneRepo(repoUrl);

    // 2. Get all files
    const files = getAllFiles(repoPath);

    let allChunks = [];

    // 3. Extract chunks
    for (const file of files) {
      const chunks = extractCodeChunks(file);

      const enrichedChunks = chunks.map((chunk) => ({
        ...chunk,
        filePath: file,
        sessionId,
      }));

      allChunks.push(...enrichedChunks);
    }

    console.log(`Total chunks extracted: ${allChunks.length}`);

    // 4. Generate embeddings + store in DB
    let successCount = 0;

    for (const chunk of allChunks) {
      try {
        const embedding = await getEmbedding(chunk.code);

        const { error } = await supabase.from("code_chunks").insert({
          session_id: chunk.sessionId,
          file_path: chunk.filePath,
          type: chunk.type,
          name: chunk.name,
          code: chunk.code,
          embedding: embedding,
        });

        if (error) {
          console.error("DB Insert Error:", error.message);
        } else {
          successCount++;
        }
      } catch (err) {
        console.error("Embedding Error:", err.message);
      }
    }

    // 5. Final response
    res.json({
      message: "Repo processed and stored",
      sessionId,
      totalChunks: allChunks.length,
      storedChunks: successCount,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Failed to process repo" });
  }
});

export default router;
