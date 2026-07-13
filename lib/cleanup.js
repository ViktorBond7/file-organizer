// node file-organizer.js cleanup /path/to/directory --older-than 90 --confirm

import { EventEmitter } from "events";
import fs from "fs";
import fsp from "fs/promises";
import path from "node:path";
import readDir from "../repository/readDir.js";
import totalFileCount from "../utils/totalFileCount.js";

export class Cleanup extends EventEmitter {
  constructor() {
    super();
    this.filesToDelete = [];
  }

  async infoFile(filePath) {
    const stats = await fsp.stat(filePath);
    const modifiedDate = stats.mtime;
    const fileAge = Date.now() - modifiedDate.getTime();
    const fileSize = stats.size;

    return {
      ageInDays: Math.trunc(fileAge / (1000 * 60 * 60 * 24)),
      size: fileSize,
      modifiedDate,
    };
  }

  async cleanup(directory, olderThanDays, confirmDeletion = false) {
    this.filesToDelete = [];
    this.processedFiles = 0;
    this.olderThanDays = olderThanDays;
    this.confirmDeletion = confirmDeletion;

    const entries = await readDir(directory);
    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = path.join(entry.parentPath, entry.name);
        const { ageInDays, size, modifiedDate } = await this.infoFile(fullPath);

        if (ageInDays > olderThanDays) {
          this.filesToDelete.push({
            fullPath,
            name: entry.name,
            ageInDays,
            size,
            modifiedDate,
          });
        }
      }
    }
    this.emit("file-found", {
      infoFile: this.filesToDelete,
    });
    // this.emit("file-deleted", {
    //   fullPath,
    //   ageInDays,
    //   totalFiles: this.filesToDelete,
    //   currentFileIndex: ++this.processedFiles,
    // });
    // this.emit("cleanup-complete", {
    //   totalFiles: this.filesToDelete.length,
    //   totalSize: await this.calculateTotalSize(),
    // });
  }
}
