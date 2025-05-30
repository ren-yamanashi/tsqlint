# TSQLint

TSQLint is an AST-based pattern checker for SQL, similar to ESLint.

## Features

- AST-based linting for SQL files.
- Extensible rule system.
- Support for MySQL dialect (initially).
- Configuration via `tsqlint.config.js`, `tsqlint.config.mjs`, or `tsqlint.config.json`.

## Installation

```bash
# (Assuming it will be published to npm)
# npm install -g tsqlint
# or
# yarn global add tsqlint
# pnpm add -g tsqlint
```

(For local development, after cloning and building the monorepo):

```bash
pnpm install
pnpm run build
# The tsqlint CLI will be available via examples/package.json scripts or directly
```

## Usage

```bash
# Lint specified files (from within the examples directory or if tsqlint is globally installed)
tsqlint "path/to/your/**/*.sql"

# Lint using configuration in the current directory or parent directories
tsqlint
```

## Configuration

TSQLint can be configured using a `tsqlint.config.js`, `tsqlint.config.mjs`, or `tsqlint.config.json` file.

Example `tsqlint.config.mjs`:

```javascript
export default {
  files: ["**/*.sql"],
  rules: {
    "no-select-star": "error",
    "table-naming-convention": "warning",
    // Add more rules here
  },
  parser: {
    database: "mysql",
  },
};
```

## Rules

Currently available rules (from `@tsqlint/rules-recommended`):

- `no-select-star`: Disallows the use of `SELECT *`.
- `table-naming-convention`: Enforces snake_case for table names.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for the full license text.

A `NOTICE` file is also included, which contains attribution notices required by the Apache License 2.0 for this project and its dependencies.

### Acknowledgements

This project incorporates and uses the following open-source software:

- **node-sql-parser**: Licensed under the Apache License 2.0. Copyright (c) 2017-present Tao Zhi. More information can be found at [https://github.com/taozhi8833998/node-sql-parser](https://github.com/taozhi8833998/node-sql-parser).

(Contributions are welcome! Please refer to a future CONTRIBUTING.md for guidelines.)
