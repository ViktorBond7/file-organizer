import { EventEmitter } from "events";
import fs from "fs/promises";

import path from "path";

// import processFileForReport from "./utils/processFileForReport.js";

// const command = process.argv[2];
// const targetPath = process.argv[3];
// console.log(`Scanning directory: ${targetPath}`);

export class Scanner extends EventEmitter {
  constructor() {
    super();
    this.statisticsExtensions = new Map();
    this.totalFiles = 0;
    this.totalSize = 0;
    this.byAge = { last7Days: 0, last30Days: 0, olderThan90Days: 0 };
    this.top3LargeFiles = [];
    this.oldestFile = null;
  }

  async scan(directory) {
    this.statisticsExtensions = new Map();
    this.totalFiles = 0;
    this.totalSize = 0;
    this.byAge = { last7Days: 0, last30Days: 0, olderThan90Days: 0 };
    this.top3LargeFiles = [];
    this.oldestFile = null;
    try {
      const entries = await fs.readdir(directory, {
        recursive: true,
        withFileTypes: true,
      });

      for (const entry of entries) {
        const fullPath = path.join(entry.parentPath, entry.name);

        if (entry.isFile()) {
          this.totalFiles++;

          const fileStat = await fs.stat(fullPath);

          this.totalSize += fileStat.size;

          const ext = path.extname(entry.name) || "(other)";

          if (!this.statisticsExtensions.has(ext)) {
            this.statisticsExtensions.set(ext, { count: 0, size: 0 });
          }
          const extStats = this.statisticsExtensions.get(ext);

          extStats.count++;
          extStats.size += fileStat.size;

          const now = new Date();

          // Compute the difference in days between now and the file's modified date
          const diffTime = Math.abs(now - fileStat.mtime);

          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // 3. Age distribution
          if (diffDays <= 7) this.byAge.last7Days++;
          if (diffDays <= 30) this.byAge.last30Days++;
          if (diffDays > 90) this.byAge.olderThan90Days++;

          // 4. Top-3 largest files
          this.top3LargeFiles.push({ path: entry.name, size: fileStat.size });
          this.top3LargeFiles.sort((a, b) => b.size - a.size); // sort descending by size
          if (this.top3LargeFiles.length > 3) {
            this.top3LargeFiles.pop(); // remove the smallest if more than 3
          }

          // 5. Oldest file
          if (!this.oldestFile || fileStat.mtime < this.oldestFile.mtime) {
            this.oldestFile = {
              name: entry.name,
              mtime: fileStat.mtime,
              modified: diffDays,
            };
          }

          const fileData = {
            path: fullPath,
            size: fileStat.size,
            mtime: fileStat.mtime,
          };

          this.emit("file-found", fileData);
        }
      }

      const statistics = {
        totalFiles: this.totalFiles,
        totalSize: this.totalSize,
        extensions: Array.from(this.statisticsExtensions.entries()).map(
          ([extension, { count, size }]) => ({
            extension,
            count,
            size,
          }),
        ),
      };

      this.emit(
        "scan-complete",
        statistics,
        this.byAge,
        this.top3LargeFiles,
        this.oldestFile,
      );
    } catch (error) {
      if (error.code === "ENOENT") {
        console.error(`❌ Error: Directory not found: ${directory}`);
      } else if (error.code === "EACCES") {
        console.error(`❌ Error: Permission denied: ${directory}`);
      } else {
        console.error(`❌ Unexpected error: ${error.message}`);
      }
      process.exit(1);
    }
  }
}
