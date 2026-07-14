# File Organizer CLI

A CLI tool for:

- directory scanning (`scan`),
- duplicate detection (`duplicates`),
- file organization by category (`organize`),
- deleting old files (`cleanup`).

## Installation

1. Install dependencies:

npm install

2. Run commands via `npm run`.

## Commands

### 1) Scan

Scans a folder and shows:

- progress,
- extension statistics,
- file age distribution,
- top 3 largest files,
- oldest file.

Example:

npm run scan -- "D:/cv"

> Important: after `npm run scan`, use `--` or arguments may not be passed to the script.

---

### 2) Duplicates

Finds duplicate files by SHA-256 hash and shows:

- duplicate groups,
- wasted space,
- processing progress.

Example:

npm run duplicates -- "D:/cv"

---

### 3) Organize

Copies files from source to target by categories:

- `Documents`,
- `Images`,
- `Archives`,
- `Code`,
- `Videos`,
- `Other`.

Example:

npm run organize -- "D:/cv" --output "D:/aa"

During copy:

- category folders are created,
- a progress bar is displayed,
- a final summary is printed.

If a file with the same name already exists, a unique name is generated:

- `file.pdf`
- `file(1).pdf`
- `file(2).pdf`

---

### 4) Cleanup

Finds files older than N days and can delete them.

Dry run (preview only, no deletion):

npm run cleanup -- "D:/cv" --older-than 30

Delete mode:

npm run cleanup -- "D:/cv" --older-than 30 --confirm

---

## Common Errors

### `missing required argument 'directory'`

You did not pass a path for `scan` or `duplicates`.

Correct:

npm run scan -- "C:/Users/you/Downloads"

### `required option '-o, --output <target>' not specified`

You did not pass `--output` for `organize`, or passed it without a space.

Incorrect:

npm run organize "D:\cv"--output "D:\aa"

Correct:

npm run organize -- "D:/cv" --output "D:/aa"

### `required option '-o, --older-than <days>' not specified`

You did not pass the number of days for `cleanup`.

Correct:

npm run cleanup -- "D:/cv" --older-than 30

---

## Stack

- Node.js (ES Modules)
- Commander
- EventEmitter
