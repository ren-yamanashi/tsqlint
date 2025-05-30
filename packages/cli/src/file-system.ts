import { glob } from "glob";
import { readFile, stat } from "fs/promises";
import { resolve, extname } from "path";

export interface FileManager {
  findFiles(patterns: string | string[], options?: FindFileOptions): Promise<string[]>;
  readFiles(filePaths: string[]): Promise<Array<{ content: string; filename: string }>>;
  isDirectory(path: string): Promise<boolean>;
}

export interface FindFileOptions {
  cwd?: string;
  ignore?: string[];
  maxFiles?: number;
}

/**
 * SQLファイルのデフォルト拡張子
 */
const DEFAULT_SQL_EXTENSIONS = [".sql"];

/**
 * ファイル管理クラス
 */
export class FileSystem implements FileManager {
  /**
   * パターンに一致するファイルを検索
   */
  async findFiles(
    patterns: string | string[],
    options: FindFileOptions = {}
  ): Promise<string[]> {
    const { cwd = process.cwd(), ignore = [], maxFiles } = options;
    const searchPatterns = Array.isArray(patterns) ? patterns : [patterns];
    
    const allFiles = new Set<string>();

    for (const pattern of searchPatterns) {
      const files = await glob(pattern, {
        cwd,
        ignore: [...ignore, "**/node_modules/**", "**/dist/**", "**/.git/**"],
        absolute: true,
        nodir: true,
      });

      files.forEach(file => allFiles.add(file));
    }

    let result = Array.from(allFiles);

    // SQLファイルのみフィルタリング
    result = result.filter(file => this.isSQLFile(file));

    // ファイル数制限
    if (maxFiles && result.length > maxFiles) {
      result = result.slice(0, maxFiles);
    }

    return result.sort();
  }

  /**
   * 指定されたファイルパスからファイル内容を読み込み
   */
  async readFiles(filePaths: string[]): Promise<Array<{ content: string; filename: string }>> {
    const results: Array<{ content: string; filename: string }> = [];

    for (const filePath of filePaths) {
      try {
        const content = await readFile(filePath, "utf-8");
        results.push({
          content,
          filename: resolve(filePath),
        });
      } catch (error) {
        throw new Error(
          `Failed to read file ${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return results;
  }

  /**
   * パスがディレクトリかどうか判定
   */
  async isDirectory(path: string): Promise<boolean> {
    const stats = await stat(path);
    return stats.isDirectory();
  }

  /**
   * ファイルがSQLファイルかどうか判定
   */
  private isSQLFile(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return DEFAULT_SQL_EXTENSIONS.includes(ext);
  }

  /**
   * ディレクトリパターンをファイルパターンに展開
   */
  static expandDirectoryPatterns(patterns: string[]): string[] {
    return patterns.flatMap(pattern => {
      if (pattern.endsWith("/") || !pattern.includes("*")) {
        // ディレクトリパターンの場合、SQLファイルパターンを追加
        const basePattern = pattern.endsWith("/") ? pattern : `${pattern}/`;
        return [`${basePattern}**/*.sql`];
      }
      return [pattern];
    });
  }

  /**
   * 除外パターンのデフォルト値
   */
  static getDefaultIgnorePatterns(): string[] {
    return [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.nyc_output/**",
    ];
  }
}

/**
 * デフォルトのFileSystemインスタンス
 */
export const fileSystem = new FileSystem();
