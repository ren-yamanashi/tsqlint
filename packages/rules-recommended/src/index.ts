import { Config, defineConfig, globalRuleRegistry } from "@tsqlint/core";
import { noSelectStar, tableNamingConvention } from "./rules/index.js";

/**
 * 推奨ルールセット
 */
export const recommendedRules = [
  noSelectStar,
  tableNamingConvention,
];

// グローバルレジストリに推奨ルールを登録
globalRuleRegistry.registerMany(recommendedRules);

/**
 * 推奨設定
 */
export const recommendedConfig: Config = defineConfig({
  files: ["**/*.sql"],
  rules: recommendedRules,
  parser: {
    database: "mysql",
  },
});

// ルールエクスポート
export * from "./rules/index.js";

// デフォルトエクスポート
export default recommendedConfig;
