function getFileAgeInDays(mtime) {
  return Math.ceil((Date.now() - mtime.getTime()) / (1000 * 60 * 60 * 24));
}

export default getFileAgeInDays;
