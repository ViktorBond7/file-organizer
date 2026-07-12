import fs from "node:fs/promises";

const readFile = async (filePath) =>
  await fs.readdir(filePath, {
    withFileTypes: true,
    recursive: true,
  });

export default readFile;
