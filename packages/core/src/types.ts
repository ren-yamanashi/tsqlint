import type { AST } from "node-sql-parser";

// 基本的なAST型定義
export interface ASTNode {
  type: string;
  [key: string]: any;
}

// node-sql-parserのノード型を拡張
export interface CreateNode extends ASTNode {
  type: "create";
  keyword: "table" | "index" | "view";
  table?: Array<{ db?: string; table: string }>;
  create_definitions?: ColumnDefinition[];
}

export interface SelectNode extends ASTNode {
  type: "select";
  columns: any;
  from?: any[];
  where?: any;
}

export interface ColumnDefinition {
  column: {
    type: "column_ref";
    table: string | null;
    column: string;
  };
  definition: {
    dataType: string;
    suffix?: string[];
  };
  resource: "column";
  nullable?: {
    type: "not null" | "null";
    value: string;
  };
  auto_increment?: string;
  comment?: {
    type: "comment";
    value: {
      type: "single_quote_string";
      value: string;
    };
  };
}

// ソースコード位置情報
export interface SourceLocation {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

// ルール定義
export interface RuleDefinition<T extends Record<string, any> = {}> {
  name: string;
  meta: {
    description: string;
    category: string;
    recommended?: boolean;
  };
  create: (context: RuleContext) => RuleListener;
}

export interface Rule<T extends Record<string, any> = {}> {
  name: string;
  meta: RuleDefinition<T>["meta"];
  create: RuleDefinition<T>["create"];
}

// ルールコンテキスト
export interface RuleContext {
  filename: string;
  sourceCode: string;
  report: (descriptor: ReportDescriptor) => void;
  getSourceLocation: (node: ASTNode) => SourceLocation;
}

export interface ReportDescriptor {
  node: ASTNode;
  message: string;
  severity: MessageSeverity;
  data?: Record<string, string>;
}

// ルールリスナー
export interface RuleListener {
  Create?: (node: CreateNode) => void;
  Select?: (node: SelectNode) => void;
  Insert?: (node: ASTNode) => void;
  Update?: (node: ASTNode) => void;
  Delete?: (node: ASTNode) => void;
  Alter?: (node: ASTNode) => void;
  Drop?: (node: ASTNode) => void;
  Use?: (node: ASTNode) => void;
}

// 設定（読み込み時 - ルールは文字列参照可能）
export interface ConfigInput {
  files: string | string[];
  rules: Rule[] | Record<string, RuleConfig>;
  parser?: {
    database?: "mysql" | "postgres" | "sqlite" | "mssql";
    options?: any;
  };
  env?: Record<string, any>;
}

// 設定（解決済み - ルールは常に配列）
export interface Config {
  files: string | string[];
  rules: Rule[];
  parser?: {
    database?: "mysql" | "postgres" | "sqlite" | "mssql";
    options?: any;
  };
  env?: Record<string, any>;
}

// ルール設定型
export type RuleConfig = 
  | "off" 
  | "error" 
  | "warn" 
  | "warning" 
  | "info" 
  | boolean 
  | [MessageSeverity | "warn" | "warning", ...any[]];

// リント結果
export interface LintResult {
  filename: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export interface LintMessage {
  ruleId: string;
  severity: "error" | "warning" | "info";
  message: string;
  line: number;
  column: number;
  data?: Record<string, string>;
  nodeType?: string;
}

export type MessageSeverity = "error" | "warning" | "info";

// パーサー関連
export interface ParseResult {
  ast: AST[];
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
}
