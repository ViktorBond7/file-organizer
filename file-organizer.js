import { Scanner } from "./lib/scanner.js";
import { DuplicateFinder } from "./lib/duplicates.js";
import { Cleanup } from "./lib/cleanup.js";
import { Command } from "commander";
import { onFileFound, onScanComplete } from "./handlers/scanHandlers.js";
import {
  onFileFoundInOrganizer,
  onCreatedDirectory,
  onFoldersCreateStart,
  onOrganizeComplete,
} from "./handlers/organizeHandler.js";
import { Organizer } from "./lib/organizer.js";
import {
  onDuplicatesFound,
  onFileFoundInDuplicates,
} from "./handlers/duplicatesHandler.js";
import { onError } from "./handlers/errorHandler.js";
import {
  onFileFoundInCleanup,
  onCleanupDelete,
  onCleanupComplete,
} from "./handlers/cleanupHandler.js";

const program = new Command();

program
  .name("file-organizer")
  .description("CLI tool to organize files")
  .version("1.0.0");

program
  .command("scan <directory>")
  .description("Scan directory and show statistics")
  .action(async (directory) => {
    const scanner = new Scanner();

    scanner.on("file-found", onFileFound);
    scanner.on("scan-complete", onScanComplete);
    scanner.on("scan-error", onError);

    await scanner.scan(directory);
  });

program
  .command("duplicates <directory>")
  .description("Find duplicate files in a directory")
  .action(async (directory) => {
    const duplicateFinder = new DuplicateFinder();

    duplicateFinder.on("file-processed", onFileFoundInDuplicates);

    duplicateFinder.on("duplicates-found", onDuplicatesFound);

    duplicateFinder.on("error", onError);

    await duplicateFinder.findDuplicates(directory);
  });

program
  .command("organize <source>")
  .description("Organize files in the source directory into categories")
  .requiredOption("-o, --output <target>", "Target directory")
  .action(async (source, options) => {
    const { output: target } = options;
    const organizer = new Organizer();

    organizer.on("folders-create-start", onFoldersCreateStart);
    organizer.on("directory-created", onCreatedDirectory);
    organizer.on("copy-start", onFileFoundInOrganizer);
    organizer.on("copy-complete", onOrganizeComplete);

    organizer.on("copy-error", onError);

    await organizer.organize(source, target);
  });

program
  .command("cleanup <directory>")
  .description("Cleanup old files in a directory")
  .requiredOption(
    "-o, --older-than <days>",
    "Delete files older than specified days",
    parseInt,
  )
  .option("-c, --confirm", "Confirm deletion without prompt")
  .action(async (directory, options) => {
    const { olderThan, confirm } = options;
    console.log(`🧹 Cleanup: ${directory}`);
    console.log(`Looking for files older than ${olderThan} days...`);

    const cleanup = new Cleanup();

    cleanup.on("file-found", onFileFoundInCleanup);
    cleanup.on("file-deleted", onCleanupDelete);
    cleanup.on("cleanup-complete", onCleanupComplete);
    cleanup.on("cleanup-error", onError);

    await cleanup.cleanup(directory, olderThan, confirm);
  });

program.parse();
