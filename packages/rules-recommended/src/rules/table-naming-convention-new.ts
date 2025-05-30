import { createRule } from "@tsqlint/core";
import type { CreateNode } from "@tsqlint/core";

/**
 * テーブル命名規則ルール
 * 
 * 問題のあるコード例:
 * CREATE TABLE UserProfiles (...);  // PascalCase
 * CREATE TABLE userProfiles (...);  // camelCase
 * 
 * 良いコード例:
 * CREATE TABLE user_profiles (...); // snake_case
 */
export const tableNamingConvention = createRule({
  name: "table-naming-convention",
  meta: {
    description: "Enforce consistent table naming conventions",
    category: "Stylistic Issues",
    recommended: true,
  },
  create(context) {
    return {
      Create(node: CreateNode) {
        // CREATE TABLE文のみ対象
        if (node.keyword !== "table") {
          return;
        }

        const tableName = extractTableName(node);
        if (!tableName) {
          return;
        }

        if (!isSnakeCase(tableName)) {
          context.report({
            node,
            severity: "warning",
            message: "Table name '{{table_name}}' should use snake_case convention",
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
  if (node.table && Array.isArray(node.table) && node.table.length > 0) {
    return node.table[0].table;
  }
  return null;
}

/**
 * snake_case形式かチェック
 */
function isSnakeCase(name: string): boolean {
  return /^[a-z][a-z0-9_]*[a-z0-9]$/.test(name) || /^[a-z]$/.test(name);
}
