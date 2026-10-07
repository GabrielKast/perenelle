import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommanderError } from "commander";
import { createProgram } from "./program.ts";

function run(args: string[]): { output: string; error: CommanderError } {
  let output = "";
  const program = createProgram("1.2.3")
    .exitOverride()
    .configureOutput({
      writeOut: (text) => (output += text),
      writeErr: (text) => (output += text),
    });

  try {
    program.parse(args, { from: "user" });
  } catch (error) {
    assert.ok(error instanceof CommanderError);
    return { output, error };
  }
  assert.fail("expected the program to exit");
}

describe("prnl CLI", () => {
  it("prints the version with --version", () => {
    const { output, error } = run(["--version"]);

    assert.equal(output, "1.2.3\n");
    assert.equal(error.exitCode, 0);
  });

  it("shows usage with --help", () => {
    const { output, error } = run(["--help"]);

    assert.match(output, /Usage: prnl/);
    assert.equal(error.exitCode, 0);
  });
});
