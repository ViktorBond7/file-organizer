import fs from "node:fs/promises";

const readDir = async (filePath) =>
  await fs.readdir(filePath, {
    withFileTypes: true,
    recursive: true,
  });

export default readDir;
