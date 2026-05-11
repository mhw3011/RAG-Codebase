import fs from "fs";
import path from "path";

const allowedExtensions = [".js", ".ts"];

export const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (allowedExtensions.includes(path.extname(fullPath))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
};
