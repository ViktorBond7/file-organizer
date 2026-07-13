import { pipeline } from "stream/promises";
import fs from "fs";
import fsp from "fs/promises";
import path from "node:path";
import readDir from "../repository/readDir.js";
import { EventEmitter } from "events";
import totalFileCount from "../utils/totalFileCount.js";

const categories = {
  Documents: [".pdf", ".docx", ".doc", ".txt", ".md", ".xlsx", ".pptx"],
  Images: [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"],
  Archives: [".zip", ".rar", ".tar", ".gz", ".7z"],
  Code: [".js", ".py", ".java", ".cpp", ".html", ".css", ".json"],
  Videos: [".mp4", ".avi", ".mkv", ".mov", ".webm"],
  Other: [],
};

const TEN_MB = 10 * 1024 * 1024;

export class Organizer extends EventEmitter {
  constructor() {
    super();
    this.extensionMap = new Map();
    this.processedFiles = 0;
    this.totalCopiedSize = 0;
    this.categoryCounts = Object.fromEntries(
      Object.keys(categories).map((category) => [category, 0]),
    );

    for (const [category, exts] of Object.entries(categories)) {
      for (const ext of exts) {
        this.extensionMap.set(ext.toLowerCase(), category);
      }
    }
  }

  getCategoryForExtension(ext) {
    return this.extensionMap.get(ext.toLowerCase()) ?? "Other";
  }

  async pathExists(filePath) {
    try {
      await fsp.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getUniqueTargetPath(initialTargetPath) {
    if (!(await this.pathExists(initialTargetPath))) {
      return initialTargetPath;
    }

    const dir = path.dirname(initialTargetPath);
    const ext = path.extname(initialTargetPath);
    const baseName = path.basename(initialTargetPath, ext);

    let counter = 1;
    while (true) {
      const candidatePath = path.join(dir, `${baseName}(${counter})${ext}`);
      if (!(await this.pathExists(candidatePath))) {
        return candidatePath;
      }
      counter++;
    }
  }

  async copyFile(sourcePath, targetPath, size) {
    if (size < TEN_MB) {
      await fsp.copyFile(sourcePath, targetPath);
      return;
    } else {
      await pipeline(
        fs.createReadStream(sourcePath),
        fs.createWriteStream(targetPath),
      );
    }
  }

  async createCategoryDirectories(sourcePath, targetPath) {
    this.emit("folders-create-start", { sourcePath, targetPath });

    for (const category of Object.keys(categories)) {
      await fsp.mkdir(path.join(targetPath, category), {
        recursive: true,
      });
      this.emit("directory-created", { category });
    }
  }

  async organize(sourcePath, targetPath) {
    try {
      this.processedFiles = 0;
      this.totalCopiedSize = 0;
      this.categoryCounts = Object.fromEntries(
        Object.keys(categories).map((category) => [category, 0]),
      );

      const entries = await readDir(sourcePath);

      const entriesLength = totalFileCount(entries);
      // create category directories in the target path
      await this.createCategoryDirectories(sourcePath, targetPath);

      for (const entry of entries) {
        if (entry.isFile()) {
          const fullPath = path.join(entry.parentPath, entry.name);

          const category = this.getCategoryForExtension(
            path.extname(entry.name).toLowerCase(),
          );

          const categoryPath = path.join(targetPath, category);

          const targetFilePath = await this.getUniqueTargetPath(
            path.join(categoryPath, entry.name),
          );

          const stats = (await fsp.stat(fullPath)).size;
          const currentFileIndex = this.processedFiles + 1;

          this.emit("copy-start", {
            sourceFilePath: fullPath,
            targetFilePath,
            totalFiles: entriesLength,
            currentFileIndex,
          });

          await this.copyFile(fullPath, targetFilePath, stats);

          this.processedFiles = currentFileIndex;
          this.totalCopiedSize += stats;
          this.categoryCounts[category]++;
        }
      }

      this.emit("copy-complete", {
        sourcePath,
        targetPath,
        totalCopied: this.processedFiles,
        totalCopiedSize: this.totalCopiedSize,
        categories: Object.entries(this.categoryCounts).map(
          ([category, count]) => ({
            category,
            count,
            outputPath: path.join(targetPath, category),
          }),
        ),
      });
    } catch (error) {
      this.emit("copy-error", { sourcePath, targetPath, error });
      throw error;
    }
  }
}
