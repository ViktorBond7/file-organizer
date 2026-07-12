import formatSize from "../utils/formatSize.js";
import formatSecretHash from "../utils/formatSecretHash.js";
import drawProgressBar from "../utils/drawProgressBar.js";

export const onFileFoundInDuplicates = ({
  fullPath,
  entriesLength,
  currentFileIndex,
}) => {
  const progress = drawProgressBar(currentFileIndex, entriesLength);
  console.log(
    `🔍 Searching for duplicates in: ${fullPath}` + `\nProcessed: ${progress}`,
  );
};

export const onDuplicatesFound = ({
  duplicates,
  totalDuplicateSize,
  secret = "sha256",
}) => {
  if (duplicates.length === 0) {
    console.log("No duplicate files found.");
  } else {
    console.log(
      `\nFound ${duplicates.length} duplicate groups (${formatSize(totalDuplicateSize)} wasted):`,
    );
    duplicates.forEach(({ hash, fileInfos }, i) => {
      console.log(
        `\nGroup ${i + 1} (${fileInfos.length} copies, ${formatSize(fileInfos[0].size)} each):` +
          `\n${formatSecretHash(secret)}: ${hash.slice(0, 12)}...` +
          `\n`,
      );
      fileInfos.forEach((fileInfo) => {
        console.log(
          `  - ${fileInfo.path} (Size: ${formatSize(fileInfo.size)})`,
        );
      });
      console.log(
        `\n` +
          `Wasted space: ${formatSize(fileInfos[0].size * fileInfos.length - fileInfos[0].size)}`,
      );
    });
    console.log(`\n` + `Total wasted space: ${formatSize(totalDuplicateSize)}`);
  }
};
