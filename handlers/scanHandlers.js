import formatSize from "../utils/formatSize.js";
import process from "node:process";

export const onFileFound = ({ path, size, mtime }) => {
  console.log(
    `File found: ${path}, Size: ${formatSize(size)}, Modified: ${mtime}`,
  );
};

export const onScanComplete = (
  { totalFiles, totalSize, extensions },
  byAge,
  top3LargeFiles,
  oldestFile,
) => {
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

export const onScanError = ({ directory, error }) => {
  if (error.code === "ENOENT") {
    console.error(`❌ Error: Directory not found: ${directory}`);
  } else if (error.code === "EACCES") {
    console.error(`❌ Error: Permission denied: ${directory}`);
  } else {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
  process.exit(1);
};
