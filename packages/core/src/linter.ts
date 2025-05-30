import { AST } from 'node-sql-parser';
import { SQLParser } from './parser.js';
import { Context } from './context.js';
import { 
  Rule, 
  LintResult, 
  LintMessage, 
  Config, 
  MessageSeverity 
} from './types.js';

/**
 * Main linter engine that orchestrates SQL parsing and rule execution
 */
export class Linter {
  private parser: SQLParser;
  private rules: Map<string, Rule> = new Map();

  constructor() {
    this.parser = new SQLParser();
  }

  /**
   * Add a rule to the linter
   */
  addRule(name: string, rule: Rule): void {
    this.rules.set(name, rule);
  }

  /**
   * Remove a rule from the linter
   */
  removeRule(name: string): void {
    this.rules.delete(name);
  }

  /**
   * Get all registered rules
   */
  getRules(): Map<string, Rule> {
    return new Map(this.rules);
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * Lint a SQL string with the given configuration
   */
  lint(sql: string, config: Config, filename?: string): LintResult {
    const result: LintResult = {
      messages: [],
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      filename: filename || '<input>'
    };

    try {
      // Parse SQL
      const parseResult = this.parser.parse(sql);
      
      // Check for parse errors
      if (parseResult.errors && parseResult.errors.length > 0) {
        for (const error of parseResult.errors) {
          const message: LintMessage = {
            ruleId: 'parse-error',
            severity: 'error',
            message: `Parse error: ${error.message}`,
            line: error.line,
            column: error.column,
            nodeType: 'ParseError'
          };
          
          result.messages.push(message);
          result.errorCount++;
        }
      }
      
      // Run rules
      this.executeRules(sql, parseResult.ast, config, result);
      
    } catch (error) {
      // Add parsing error as a message
      const message: LintMessage = {
        ruleId: 'parse-error',
        severity: 'error',
        message: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
        line: 1,
        column: 1,
        nodeType: 'ParseError'
      };
      
      result.messages.push(message);
      result.errorCount++;
    }

    return result;
  }

  /**
   * Lint multiple SQL files
   */
  async lintFiles(files: Array<{ content: string; filename: string }>, config: Config): Promise<LintResult[]> {
    const results: LintResult[] = [];
    
    for (const file of files) {
      const result = this.lint(file.content, config, file.filename);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Execute all enabled rules against the AST
   */
  private executeRules(sql: string, ast: AST | AST[], config: Config, result: LintResult): void {
    // Normalize AST to array
    const statements = Array.isArray(ast) ? ast : [ast];
    
    // Rules are always provided as array of Rule objects in resolved config
    for (const rule of config.rules) {
      // Execute rule for each statement with default severity
      for (const statement of statements) {
        this.executeRule(rule, rule.name, statement, sql, 'error', [], result);
      }
    }
  }

  /**
   * Execute a single rule against a statement
   */
  private executeRule(
    rule: Rule,
    ruleName: string,
    statement: AST,
    sql: string,
    severity: MessageSeverity,
    options: any[],
    result: LintResult
  ): void {
    const context = new Context(
      result.filename,
      sql,
      this.parser,
      ruleName
    );

    try {
      const ruleListener = rule.create(context);
      
      // ASTノードのタイプに応じてリスナーを実行
      if (statement.type) {
        // ノードタイプを Pascal case に変換 (select -> Select, create -> Create)
        const normalizedType = statement.type.charAt(0).toUpperCase() + statement.type.slice(1);
        const listener = ruleListener[normalizedType as keyof typeof ruleListener] as any;
        if (typeof listener === 'function') {
          listener.call(this, statement);
        }
      }
      
      // コンテキストからメッセージを取得して結果に追加
      const messages = context.getMessages();
      for (const message of messages) {
        result.messages.push(message);
        
        // カウンターを更新
        switch (message.severity) {
          case 'error':
            result.errorCount++;
            break;
          case 'warning':
            result.warningCount++;
            break;
          case 'info':
            result.infoCount++;
            break;
        }
      }
      
    } catch (error) {
      // If rule execution fails, add it as an error
      const errorMessage: LintMessage = {
        ruleId: ruleName,
        severity: 'error',
        message: `Rule execution error: ${error instanceof Error ? error.message : String(error)}`,
        line: 1,
        column: 1,
        nodeType: 'RuleError'
      };
      
      result.messages.push(errorMessage);
      result.errorCount++;
    }
  }

  /**
   * Get a summary of all lint results
   */
  static getSummary(results: LintResult[]): {
    totalFiles: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfos: number;
    filesWithIssues: number;
  } {
    return {
      totalFiles: results.length,
      totalErrors: results.reduce((sum, result) => sum + result.errorCount, 0),
      totalWarnings: results.reduce((sum, result) => sum + result.warningCount, 0),
      totalInfos: results.reduce((sum, result) => sum + result.infoCount, 0),
      filesWithIssues: results.filter(result => result.messages.length > 0).length
    };
  }

  /**
   * Format lint results as a string
   */
  static formatResults(results: LintResult[], options: { 
    format?: 'stylish' | 'json' | 'compact';
    color?: boolean;
  } = {}): string {
    const { format = 'stylish', color = false } = options;

    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      
      case 'compact':
        return this.formatCompact(results, color);
      
      case 'stylish':
      default:
        return this.formatStylish(results, color);
    }
  }

  /**
   * Format results in stylish format (similar to ESLint)
   */
  private static formatStylish(results: LintResult[], color: boolean): string {
    let output = '';
    
    for (const result of results) {
      if (result.messages.length === 0) continue;
      
      output += `\n${result.filename}\n`;
      
      for (const message of result.messages) {
        const severitySymbol = message.severity === 'error' ? '✖' : 
                              message.severity === 'warning' ? '⚠' : 'ℹ';
        
        const line = `  ${message.line}:${message.column}  ${severitySymbol}  ${message.message}  ${message.ruleId || ''}`;
        
        if (color) {
          const colorCode = message.severity === 'error' ? '\x1b[31m' : 
                           message.severity === 'warning' ? '\x1b[33m' : '\x1b[36m';
          output += `${colorCode}${line}\x1b[0m\n`;
        } else {
          output += `${line}\n`;
        }
      }
    }
    
    const summary = this.getSummary(results);
    if (summary.totalErrors > 0 || summary.totalWarnings > 0 || summary.totalInfos > 0) {
      output += `\n✖ ${summary.totalErrors + summary.totalWarnings + summary.totalInfos} problems `;
      output += `(${summary.totalErrors} errors, ${summary.totalWarnings} warnings, ${summary.totalInfos} infos)\n`;
    }
    
    return output;
  }

  /**
   * Format results in compact format
   */
  private static formatCompact(results: LintResult[], color: boolean): string {
    let output = '';
    
    for (const result of results) {
      for (const message of result.messages) {
        const line = `${result.filename}: line ${message.line}, col ${message.column}, ${message.severity} - ${message.message} (${message.ruleId || 'unknown'})`;
        
        if (color) {
          const colorCode = message.severity === 'error' ? '\x1b[31m' : 
                           message.severity === 'warning' ? '\x1b[33m' : '\x1b[36m';
          output += `${colorCode}${line}\x1b[0m\n`;
        } else {
          output += `${line}\n`;
        }
      }
    }
    
    return output;
  }
}
