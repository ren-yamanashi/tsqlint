import { LintResult, LintMessage } from "@tsqlint/core";
import pc from "picocolors";

export interface FormatterOptions {
  color?: boolean;
  cwd?: string;
}

export interface Formatter {
  format(results: LintResult[], options?: FormatterOptions): string;
}

/**
 * スタイリッシュフォーマッター（ESLint風）
 */
export class StylishFormatter implements Formatter {
  format(results: LintResult[], options: FormatterOptions = {}): string {
    const { color = true, cwd = process.cwd() } = options;
    let output = "";

    const resultsWithMessages = results.filter(result => result.messages.length > 0);

    for (const result of resultsWithMessages) {
      const relativePath = this.getRelativePath(result.filename, cwd);
      
      if (color) {
        output += `\n${pc.underline(relativePath)}\n`;
      } else {
        output += `\n${relativePath}\n`;
      }

      for (const message of result.messages) {
        const line = this.formatMessage(message, color);
        output += `${line}\n`;
      }
    }

    // サマリーを追加
    const summary = this.getSummary(results);
    if (summary.totalProblems > 0) {
      output += this.formatSummary(summary, color);
    }

    return output;
  }

  private formatMessage(message: LintMessage, useColor: boolean): string {
    const position = `${message.line}:${message.column}`;
    const severity = message.severity;
    const severitySymbol = severity === "error" ? "✖" : severity === "warning" ? "⚠" : "ℹ";
    const ruleId = message.ruleId || "";

    let line = `  ${position}  ${severitySymbol}  ${message.message}  ${ruleId}`;

    if (useColor) {
      const colorFn = severity === "error" ? pc.red : severity === "warning" ? pc.yellow : pc.cyan;
      const severityText = colorFn(`${severitySymbol}  ${message.message}`);
      const ruleText = pc.dim(ruleId);
      line = `  ${pc.dim(position)}  ${severityText}  ${ruleText}`;
    }

    return line;
  }

  private formatSummary(summary: Summary, useColor: boolean): string {
    const { totalErrors, totalWarnings, totalInfos, totalProblems } = summary;
    
    let summaryText = `\n✖ ${totalProblems} problem${totalProblems !== 1 ? "s" : ""} `;
    summaryText += `(${totalErrors} errors, `;
    summaryText += `${totalWarnings} warnings, `;
    summaryText += `${totalInfos} infos)\n`;

    if (useColor) {
      if (totalErrors > 0) {
        summaryText = pc.red(summaryText);
      } else if (totalWarnings > 0) {
        summaryText = pc.yellow(summaryText);
      }
    }

    return summaryText;
  }

  private getSummary(results: LintResult[]): Summary {
    return {
      totalFiles: results.length,
      totalErrors: results.reduce((sum, result) => sum + result.errorCount, 0),
      totalWarnings: results.reduce((sum, result) => sum + result.warningCount, 0),
      totalInfos: results.reduce((sum, result) => sum + result.infoCount, 0),
      get totalProblems() {
        return this.totalErrors + this.totalWarnings + this.totalInfos;
      },
      filesWithIssues: results.filter(result => result.messages.length > 0).length,
    };
  }

  private getRelativePath(filepath: string, cwd: string): string {
    return filepath.startsWith(cwd) ? filepath.slice(cwd.length + 1) : filepath;
  }
}

/**
 * コンパクトフォーマッター
 */
export class CompactFormatter implements Formatter {
  format(results: LintResult[], options: FormatterOptions = {}): string {
    const { color = true, cwd = process.cwd() } = options;
    let output = "";

    for (const result of results) {
      const relativePath = this.getRelativePath(result.filename, cwd);
      
      for (const message of result.messages) {
        const line = this.formatMessage(relativePath, message, color);
        output += `${line}\n`;
      }
    }

    return output;
  }

  private formatMessage(filepath: string, message: LintMessage, useColor: boolean): string {
    const position = `line ${message.line}, col ${message.column}`;
    const ruleId = message.ruleId || "unknown";
    
    let line = `${filepath}: ${position}, ${message.severity} - ${message.message} (${ruleId})`;

    if (useColor) {
      const colorFn = message.severity === "error" ? pc.red : 
                     message.severity === "warning" ? pc.yellow : pc.cyan;
      line = colorFn(line);
    }

    return line;
  }

  private getRelativePath(filepath: string, cwd: string): string {
    return filepath.startsWith(cwd) ? filepath.slice(cwd.length + 1) : filepath;
  }
}

/**
 * JSONフォーマッター
 */
export class JSONFormatter implements Formatter {
  format(results: LintResult[]): string {
    return JSON.stringify(results, null, 2);
  }
}

interface Summary {
  totalFiles: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  totalProblems: number;
  filesWithIssues: number;
}

/**
 * フォーマッタファクトリー
 */
export class FormatterFactory {
  private static formatters: Map<string, () => Formatter> = new Map([
    ["stylish", () => new StylishFormatter()],
    ["compact", () => new CompactFormatter()],
    ["json", () => new JSONFormatter()],
  ]);

  static create(name: string): Formatter {
    const formatterFactory = this.formatters.get(name);
    if (!formatterFactory) {
      throw new Error(`Unknown formatter: ${name}. Available formatters: ${Array.from(this.formatters.keys()).join(", ")}`);
    }
    return formatterFactory();
  }

  static getAvailableFormatters(): string[] {
    return Array.from(this.formatters.keys());
  }

  static register(name: string, factory: () => Formatter): void {
    this.formatters.set(name, factory);
  }
}
