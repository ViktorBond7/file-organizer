import { Scanner } from "./lib/scanner.js";
import { DuplicateFinder } from "./lib/duplicates.js";
import { Command } from "commander";
import { onFileFound, onScanComplete } from "./handlers/scanHandlers.js";

import {
  onDuplicatesFound,
  onFileFoundInDuplicates,
} from "./handlers/duplicatesHandler.js";
import { onError } from "./handlers/errorHandler.js";

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

program.parse();
