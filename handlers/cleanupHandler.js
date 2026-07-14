import formatSize from "../utils/formatSize.js";
import drawProgressBar from "../utils/drawProgressBar.js";

export const onFileFoundInCleanup = ({ infoFile, totalSizeFiles }) => {
  const fiorstThreeFiles = infoFile.slice(0, 3);
  console.log(`\nFound ${infoFile.length} files to delete:` + `\n`);

  fiorstThreeFiles.forEach(
    ({ fullPath, name, ageInDays, size, modifiedDate }, i) => {
      console.log(
        `${name}` +
          ` \n${"  "}Size: ${formatSize(size)}` +
          ` \n${"  "}Modified: ${ageInDays} days ago (${modifiedDate.toLocaleDateString("sv-SE")})` +
          `\n`,
      );
      if (i === 2) {
        console.log(`\n... (${infoFile.length - 3} more files)`);
      }
    },
  );
  console.log("  ");
  console.log(
    `Total: ${infoFile.length} files (${formatSize(totalSizeFiles)})`,
  );
  console.log(
    `\n⚠️  DRY RUN MODE: No files were deleted.` +
      `\nTo actually delete these files, run with --confirm flag.`,
  );
};

export const onCleanupDelete = ({
  totalFiles,
  listFiles,
  totalSize,
  processedFiles,
}) => {
  console.log(`\nFound ${totalFiles} files to delete:` + `\n`);
  listFiles.forEach(({ name, ageInDays, size, modifiedDate }, i) => {
    console.log(`\r${name}`);
  });
  console.log(
    `⚠️  DELETING ${totalFiles} files (${formatSize(totalSize)}). This action cannot be undone!`,
  );
  console.log(`\rDeleting... ${drawProgressBar(processedFiles, totalFiles)}`);
};

export const onCleanupComplete = ({ totalFiles, totalSize }) => {
  console.log(`\n✅ Cleanup complete!`);
  console.log(`Deleted: ${totalFiles} files (${formatSize(totalSize)} freed)`);
};
