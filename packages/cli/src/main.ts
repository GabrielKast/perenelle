#!/usr/bin/env node
// Composition root: wires adapters and use cases, then hands control to the CLI.

import { readFileSync } from "node:fs";
import { createProgram } from "./program.ts";

// package.json sits one level above both src/main.ts and dist/main.js.
// This path is resolved relative to this file at runtime: it would break if the
// code were bundled (e.g. with Rspack), since import.meta.url would then point to
// the bundle. Revisit this lookup if a bundler is ever introduced.
const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

await createProgram(version).parseAsync(process.argv);
