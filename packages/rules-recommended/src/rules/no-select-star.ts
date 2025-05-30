import { createRule } from "@tsqlint/core";

// 型定義
interface SelectColumn {
  expr?: {
    type: string;
    table?: string;
    column?: string;
  };
  type?: string;
  column?: string;
}

interface SelectNode {
  type: "select";
  columns: string | SelectColumn[] | any;
  from?: any[];
  where?: any;
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
 * SELECT * の使用を禁止するルール
 * 
 * 問題のあるコード例:
 * SELECT * FROM users;
 * SELECT u.*, p.* FROM users u JOIN posts p ON u.id = p.user_id;
 * 
 * 良いコード例:
 * SELECT id, name, email FROM users;
 * SELECT u.id, u.name, p.title FROM users u JOIN posts p ON u.id = p.user_id;
 */
export const noSelectStar = createRule({
  name: "no-select-star",
  meta: {
    description: "Disallow SELECT * statements",
    category: "Best Practices",
    recommended: true,
  },
  create(context: RuleContext) {
    return {
      Select(node: SelectNode) {
        // SELECT文のcolumns部分をチェック
        if (node.columns === "*" || node.columns === "SELECT_STAR") {
          context.report({
            node,
            severity: "warning",
            message: "Unexpected SELECT *. Specify explicit column names instead.",
          });
          return;
        }

        // columns配列内の各カラムをチェック
        if (Array.isArray(node.columns)) {
          for (const column of node.columns) {
            if (isSelectStar(column)) {
              context.report({
                node,
                severity: "warning",
                message: "Unexpected SELECT *. Specify explicit column names instead.",
              });
            }
          }
        }
      },
    };
  },
});

/**
 * カラム指定がSELECT *形式かどうかをチェック
 */
function isSelectStar(column: SelectColumn): boolean {
  // 様々なSELECT *のパターンをチェック
  if (typeof column === "string") {
    return column === "*";
  }

  if (column && typeof column === "object") {
    // node-sql-parserが生成するAST構造に基づく判定
    // { expr: { type: "column_ref", column: "*" } } 形式
    if (column.expr?.type === "column_ref" && column.expr.column === "*") {
      return true;
    }

    // { expr: { type: "star" } } 形式
    if (column.expr?.type === "star") {
      return true;
    }

    // テーブル.* 形式 (例: users.*)
    if (column.expr?.type === "column_ref" && 
        column.expr.table && 
        column.expr.column === "*") {
      return true;
    }

    // 直接的な表現
    if (column.type === "star" || column.column === "*") {
      return true;
    }

    // node-sql-parserが生成する可能性のある形式
    if (typeof column.expr === "string" && column.expr === "*") {
      return true;
    }
  }

  return false;
}
