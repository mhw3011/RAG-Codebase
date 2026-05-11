import fs from "fs";

const CHUNK_SIZE = 120;

export const extractCodeChunks = (filePath) => {
  const code = fs.readFileSync(filePath, "utf-8");

  const lines = code.split("\n");

  const chunks = [];

  // small file → single chunk
  if (lines.length <= CHUNK_SIZE) {
    chunks.push({
      type: "file",
      name: `${filePath.split(/[\\/]/).pop()}_1`,
      code,
      startLine: 1,
      endLine: lines.length,
    });

    return chunks;
  }

  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const chunkLines = lines.slice(i, i + CHUNK_SIZE);

    chunks.push({
      type: "chunk",
      name: `${filePath.split(/[\\/]/).pop()}_${i + 1}`,
      code: chunkLines.join("\n"),
      startLine: i + 1,
      endLine: Math.min(i + CHUNK_SIZE, lines.length),
    });
  }

  return chunks;
};
