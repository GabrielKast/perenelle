# perenelle

Docker compose management

## Development

Requires Node.js 22.18 or later.

The repository is an npm workspace:

```text
packages/core      @perenelle/core      domain, use cases, ports
packages/settings  @perenelle/settings  settings-file adapter
packages/docker    @perenelle/docker    Docker Compose adapter
packages/cli       perenelle            the `prnl` command
```

```sh
npm install            # install dependencies and enable the git hooks (.githooks/)
npm start -- --help    # build, then run the CLI
npm run build          # build all packages (tsc -b, incremental)
npm run clean          # remove build outputs
npm test               # build, then run the tests (node:test)
npm run lint           # lint with ESLint + typescript-eslint
npm run format         # format with Prettier
npm run format:check   # check formatting without writing
npm run check          # lint + format check + build + tests
```

The pre-commit hook runs `format:check` and `lint`.

See [docs/build.md](docs/build.md) for how packages resolve each other (and the
stale-build trap), and [docs/decisions.md](docs/decisions.md) for design decisions.
