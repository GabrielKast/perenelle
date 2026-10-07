# Build setup

Perenelle is an npm workspace. Packages import each other by name
(`@perenelle/core`, …); npm links them through `node_modules/`.

The question is which file such an import resolves to: the package's compiled
`dist/` or its TypeScript sources. Two setups were considered.

## Current setup: A1 — cross-package imports resolve to `dist/`

- Each package is a TypeScript project reference (`composite`) and compiles to
  its own `dist/` with `.d.ts` files.
- `exports` in each internal package's `package.json` points to `dist/` only.
- `tsc -b` (`npm run build`) builds the packages in dependency order,
  incrementally.
- `npm start` and `npm test` always run `tsc -b` first, so they never use stale
  code from another package.
- Tests are colocated (`*.test.ts` next to the code) and run from sources with
  Node's type stripping; their imports of _other_ packages go through `dist/`.

### Trap to recognize

Anything that runs `dist/` **without building first** uses the code as it was at
the last build. Symptom: _"I changed the code but the behavior did not change."_

Fix: run `npm run build` (or go through `npm start` / `npm test`).
If `tsc -b` itself seems confused, `npm run clean` or deleting `packages/*/dist/`
forces a full rebuild (the incremental state lives in `dist/`).

### When to switch to A2

When the `tsc -b` step makes `npm test` or `npm start` noticeably slow.

## Alternative: A2 — run from sources in development

Cross-package imports resolve to `.ts` sources through a custom `source` export
condition; `dist/` is only produced by `tsc -b` for type-checking and builds.

### How to switch (configuration only, no code change)

1. In each internal package's `package.json`, add the `source` condition first:
   ```json
   "exports": {
     ".": {
       "source": "./src/index.ts",
       "types": "./dist/index.d.ts",
       "default": "./dist/index.js"
     }
   }
   ```
2. In `tsconfig.base.json`, enable `"customConditions": ["source"]`.
3. In the root `package.json`, run Node with the condition and without the
   build step:
   ```json
   "start": "node --conditions=source packages/cli/src/main.ts",
   "test": "node --conditions=source --test \"packages/*/src/**/*.test.ts\""
   ```
4. In the Rspack config, add `"source"` to `resolve.conditionNames`.

The comments in these files repeat the A2 variant.

### Trap to recognize (A2)

Every tool must use the `source` condition. A tool that does not falls back to
`dist/`, which may be stale, silently. Same symptom: _"my change has no effect."_
Check that the tool runs with the condition, or rebuild with `npm run build`.

## Release build

The published package (`packages/cli`, npm name `perenelle`) bundles the private
`@perenelle/*` packages with Rspack (not set up yet). With A1, Rspack can bundle
the compiled `packages/cli/dist/main.js` and needs no TypeScript support.
