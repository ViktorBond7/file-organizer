import { Scanner } from "./lib/scanner.js";
import formatSize from "./utils/formatSize.js";
import process from "node:process";

const targetPath = process.argv[2];

const scanner = new Scanner();

scanner.on("file-found", ({ path, size, mtime }) => {
  console.log(
    `File found: ${path}, Size: ${formatSize(size)}, Modified: ${mtime}`,
  );
});

scanner.on(
  "scan-complete",
  (
    { totalFiles, totalSize, extensions },
    byAge,
    top3LargeFiles,
    oldestFile,
  ) => {
    console.log("📊 Scan Results:");
    console.log("━".repeat(60));
    console.log(
      `Total files: ${totalFiles}\nTotal Size: ${formatSize(totalSize)}`,
    );
    console.log("━".repeat(60));
    console.log("Extension Statistics:");
    console.log("━".repeat(60));
    extensions.forEach(({ extension, count, size }) => {
      console.log(`${extension}, Count: ${count}, Size: ${formatSize(size)}`);
    });
    console.log("━".repeat(60));
    console.log("File Age:");
    console.log("━".repeat(60));
    console.log(`Files modified in the last 7 days: ${byAge.last7Days}`);
    console.log(`Files modified in the last 30 days: ${byAge.last30Days}`);
    console.log(`Files older than 90 days: ${byAge.olderThan90Days}`);
    console.log("━".repeat(60));
    console.log("Largest files:");
    console.log("━".repeat(60));
    top3LargeFiles.forEach(({ path, size }, i) => {
      console.log(`${i + 1}. ${path}, ${formatSize(size)}`);
    });

    console.log("━".repeat(60));
    console.log("Oldest File:");
    console.log("━".repeat(60));
    console.log(
      `Oldest file: ${oldestFile.name}, Modified: ${oldestFile.modified} days ago`,
    );
  },
);

scanner.scan(targetPath);
