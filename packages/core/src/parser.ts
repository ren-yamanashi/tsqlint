import pkg from "node-sql-parser";
const { Parser } = pkg;
import type { Config, ParseResult, ASTNode } from "./types.js";

export class SQLParser {
  private parser: InstanceType<typeof Parser>;

  constructor(config?: Config["parser"]) {
    this.parser = new Parser();
  }

  parse(sqlContent: string, options?: { database?: string }): ParseResult {
    try {
      // BINARYキーワードの除去（例のコードを参考）
      const cleanedSql = sqlContent.replace(/BINARY/g, "");
      
      const ast = this.parser.astify(cleanedSql, {
        database: options?.database || "mysql",
      });

      return {
        ast: Array.isArray(ast) ? ast : [ast],
        errors: [],
      };
    } catch (error) {
      return {
        ast: [],
        errors: [
          {
            message: error instanceof Error ? error.message : "Parse error",
            line: 1,
            column: 1,
          },
        ],
      };
    }
  }

  /**
   * ASTノードから位置情報を抽出
   */
  getSourceLocation(node: ASTNode): { line: number; column: number } {
    // node-sql-parserは位置情報を提供しないため、
    // 現時点では固定値を返す（将来的に改善予定）
    return {
      line: 1,
      column: 1,
    };
  }

  /**
   * メッセージテンプレートの変数を展開
   */
  expandMessageTemplate(message: string, node: ASTNode): string {
    let expandedMessage = message;

    // データベース名の展開
    if (expandedMessage.includes("{{database_name}}")) {
      const dbName = this.extractDatabaseName(node);
      expandedMessage = expandedMessage.replace(/\{\{database_name\}\}/g, dbName || "unknown");
    }

    // テーブル名の展開
    if (expandedMessage.includes("{{table_name}}")) {
      const tableName = this.extractTableName(node);
      expandedMessage = expandedMessage.replace(/\{\{table_name\}\}/g, tableName || "unknown");
    }

    // カラム名の展開
    if (expandedMessage.includes("{{column_name}}")) {
      const columnName = this.extractColumnName(node);
      expandedMessage = expandedMessage.replace(/\{\{column_name\}\}/g, columnName || "unknown");
    }

    return expandedMessage;
  }

  private extractDatabaseName(node: ASTNode): string | null {
    if (node.type === "create" && node.table?.[0]?.db) {
      return node.table[0].db;
    }
    return null;
  }

  private extractTableName(node: ASTNode): string | null {
    if (node.type === "create" && node.table?.[0]?.table) {
      return node.table[0].table;
    }
    return null;
  }

  private extractColumnName(node: ASTNode): string | null {
    // カラム情報の抽出（実装は必要に応じて拡張）
    return null;
  }
}
