import express from "express";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();

router.get("/files/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  const { data, error } = await supabase
    .from("code_chunks")
    .select("file_path, code, name")
    .eq("session_id", sessionId);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch files" });
  }

  const uniqueFiles = {};
  data.forEach((item) => {
    if (!uniqueFiles[item.file_path]) {
      uniqueFiles[item.file_path] = item;
    }
  });

  res.json(Object.values(uniqueFiles));
});

export default router;
