import type { Config, ConfigInput, Rule, RuleConfig } from "./types.js";
import { validateRules } from "./rule.js";
import { globalRuleRegistry } from "./registry.js";

/**
 * 文字列ルール設定をルールオブジェクトの配列に変換
 */
function resolveRules(rules: Rule[] | Record<string, RuleConfig>): Rule[] {
  if (Array.isArray(rules)) {
    return rules;
  }

  const resolvedRules: Rule[] = [];
  
  for (const [ruleName, ruleConfig] of Object.entries(rules)) {
    // ルールが無効化されている場合はスキップ
    if (ruleConfig === "off" || ruleConfig === false) {
      continue;
    }

    // レジストリからルールを取得
    const rule = globalRuleRegistry.get(ruleName);
    if (!rule) {
      throw new Error(`Rule "${ruleName}" not found. Available rules: ${globalRuleRegistry.getNames().join(", ")}`);
    }
    resolvedRules.push(rule);
  }
  return resolvedRules;
}

/**
 * 設定定義API
 * ESLintのdefineConfigと同様の設計
 */
export function defineConfig(config: ConfigInput): Config {
  // ルールを解決
  const resolvedRules = resolveRules(config.rules);
  
  const resolvedConfig: Config = {
    ...config,
    rules: resolvedRules,
  };

  // 設定の妥当性を検証
  validateConfig(resolvedConfig);

  return resolvedConfig;
}

/**
 * 設定の妥当性を検証
 */
export function validateConfig(config: Config): void {
  if (!config.files) {
    throw new Error("Config must specify files");
  }

  if (!Array.isArray(config.rules)) {
    throw new Error("Config rules must be resolved to an array before validation");
  }

  // ルールの妥当性を検証
  validateRules(config.rules);

  // パーサー設定の検証
  if (config.parser?.database) {
    const supportedDatabases = ["mysql", "postgres", "sqlite", "mssql"];
    if (!supportedDatabases.includes(config.parser.database)) {
      throw new Error(
        `Unsupported database: ${config.parser.database}. Supported: ${supportedDatabases.join(", ")}`
      );
    }
  }
}

/**
 * デフォルト設定を作成
 */
export function createDefaultConfig(): Config {
  return {
    files: ["**/*.sql"],
    rules: [],
    parser: {
      database: "mysql",
    },
  };
}

/**
 * 設定をマージ
 */
export function mergeConfig(base: Config, override: Partial<ConfigInput>): Config {
  const mergedRules = (() => {
    if (Array.isArray(base.rules) && Array.isArray(override.rules)) {
      return [...base.rules, ...override.rules];
    } else if (Array.isArray(base.rules) && !Array.isArray(override.rules)) {
      return base.rules;
    } else if (!Array.isArray(base.rules) && Array.isArray(override.rules)) {
      return override.rules;
    } else {
      return { ...base.rules, ...override.rules };
    }
  })();

  const mergedInput: ConfigInput = {
    ...base,
    ...override,
    rules: mergedRules,
    parser: {
      ...base.parser,
      ...override.parser,
    },
    env: {
      ...base.env,
      ...override.env,
    },
  };

  return defineConfig(mergedInput);
}
