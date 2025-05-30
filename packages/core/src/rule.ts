import type { RuleDefinition, Rule } from "./types.js";

/**
 * ルール作成API
 * ESLintのcreateRuleと同様の設計
 */
export function createRule<T extends Record<string, any> = {}>(
  definition: RuleDefinition<T>
): Rule<T> {
  return {
    name: definition.name,
    meta: definition.meta,
    create: definition.create,
  };
}

/**
 * ルールの妥当性を検証
 */
export function validateRule(rule: Rule): void {
  if (!rule.name) {
    throw new Error("Rule must have a name");
  }

  if (!rule.meta?.description) {
    throw new Error("Rule must have a description");
  }

  if (!rule.meta?.category) {
    throw new Error("Rule must have a category");
  }

  if (typeof rule.create !== "function") {
    throw new Error("Rule must have a create function");
  }
}

/**
 * 複数のルールをまとめて検証
 */
export function validateRules(rules: Rule[]): void {
  const ruleNames = new Set<string>();

  for (const rule of rules) {
    validateRule(rule);

    if (ruleNames.has(rule.name)) {
      throw new Error(`Duplicate rule name: ${rule.name}`);
    }

    ruleNames.add(rule.name);
  }
}
