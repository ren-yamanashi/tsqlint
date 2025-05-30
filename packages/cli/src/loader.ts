import { readFile, access } from "fs/promises";
import { resolve, join, dirname } from "path";
import { Config, defineConfig, createDefaultConfig, mergeConfig } from "@tsqlint/core";

// 推奨ルールを自動登録
import "@tsqlint/rules-recommended";

export interface ConfigFileLoader {
  load(configPath?: string): Promise<Config>;
  search(startDir?: string): Promise<string | null>;
}

/**
 * 設定ファイルの候補名
 */
const CONFIG_FILE_NAMES = [
  "tsqlint.config.js",
  "tsqlint.config.mjs",
  "tsqlint.config.ts",
  "tsqlint.config.json", // 追加
  ".tsqlintrc.js",
  ".tsqlintrc.mjs",
  ".tsqlintrc.json",
];

/**
 * 設定ファイルローダー
 */
export class ConfigLoader implements ConfigFileLoader {
  /**
   * 設定ファイルを読み込み
   */
  async load(configPath?: string): Promise<Config> {
    let config: Config;

    if (configPath) {
      // 指定されたパスから読み込み
      config = await this.loadFromPath(configPath);
    } else {
      // 自動検索して読み込み
      const foundPath = await this.search();
      if (foundPath) {
        config = await this.loadFromPath(foundPath);
      } else {
        // デフォルト設定を使用
        config = createDefaultConfig();
      }
    }
    return config;
  }

  /**
   * 設定ファイルを検索
   */
  async search(startDir: string = process.cwd()): Promise<string | null> {
    let currentDir = resolve(startDir);
    const rootDir = resolve("/");

    while (currentDir !== rootDir) {
      for (const fileName of CONFIG_FILE_NAMES) {
        const configPath = join(currentDir, fileName);
        try {
          await access(configPath);
          return configPath;
        } catch {
          // ファイルが存在しない場合は続行
        }
      }

      // 親ディレクトリに移動
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
    return null;
  }

  /**
   * 指定されたパスから設定ファイルを読み込み
   */
  private async loadFromPath(configPath: string): Promise<Config> {
    const absolutePath = resolve(configPath);

    try {
      if (configPath.endsWith(".json")) {
        return await this.loadJSONConfig(absolutePath);
      } else {
        return await this.loadJSConfig(absolutePath);
      }
    } catch (error) {
      throw new Error(
        `Failed to load config from ${configPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * JSON設定ファイルを読み込み
   */
  private async loadJSONConfig(configPath: string): Promise<Config> {
    const content = await readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return defineConfig(config);
  }

  /**
   * JavaScript/TypeScript設定ファイルを読み込み
   */
  private async loadJSConfig(configPath: string): Promise<Config> {
    let configModule;
    try {
      configModule = await import(`file://${configPath}`);
    } catch (e: any) {
      throw new Error(`Failed to import config file ${configPath}: ${e.message}`);
    }

    const config = configModule.default || configModule;
    
    if (typeof config === "function") {
      const executedConfig = config();
      return defineConfig(executedConfig);
    }
    
    return defineConfig(config);
  }

  /**
   * 複数の設定をマージ
   */
  static mergeConfigs(base: Config, ...overrides: Partial<Config>[]): Config {
    return overrides.reduce<Config>((merged, override) => {
      // Partial<Config>をConfigに変換するために、必須フィールドを保証
      const completeOverride: Config = {
        files: override.files ?? merged.files,
        rules: override.rules ?? merged.rules,
        parser: override.parser ?? merged.parser,
        env: override.env ?? merged.env,
      } as Config;
      return mergeConfig(merged, completeOverride);
    }, base);
  }
}

/**
 * デフォルトのConfigLoaderインスタンス
 */
export const configLoader = new ConfigLoader();
