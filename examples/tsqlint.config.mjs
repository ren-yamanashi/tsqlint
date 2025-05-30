const config = {
  files: ["**/*.sql"],
  rules: {
    "no-select-star": "error",
    "table-naming-convention": "warning"
  },
  parser: { database: "mysql" },
  env: { node: true },
};

export default config;
