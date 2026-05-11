import simpleGit from "simple-git";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const cloneRepo = async (repoUrl) => {
  const sessionId = uuidv4();
  const repoPath = path.join("temp", sessionId);

  await fs.ensureDir(repoPath);

  const git = simpleGit();
  await git.clone(repoUrl, repoPath);

  return { sessionId, repoPath };
};
