# perenelle

Docker compose management

## Development

Requires Node.js 22.18 or later (the sources run directly via Node's native TypeScript type stripping).

```sh
npm install            # install dependencies and enable the git hooks (.githooks/)
npm start -- --help    # run the CLI from source (node src/main.ts)
npm run build          # compile src/ to dist/ with tsc
npm test               # run the tests (node:test)
npm run typecheck      # type-check sources and tests
npm run lint           # lint with ESLint + typescript-eslint
npm run format         # format with Prettier
npm run format:check   # check formatting without writing
npm run check          # typecheck + lint + format check + tests
```

The pre-commit hook runs `format:check` and `lint`.
