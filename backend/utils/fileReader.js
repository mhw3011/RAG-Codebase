import fs from "fs";
import path from "path";

const allowedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".html",
  ".py",
  ".java",
  ".cpp",
  ".c",
];

const ignoredFiles = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "vite.config.js",
  "eslint.config.js",
];

const ignoredFolders = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
];

export const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    // ignore folders
    if (fs.statSync(fullPath).isDirectory() && ignoredFolders.includes(file)) {
      return;
    }

    // recurse folders
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(fullPath);

      // ignore unwanted files
      if (ignoredFiles.includes(file)) {
        return;
      }

      // allow only code files
      if (allowedExtensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
};
