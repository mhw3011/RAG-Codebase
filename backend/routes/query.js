import express from "express";
import "dotenv/config";
import OpenAI from "openai";

import { getEmbedding } from "../services/embeddingService.js";
import { supabase } from "../services/supabaseClient.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cleanFilePath = (path = "") =>
  path.replace(/temp[\\/][^\\/]+[\\/]/g, "").replace(/\\/g, "/");

router.post("/query", async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question || !sessionId) {
      return res.status(400).json({ error: "missing input" });
    }

    const queryEmbedding = await getEmbedding(question);

    const { data: chunks, error } = await supabase.rpc("match_code_chunks", {
      query_embedding: queryEmbedding,
      match_count: 6,
      session_filter: sessionId,
    });

    if (error) {
      return res.status(500).json({ error: "db error" });
    }

    if (!chunks?.length) {
      return res.json({
        answer: "No relevant code found",
        sources: [],
      });
    }

    const context = chunks
      .map((c) => `File: ${c.file_path}\nFunction: ${c.name}\nCode:\n${c.code}`)
      .join("\n\n---\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a STRICT codebase QA engine.

YOU MUST FOLLOW THESE RULES:

1. Use ONLY the minimal code required to answer the question.
2. DO NOT list all retrieved chunks.
3. DO NOT include unrelated files or functions.
4. If a file/function is not directly used in the explanation → DO NOT mention it.
5. Prefer 1–3 MOST RELEVANT functions only.
6. If multiple chunks are retrieved, FILTER them mentally and use only relevant ones.
7.Do NOT output temp paths.


OUTPUT FORMAT:

Section 1: 

give answer to the question the user asked regarding STICTLY only the files NOT any other thoery.





section 2:

Function: <name>
File: <path>
Purpose: <one line>
Logic(be technical try to use code to explain):
1. step one
2. step two
3. step three
4.step four




IMPORTANT RULE:
- If a function/file is not explicitly used in Logic → DO NOT include it in response.

At the end:


`,
        },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${question}
`,
        },
      ],
    });

    let raw = completion.choices[0].message.content;

    // 🔥 CLEAN ALL TEMP PATHS
    raw = raw.replace(/temp[\\/][^\\/]+[\\/]/g, "");

    // 🔥 BUILD FULL SOURCE OBJECTS WITH CODE (IMPORTANT FIX)
    const sources = chunks
      .filter((c) => raw.toLowerCase().includes((c.name || "").toLowerCase()))
      .map((c) => ({
        file: cleanFilePath(c.file_path),
        function: c.name,
        code: c.code, // ✅ FIX FOR MODAL
      }));

    return res.json({
      answer: raw,
      sources,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed" });
  }
});

export default router;
