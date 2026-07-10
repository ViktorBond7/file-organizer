function processFileForReport(file) {
    const now = new Date();
    // Compute the difference in days between now and the file's modified date
    const diffTime = Math.abs(now - file.modified);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 1. General counters
    this.totalCount++;
    this.totalSize += file.size;

    // 2. Statistics by extensions
    if (!this.byExtension.has(file.extension)) {
      this.byExtension.set(file.extension, { count: 0, totalSize: 0 });
    }
    const extStat = this.byExtension.get(file.extension);
    extStat.count++;
    extStat.totalSize += file.size;

    // 3. Age distribution
    if (diffDays <= 7) this.byAge.last7Days++;
    if (diffDays <= 30) this.byAge.last30Days++;
    if (diffDays > 90) this.byAge.olderThan90Days++;

    // 4. Top-3 largest files
    this.top3LargeFiles.push({ path: file.path, size: file.size });
    this.top3LargeFiles.sort((a, b) => b.size - a.size); // sort descending by size
    if (this.top3LargeFiles.length > 3) {
      this.top3LargeFiles.pop(); // remove the smallest if more than 3
    }

    // 5. Oldest file
    if (!this.oldestFile || file.modified < this.oldestFile.modified) {
      this.oldestFile = { path: file.path, modified: file.modified };
    }
}
  
export default processFileForReport;