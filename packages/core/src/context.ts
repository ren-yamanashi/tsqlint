import type { RuleContext, ReportDescriptor, ASTNode, LintMessage } from "./types.js";
import { SQLParser } from "./parser.js";

export class Context implements RuleContext {
  public readonly filename: string;
  public readonly sourceCode: string;
  private parser: SQLParser;
  private messages: LintMessage[] = [];
  private currentRuleName: string;

  constructor(
    filename: string,
    sourceCode: string,
    parser: SQLParser,
    ruleName: string
  ) {
    this.filename = filename;
    this.sourceCode = sourceCode;
    this.parser = parser;
    this.currentRuleName = ruleName;
  }

  /**
   * ルール違反を報告
   */
  report(descriptor: ReportDescriptor): void {
    const location = this.getSourceLocation(descriptor.node);
    const expandedMessage = this.parser.expandMessageTemplate(
      descriptor.message,
      descriptor.node
    );

    this.messages.push({
      ruleId: this.currentRuleName,
      severity: descriptor.severity,
      message: expandedMessage,
      line: location.line,
      column: location.column,
      data: descriptor.data,
    });
  }

  /**
   * ソース位置を取得
   */
  getSourceLocation(node: ASTNode): { line: number; column: number } {
    return this.parser.getSourceLocation(node);
  }

  /**
   * 蓄積されたメッセージを取得
   */
  getMessages(): LintMessage[] {
    return [...this.messages];
  }

  /**
   * メッセージをクリア
   */
  clearMessages(): void {
    this.messages = [];
  }
}
