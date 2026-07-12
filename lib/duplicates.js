import crypto from "crypto";
import fs from "fs";
import fsp from "fs/promises";
import { EventEmitter } from "events";
import path from "node:path";
import readDir from "../repository/readDir.js";
import totalFileCount from "../utils/totalFileCount.js";

export class DuplicateFinder extends EventEmitter {
  constructor() {
    super();
    this.hashMap = new Map();
    this.processedFiles = 0;
  }
  secret = "sha256";

  async findDuplicates(filePath) {
    try {
      this.hashMap.clear();
      this.processedFiles = 0;
      const entries = await readDir(filePath);
      const entriesLength = totalFileCount(entries);

      for (const entry of entries) {
        if (entry.isFile()) {
          const fullPath = path.join(entry.parentPath, entry.name);
          const size = (await fsp.stat(fullPath)).size;

          const hash = await this.calculateHash(fullPath);

          if (!this.hashMap.has(hash)) {
            this.hashMap.set(hash, []);
          }
          this.hashMap.get(hash).push({ path: fullPath, size });

          this.processedFiles++;
          this.emit("file-processed", {
            fullPath,
            entriesLength,
            currentFileIndex: this.processedFiles,
          });
        }
      }
      const duplicates = [];
      const totalDuplicateSize = Array.from(this.hashMap.values())
        .filter((files) => files.length > 1)
        .reduce((acc, files) => acc + files[0].size * (files.length - 1), 0);

      for (const [hash, fileInfos] of this.hashMap.entries()) {
        if (fileInfos.length > 1) {
          duplicates.push({ hash, fileInfos });
        }
      }

      this.emit("duplicates-found", {
        duplicates,
        totalDuplicateSize,
        secret: this.secret,
      });
    } catch (error) {
      this.emit("error", { directory: filePath, error });
      throw error;
    }
  }

  async calculateHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(this.secret);
      const stream = fs.createReadStream(filePath);

      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }
}
