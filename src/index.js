import process from "node:process";
import { EventEmitter } from "events";
import fs from "fs/promises";
import path from "path";

import formatSize from "../utils/formatSize.js";

const command = process.argv[2];
const targetPath = process.argv[3];
console.log(`Scanning directory: ${targetPath}`);

class Scanner extends EventEmitter {
  constructor() {
    super();
    this.statisticsExtensions = new Map();
    this.totalFiles = 0;
    this.totalSize = 0;
  }

  async scanFile(currentPath) {
    /////
    const entries = await fs.readdir(currentPath, {
      withFileTypes: true,
      recursive: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(entry.parentPath, entry.name);

      if (entry.isFile()) {
        this.totalFiles++;

        const fileStat = await fs.stat(fullPath);

        this.totalSize += fileStat.size;

        const ext = path.extname(entry.name) || "no_extension";
        if (!this.statisticsExtensions.has(ext)) {
          this.statisticsExtensions.set(ext, { count: 0, size: 0 });
        }
        const extStats = this.statisticsExtensions.get(ext);
        extStats.count++;
        extStats.size += fileStat.size;
      }
    }

    this.emit("file-found", this.totalFiles, this.totalSize);
  }
  scanComplete(statistics) {
    this.emit("scan-complete", statistics);
  }
}

const scanner = new Scanner();
scanner.on("file-found", (totalFiles, totalSize) => {
  console.log(
    `Files found: ${totalFiles}, Total size: ${formatSize(totalSize)}`,
  );
});

if (command === "scan") {
  scanner.scanFile(targetPath);
}
