export const onError = ({ directory, error }) => {
  if (error.code === "ENOENT") {
    console.error(`❌ Error: Directory not found: ${directory}`);
  } else if (error.code === "EACCES") {
    console.error(`❌ Error: Permission denied: ${directory}`);
  } else {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
  process.exit(1);
};
