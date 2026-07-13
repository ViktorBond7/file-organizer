import drawProgressBar from "../utils/drawProgressBar.js";
import formatSize from "../utils/formatSize.js";
import path from "node:path";

export const onFoldersCreateStart = ({ sourcePath, targetPath }) => {
  console.log(`📦 Organizing: ${sourcePath}`);
  console.log(`Target: ${targetPath}`);
  console.log("");
  console.log("Creating folders...");
};

export const onCreatedDirectory = ({ category }) => {
  console.log(`  ✓ ${category}/`);
};

export const onFileFoundInOrganizer = ({ totalFiles, currentFileIndex }) => {
  const progress = drawProgressBar(currentFileIndex, totalFiles);

  if (process.stdout.isTTY) {
    process.stdout.write(`\rCopying files... ${progress}`);
    return;
  }

  console.log(`Copying files... ${progress}`);
};

export const onOrganizeComplete = ({
  categories,
  totalCopied,
  totalCopiedSize,
  targetPath,
}) => {
  if (process.stdout.isTTY) {
    process.stdout.write("\n");
  }

  const rootLabel = path.basename(targetPath) || targetPath;

  console.log("\n✅ Organization complete!\n");
  console.log("Summary:");

  categories.forEach(({ category, count }) => {
    const categoryLabel = `${category}:`.padEnd(12, " ");
    console.log(
      `  ${categoryLabel} ${String(count)} files → ${rootLabel}/${category}/`,
    );
  });

  console.log(
    `\nTotal copied: ${totalCopied} files (${formatSize(totalCopiedSize)})`,
  );
};
