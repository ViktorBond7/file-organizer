import formatSize from "../utils/formatSize.js";
import process from "node:process";
import drawProgressBar from "../utils/drawProgressBar.js";

export const onFileFound = ({
  path,
  size,
  mtime,
  totalFiles,
  currentFileIndex,
}) => {
  const progress = drawProgressBar(currentFileIndex, totalFiles);

  console.log(`📂 Scanning: ${path}` + `\nProcessing... ${progress} files`);
};

export const onScanComplete = (
  { totalFiles, totalSize, extensions },
  byAge,
  top3LargeFiles,
  oldestFile,
) => {
  if (process.stdout.isTTY) {
    process.stdout.write("\n");
  }
  console.log("\n");
  console.log("📊 Scan Results:");
  console.log("━".repeat(60));
  console.log(
    `Total files: ${totalFiles}\nTotal Size: ${formatSize(totalSize)}`,
  );
  console.log("\n");
  console.log("━".repeat(60));
  console.log("Extension Statistics:");
  console.log("━".repeat(60));
  extensions.forEach(({ extension, count, size }) => {
    console.log(
      `${"  "}${extension}, Count: ${count}, Size: ${formatSize(size)}`,
    );
  });
  console.log("\n");
  console.log("━".repeat(60));
  console.log("File Age:");
  console.log("━".repeat(60));
  console.log(`${"  "}Files modified in the last 7 days: ${byAge.last7Days}`);
  console.log(`${"  "}Files modified in the last 30 days: ${byAge.last30Days}`);
  console.log(`${"  "}Files older than 90 days: ${byAge.olderThan90Days}`);
  console.log("\n");

  console.log("━".repeat(60));
  console.log("Largest files:");
  console.log("━".repeat(60));
  top3LargeFiles.forEach(({ name, size }, i) => {
    console.log(`${"  "}${i + 1}. ${name}, ${formatSize(size)}`);
  });
  console.log("\n");

  console.log(
    `Oldest file: ${oldestFile.name}, Modified: ${oldestFile.modified} days ago`,
  );
};
