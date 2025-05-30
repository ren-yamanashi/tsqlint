import { Command } from "commander";
import { resolve } from "path";
import { Linter, Config } from "@tsqlint/core";
import { configLoader } from "./loader.js";
import { fileSystem, FileSystem } from "./file-system.js";
import { FormatterFactory } from "./formatter.js";

export interface CLIOptions {
  config?: string;
  format?: string;
  color?: boolean;
  maxWarnings?: number;
  quiet?: boolean;
  fix?: boolean;
  ext?: string[];
  ignore?: string[];
}

/**
 * TSQLint CLI の主要クラス
 */
export class CLI {
  private linter: Linter;

  constructor() {
    this.linter = new Linter();
  }

  /**
   * CLI を実行
   */
  async run(argv: string[] = process.argv): Promise<number> {
    const program = this.createProgram();
    
    try {
      await program.parseAsync(argv);
      return 0;
    } catch (error: any) {
      // Commander.js の exitOverride で発生するエラーを処理
      if (error.code && (
          error.code === 'commander.help' || 
          error.code === 'commander.version' || 
          error.code === 'commander.helpDisplayed') ||
          error.exitCode === 0) {
        return 0; // help や version の場合は成功とみなす
      }
      
      this.handleError(error);
      return 1;
    }
  }

  /**
   * Commander.js プログラムを作成
   */
  private createProgram(): Command {
    const program = new Command();

    program
      .name("tsqlint")
      .description("An AST-based SQL linter")
      .version("0.1.0")
      .argument("[files...]", "Files or directories to lint", ["**/*.sql"])
      .option("-c, --config <path>", "Configuration file path")
      .option("-f, --format <format>", "Output format", "stylish")
      .option("--no-color", "Disable colored output")
      .option("--max-warnings <number>", "Number of warnings to trigger nonzero exit code", parseInt)
      .option("-q, --quiet", "Report errors only")
      .option("--fix", "Automatically fix problems")
      .option("--ext <extensions>", "File extensions to lint", this.collectExtensions, [".sql"])
      .option("--ignore <patterns>", "Files/directories to ignore", this.collectIgnore, [])
      .action(async (files: string[], options: CLIOptions) => {
        await this.executeCommand(files, options);
      })
      .exitOverride();  // Prevent commander from exiting the process

    return program;
  }

  /**
   * メインコマンドを実行
   */
  private async executeCommand(patterns: string[], options: CLIOptions): Promise<void> {
    try {
      // 設定を読み込み
      const config = await this.loadConfig(options.config);
      
      // ファイルを検索
      const files = await this.findFiles(patterns, options);
      
      if (files.length === 0) {
        console.log("No files found to lint.");
        return;
      }

      // ファイルを読み込み
      const fileContents = await fileSystem.readFiles(files);
      
      // リントを実行
      const results = await this.linter.lintFiles(fileContents, config);
      
      // 結果をフォーマットして出力
      await this.outputResults(results, options);
      
      // 終了コードを決定
      const exitCode = this.determineExitCode(results, options);
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
      
    } catch (error) {
      this.handleError(error);
      process.exit(1);
    }
  }

  /**
   * 設定ファイルを読み込み
   */
  private async loadConfig(configPath?: string): Promise<Config> {
    try {
      return await configLoader.load(configPath);
    } catch (error) {
      throw new Error(`Configuration error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * リント対象ファイルを検索
   */
  private async findFiles(patterns: string[], options: CLIOptions): Promise<string[]> {
    const expandedPatterns = FileSystem.expandDirectoryPatterns(patterns);
    const ignorePatterns = [
      ...FileSystem.getDefaultIgnorePatterns(),
      ...(options.ignore || []),
    ];

    return await fileSystem.findFiles(expandedPatterns, {
      ignore: ignorePatterns,
    });
  }

  /**
   * リント結果を出力
   */
  private async outputResults(results: any[], options: CLIOptions): Promise<void> {
    if (options.quiet) {
      // quietモードではエラーのみ表示
      results = results.map(result => ({
        ...result,
        messages: result.messages.filter((msg: any) => msg.severity === "error"),
      }));
    }

    const formatter = FormatterFactory.create(options.format || "stylish");
    const output = formatter.format(results, {
      color: options.color !== false,
      cwd: process.cwd(),
    });

    if (output) {
      console.log(output);
    }
  }

  /**
   * 終了コードを決定
   */
  private determineExitCode(results: any[], options: CLIOptions): number {
    const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);

    if (totalErrors > 0) {
      return 1;
    }

    if (options.maxWarnings !== undefined && totalWarnings > options.maxWarnings) {
      return 1;
    }

    return 0;
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: unknown): void {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      if (process.env.NODE_ENV === "development") {
        console.error(error.stack);
      }
    } else {
      console.error("Error:", String(error));
    }
  }

  /**
   * 拡張子コレクター
   */
  private collectExtensions = (value: string, previous: string[]): string[] => {
    const extensions = value.split(",").map(ext => ext.trim().startsWith('.') ? ext.trim() : '.' + ext.trim());
    previous.push(...extensions);
    return previous;
  }

  /**
   * 無視パターンコレクター
   */
  private collectIgnore = (value: string, previous: string[]): string[] => {
    const patterns = value.split(",").map(pattern => pattern.trim());
    previous.push(...patterns);
    return previous;
  }
}

/**
 * デフォルトのCLIインスタンス
 */
export const cli = new CLI();
