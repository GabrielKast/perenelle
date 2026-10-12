# PRNL-1 — Discovery: the Project model

Issue: https://github.com/GabrielKast/perenelle/issues/1 (round 1: manage one
compose project). Discussed 2026-10-12.

## Model

```ts
// core/domain
type Project = {
  name: string; // also the Compose project name (-p)
  root: string; // absolute POSIX path of the project directory
  composeFiles: string[]; // ordered, relative to root, at least one
};
```

Plain data in round 1: no behavior justifies a class yet.

## Decisions

### 1. prnl name = Compose project name

Compose labels containers, networks and volumes with the project name. If the
user also runs plain `docker compose` in the directory, Compose resolves its own
name (`COMPOSE_PROJECT_NAME` > top-level `name:` > directory basename). A
different name under prnl means the same project running twice (duplicate
containers, port clashes).

- The name defaults to the root's basename, normalized to Compose's rules
  (lowercase, `[a-z0-9_-]`, starting with a letter or digit); overridable at
  registration.
- Validated in the domain; unique among registered projects.
- Rejected: separate prnl id and Compose name (two names, no benefit); asking
  Compose for the resolved name at registration (registration would need
  Docker). The latter may come back later as a better default.

### 2. Compose files: explicit, ordered list

When `-f` is given, Compose no longer loads `compose.override.yaml`
automatically. prnl always passes `-f`, so the list must be explicit and
complete. Example: with `compose.yaml` (`DEBUG: "0"`) and
`compose.override.yaml` (`DEBUG: "1"`, a volume), plain `docker compose up`
gives `DEBUG=1` and the volume; `prnl` storing only `compose.yaml` would
silently give `DEBUG=0` and no volume.

Order matters: later files win. The project's files come first, prnl's
generated files last:

```text
docker compose -p shop \
  -f /home/g/shop/compose.yaml \
  -f /home/g/shop/compose.override.yaml \
  -f ~/.prnl/projects/shop/<purpose>.yaml ...
```

Where the list comes from (discovery vs explicit arguments) is a registration
question (topic 3).

### 3. Paths: POSIX only, normalized at the boundary

No Windows support. The CLI resolves user input (`.`, `~/shop`, relative paths)
with `node:path` / `node:os`. The domain checks its invariants with plain string
operations:

- `root` starts with `/`;
- each compose file is relative (no leading `/`) and has no `..` segment, so it
  stays inside the root.

### 4. Generated files layout

- One directory per project: `~/.prnl/projects/<name>/`.
- Files named by purpose (`ports.yaml`, `proxy.yaml`, ...); their order in the
  `-f` list is defined in code, not by file names.
- Written by commands that change the configuration, then kept as-is until the
  next such command. Settings remain the source of truth; keeping the files
  makes debugging easier (the exact `docker compose` invocation can be replayed
  by hand).
- No override is needed in round 1; this records the layout for later.

## Notes for later topics

- Compose resolves relative paths in all files against the first file's
  directory. Passing `--project-directory <root>` explicitly is probably safer
  (Compose port topic).
- Renaming a project means renaming its `~/.prnl/projects/<name>/` directory.
