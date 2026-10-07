import { Command } from "commander";

export function createProgram(version: string): Command {
  return new Command()
    .name("prnl")
    .description("Manage Docker Compose projects.")
    .version(version);
}
