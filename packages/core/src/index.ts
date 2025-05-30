// メインエクスポート
export { Linter } from "./linter.js";
export { SQLParser } from "./parser.js";
export { Context } from "./context.js";

// API exports
export { createRule, validateRule, validateRules } from "./rule.js";
export { defineConfig, validateConfig, createDefaultConfig, mergeConfig } from "./config.js";
export { RuleRegistry, globalRuleRegistry } from "./registry.js";

// 型エクスポート
export type {
  // 基本型
  ASTNode,
  CreateNode,
  SelectNode,
  ColumnDefinition,
  SourceLocation,
  
  // ルール関連
  Rule,
  RuleDefinition,
  RuleContext,
  RuleListener,
  ReportDescriptor,
  
  // 設定関連
  Config,
  ConfigInput,
  
  // リント関連
  LintResult,
  LintMessage,
  MessageSeverity,
  
  // パーサー関連
  ParseResult,
  ParseError,
} from "./types.js";
