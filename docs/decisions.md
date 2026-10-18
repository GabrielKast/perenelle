# Decision log

Decisions made about Perenelle, with their reasons. Newest last.
Update an entry's status rather than deleting it when a decision changes.

## 2026-10-07 — Toolchain

- **TypeScript compiled with `tsc`**, ESM, `module: nodenext`. No bundler for
  development. Sources stay runnable by Node's native type stripping
  (`erasableSyntaxOnly`, `rewriteRelativeImportExtensions`).
- **Tests: `node:test`.** No dependency; tests run through the same module
  loader as production. Ports and adapters make module mocking unnecessary:
  use cases receive fake port implementations.
- **Lint: ESLint + typescript-eslint (`recommendedTypeChecked`) + Prettier.**
  Chosen over Biome for mature type-aware async rules (`no-floating-promises`,
  `no-misused-promises`, `await-thenable`).
- **Architecture boundaries are enforced by ESLint** (`no-restricted-imports`).
- **Pre-commit hook** without dependencies: `.githooks/pre-commit`, enabled by
  `npm install` (`core.hooksPath`). Runs format check and lint. It checks the
  working tree, not only staged content.
- **CLI parsing: commander.**

## 2026-10-07 — Invariant: prnl never modifies a managed project

See CLAUDE.md, "Domain invariants". prnl never modifies, deletes or adds files
in a managed project's root. Behavior is changed through generated compose
override files (`docker compose -p <name> -f <original>... -f <generated>...`)
stored under `~/.prnl/`.

Reason: modifying sources was a constant danger in a previous implementation.

## 2026-10-07 — Packages: core and its clients and adapters

```text
packages/core      @perenelle/core      private  domain, use cases, ports
packages/settings  @perenelle/settings  private  settings-file adapter (~/.prnl/settings.json)
packages/docker    @perenelle/docker    private  Docker Compose adapter
packages/cli       perenelle            published, binary `prnl`; CLI + composition root
```

- **Core is independent of its clients and of Docker.** Dependencies point to
  core: adapters implement core's ports; clients call core's use cases. Core
  imports no other package.
- **Adapters depend on core only**, not on each other.
- **A web GUI will come later** as `packages/web`, a driving adapter that is a
  sibling of the CLI. `prnl serve` starts it from the composition root. Core
  knows nothing about it (no "start web server" use case or port).
- **Compose concepts are domain vocabulary; Docker mechanics are not.** Project,
  service and compose file may appear in core. Subprocesses, CLI output parsing
  and the Docker socket stay in `@perenelle/docker`.
- **Core holds the logic that spans several projects** (port conflicts, shared
  services, routing proxy), as pure synchronous code computing what to apply;
  adapters apply it. One core package for now; it may be split by feature later.
- **Persistence starts as a single file, `~/.prnl/settings.json`**, behind a
  port. It is expected to be split later. Its location must be injectable so
  tests never touch the real one.

## 2026-10-07 — Distribution

- **One published npm package** (`perenelle`, binary `prnl`) containing CLI and
  core. The `@perenelle/*` packages are private and never published.
- **Bundler: Rspack**, for the release build only (not set up yet). Third-party
  dependencies such as commander remain regular dependencies.
- The CLI reads its version from `../package.json` at runtime; this must be
  revisited when bundling.

## 2026-10-07 — Workspace build: A1

Cross-package imports resolve to each package's compiled `dist/`; `start` and
`test` run `tsc -b` first. Tests are colocated with the code. A2 (run from
sources with a `source` export condition) is the planned alternative if builds
become slow. Details, traps and the switch procedure: [build.md](build.md).

## 2026-10-07 — First features

1. Manage **one** compose project: register it (root + compose files), store it
   in `~/.prnl/settings.json`, then start, stop, restart and status.
2. Then: manage several compatible compose projects.

## 2026-10-12 — Project model

Details and examples: `.claude/issues/PRNL-1-discovery-project-model.md`.

- **A Project is `{ name, root, composeFiles }`**, plain data in core.
- **The prnl name is the Compose project name** (`-p`), so prnl and plain
  `docker compose` see the same project. Defaults to the root's basename
  normalized to Compose's rules; overridable at registration; unique.
- **Compose files are an explicit, ordered list relative to the root.** prnl
  always passes `-f`, which disables Compose's automatic loading of
  `compose.override.yaml`; the list must therefore be complete.
- **POSIX only, no Windows.** The CLI normalizes paths; the domain validates
  with string checks (absolute root; relative files without `..`).
- **Generated files live in `~/.prnl/projects/<name>/`, named by purpose**, and
  are passed after the project's files, in an order defined in code. They are
  written when a command changes the configuration and kept until the next one,
  for debugging. Settings remain the source of truth.

## 2026-10-18 — Naming conventions

- **camelCase** for variables, functions, parameters and properties;
  **PascalCase** for types, interfaces and classes. No UPPER_CASE constants.
- **kebab-case file names** (`start-project.ts`): the usual Node convention,
  and no names that differ only by case on case-insensitive file systems.
- **camelCase keys in `~/.prnl/settings.json`**: the file maps to the
  TypeScript types without a translation layer.
- Enforced by ESLint: `@typescript-eslint/naming-convention`, and a local rule
  for file names (defined in `eslint.config.js`, no extra dependency). Names
  that need quotes (Docker labels, HTTP headers) are exempt. JSON keys are
  checked through the types that describe the file.
