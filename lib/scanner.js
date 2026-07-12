import { EventEmitter } from "events";
import fs from "fs/promises";
import path from "path";
import getFileAgeInDays from "../utils/getFileAgeInDays.js";

export class Scanner extends EventEmitter {
  constructor() {
    super();
    this.resetStatistics();
  }

  resetStatistics() {
    this.statisticsExtensions = new Map();
    this.totalFiles = 0;
    this.totalSize = 0;
    this.byAge = {
      last7Days: 0,
      last30Days: 0,
      olderThan90Days: 0,
    };
    this.top3LargeFiles = [];
    this.oldestFile = null;
  }

  updateExtensionStats(fileName, size) {
    const ext = path.extname(fileName) || "(other)";
    if (!this.statisticsExtensions.has(ext)) {
      this.statisticsExtensions.set(ext, { count: 0, size: 0 });
    }
    const extStats = this.statisticsExtensions.get(ext);
    extStats.count++;
    extStats.size += size;
  }

  updateAgeStats(days) {
    if (days <= 7) this.byAge.last7Days++;
    if (days <= 30) this.byAge.last30Days++;
    if (days > 90) this.byAge.olderThan90Days++;
  }

  updateTopFiles(file) {
    this.top3LargeFiles.push({ name: file.name, size: file.size });
    this.top3LargeFiles.sort((a, b) => b.size - a.size);

    if (this.top3LargeFiles.length > 3) {
      this.top3LargeFiles.pop();
    }
  }

  updateOldestFile(name, mtime, days) {
    if (!this.oldestFile || mtime < this.oldestFile.mtime) {
      this.oldestFile = {
        name,
        mtime,
        modified: days,
      };
    }
  }

  getStatistics() {
    return {
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
  }

  async scan(directory) {
    this.resetStatistics();

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

          this.updateExtensionStats(entry.name, fileStat.size);

          const diffDays = getFileAgeInDays(fileStat.mtime);

          // Age distribution
          this.updateAgeStats(diffDays);

          // Top-3 largest files
          this.updateTopFiles({ name: entry.name, size: fileStat.size });

          // Oldest file
          this.updateOldestFile(entry.name, fileStat.mtime, diffDays);

          const fileData = {
            path: fullPath,
            size: fileStat.size,
            mtime: fileStat.mtime,
          };

          this.emit("file-found", fileData);
        }
      }

      this.emit(
        "scan-complete",
        this.getStatistics(),
        this.byAge,
        this.top3LargeFiles,
        this.oldestFile,
      );
    } catch (error) {
      this.emit("scan-error", { directory, error });
      // if (error.code === "ENOENT") {
      //   console.error(`❌ Error: Directory not found: ${directory}`);
      // } else if (error.code === "EACCES") {
      //   console.error(`❌ Error: Permission denied: ${directory}`);
      // } else {
      //   console.error(`❌ Unexpected error: ${error.message}`);
      // }
      // process.exit(1);
      throw error;
    }
  }
}
