import express from "express";
import uploadRoute from "./routes/upload.js";
import queryRoute from "./routes/query.js";
import filesRoute from "./routes/files.js";

import "dotenv/config";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", uploadRoute);
app.use("/api", queryRoute);
app.use("/api", filesRoute);
app.get("/", (req, res) => {
  res.send("Codebase RAG running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
