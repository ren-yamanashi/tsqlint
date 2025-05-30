import { createRule } from "@tsqlint/core";

// 型定義
interface CreateNode {
  type: "create";
  keyword: "table" | "index" | "view";
  table?: Array<{ db?: string; table: string }>;
  create_definitions?: any[];
}

interface RuleContext {
  filename: string;
  sourceCode: string;
  report: (descriptor: {
    node: any;
    message: string;
    severity: "error" | "warning" | "info";
    data?: Record<string, string>;
  }) => void;
}

/**
 * テーブル命名規則ルール
 * 
 * 問題のあるコード例:
 * CREATE TABLE UserProfiles (...);  // PascalCase
 * CREATE TABLE userProfiles (...);  // camelCase
 * CREATE TABLE User-Profiles (...); // kebab-case
 * 
 * 良いコード例:
 * CREATE TABLE user_profiles (...); // snake_case
 * CREATE TABLE users (...);         // simple lowercase
 */
export const tableNamingConvention = createRule({
  name: "table-naming-convention",
  meta: {
    description: "Enforce consistent table naming conventions (snake_case)",
    category: "Stylistic Issues",
    recommended: true,
  },
  create(context: RuleContext) {
    return {
      Create(node: CreateNode) {
        // テーブル作成文のみをチェック
        if (node.keyword !== "table") {
          return;
        }

        const tableName = extractTableName(node);
        
        if (tableName === null) {
          return;
        }

        if (!isSnakeCase(tableName)) {
          context.report({
            node,
            severity: "warning",
            message: `Table name '${tableName}' should use snake_case convention. Consider '${toSnakeCase(tableName)}'.`,
            data: {
              tableName,
              suggestedName: toSnakeCase(tableName),
            },
          });
        }
      },
    };
  },
});

/**
 * CREATE文からテーブル名を抽出
 */
function extractTableName(node: CreateNode): string | null {
  if (!node.table || node.table.length === 0) {
    return null;
  }

  const tableInfo = node.table[0];
  return tableInfo?.table ?? null;
}

/**
 * snake_case形式かチェック
 * - 小文字のみ
 * - アンダースコア区切り
 * - 数字も許可
 * - 先頭は文字
 */
function isSnakeCase(name: string): boolean {
  // 空文字列は無効
  if (!name) {
    return false;
  }

  // 無効なパターンをチェック
  if (
    name.startsWith('_') ||     // 先頭アンダースコア
    name.endsWith('_') ||       // 末尾アンダースコア
    name.includes('__') ||      // 連続アンダースコア
    /^[0-9]/.test(name) ||      // 数字始まり
    /[A-Z]/.test(name) ||       // 大文字を含む
    /-/.test(name) ||           // ハイフンを含む
    /\s/.test(name)             // スペースを含む
  ) {
    return false;
  }

  // snake_caseの正規表現パターン
  // - 先頭は小文字
  // - その後は小文字、数字、アンダースコアのみ
  const snakeCasePattern = /^[a-z][a-z0-9_]*$/;
  
  return snakeCasePattern.test(name);
}

/**
 * 文字列をsnake_caseに変換
 */
function toSnakeCase(name: string): string {
  return name
    // PascalCase/camelCaseを分割 (大文字の前にアンダースコア)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    // 連続する大文字を処理 (例: XMLHTTPRequest -> XML_HTTP_Request)
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    // kebab-caseのハイフンをアンダースコアに変換
    .replace(/-/g, '_')
    // スペースをアンダースコアに変換
    .replace(/\s+/g, '_')
    // 全て小文字に
    .toLowerCase()
    // 連続するアンダースコアを単一に
    .replace(/_+/g, '_')
    // 先頭・末尾のアンダースコアを除去
    .replace(/^_|_$/g, '');
}