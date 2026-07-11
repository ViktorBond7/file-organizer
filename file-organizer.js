import { Scanner } from "./lib/scanner.js";
import {
  onFileFound,
  onScanComplete,
  onScanError,
} from "./handlers/scanHandlers.js";

import { Command, InvalidArgumentError } from "commander";

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
    scanner.on("scan-error", onScanError);

    await scanner.scan(directory);
  });

program.parse();
