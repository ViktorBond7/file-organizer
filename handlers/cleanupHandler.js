import formatSize from "../utils/formatSize.js";

export const onFileFoundInCleanup = ({ infoFile }) => {
  const fiorstThreeFiles = infoFile.slice(0, 3);
  console.log(`\nFound ${infoFile.length} files to delete:` + `\n`);

  fiorstThreeFiles.forEach(
    ({ fullPath, name, ageInDays, size, modifiedDate }, i) => {
      console.log(
        `${name}` +
          ` \n${"  "}Size: ${formatSize(size)}` +
          ` \n${"  "}Modified: ${ageInDays} days ago (${new Date(modifiedDate.toLocaleDateString("sv-SE"))})` +
          `\n`,
      );
      if (i === 2) {
        console.log(`\n... (${infoFile.length - 3} more files)`);
      }
      console.log("  ");
      console.log(
        `Total: ${infoFile.length} files (${formatSize(infoFile.reduce((acc, { size }) => acc + size, 0))})`,
      );
      console.log(
        `\n⚠️  DRY RUN MODE: No files were deleted.` +
          `\nTo actually delete these files, run with --confirm flag.`,
      );
    },
  );
};
