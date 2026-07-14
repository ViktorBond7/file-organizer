import { EventEmitter } from "events";
import fsp from "fs/promises";
import path from "node:path";
import readDir from "../repository/readDir.js";

const DAY = 1000 * 60 * 60 * 24;

export class Cleanup extends EventEmitter {
  constructor() {
    super();
    this.resetState();
  }

  resetState() {
    this.filesToDelete = [];
    this.totalSize = 0;
    this.processedFiles = 0;
  }

  async getFileInfo(filePath) {
    const stats = await fsp.stat(filePath);

    return {
      ageInDays: Math.trunc((Date.now() - stats.mtime.getTime()) / DAY),
      size: stats.size,
      modifiedDate: stats.mtime,
    };
  }

  async findFiles(directory, olderThanDays, confirmDeletion) {
    const entries = await readDir(directory);

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const fullPath = path.join(entry.parentPath, entry.name);

      const info = await this.getFileInfo(fullPath);

      if (info.ageInDays <= olderThanDays) continue;

      const file = {
        fullPath,
        name: entry.name,
        ...info,
      };

      this.filesToDelete.push(file);
      this.totalSize += info.size;
    }

    if (!confirmDeletion) {
      this.emit("file-found", {
        infoFile: this.filesToDelete,
        totalSizeFiles: this.totalSize,
      });
    }
  }

  async deleteFiles(confirmDeletion) {
    for (const file of this.filesToDelete) {
      await fsp.unlink(file.fullPath);

      this.processedFiles++;
    }
    if (confirmDeletion) {
      this.emit("file-deleted", {
        totalFiles: this.filesToDelete.length,
        listFiles: this.filesToDelete,
        totalSize: this.totalSize,
        processedFiles: this.processedFiles,
      });
    }
  }

  async cleanup(directory, olderThanDays, confirmDeletion = false) {
    this.resetState();

    try {
      await this.findFiles(directory, olderThanDays, confirmDeletion);

      if (confirmDeletion) {
        await this.deleteFiles(confirmDeletion);
        this.emit("cleanup-complete", {
          totalFiles: this.filesToDelete.length,
          totalSize: this.totalSize,
        });
      }
    } catch (error) {
      this.emit("cleanup-error", {
        directory,
        error,
      });
      throw error;
    }
  }
}
