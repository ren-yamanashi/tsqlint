import type { Rule } from "./types.js";

/**
 * ルールレジストリ
 * 利用可能な全ルールを管理し、名前による検索を提供
 */
export class RuleRegistry {
  private rules = new Map<string, Rule>();

  /**
   * ルールを登録
   */
  register(rule: Rule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 複数のルールを登録
   */
  registerMany(rules: Rule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  /**
   * ルール名でルールを取得
   */
  get(name: string): Rule | undefined {
    return this.rules.get(name);
  }

  /**
   * すべてのルールを取得
   */
  getAll(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 登録されているルール名の一覧を取得
   */
  getNames(): string[] {
    return Array.from(this.rules.keys());
  }

  /**
   * ルールが登録されているかチェック
   */
  has(name: string): boolean {
    return this.rules.has(name);
  }

  /**
   * ルールの登録を解除
   */
  unregister(name: string): boolean {
    return this.rules.delete(name);
  }

  /**
   * すべてのルールをクリア
   */
  clear(): void {
    this.rules.clear();
  }
}

/**
 * グローバルルールレジストリ
 */
export const globalRuleRegistry = new RuleRegistry();

// デフォルトエクスポート
export default RuleRegistry;
