function drawProgressBar(current, total, width = 20) {
  if (total <= 0) {
    return `${"░".repeat(width)} 0/0`;
  }

  const percentage = current / total;
  const filled = Math.round(percentage * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  return `${bar} ${current}/${total}`;
}

export default drawProgressBar;

// if (total <= 0) {
//   return `${"░".repeat(width)} 0/0`;
// }
