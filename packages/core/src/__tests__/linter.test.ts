import { describe, test, expect, vi } from 'vitest';
import { Linter } from '../linter';
import { createRule } from '../rule';

// テスト用のモックルール
const mockRule = createRule({
  name: 'test-rule',
  meta: {
    description: 'Test rule for linter',
    category: 'Test',
    recommended: false,
  },
  create(context) {
    return {
      Select(node) {
        if (node.columns && node.columns.length > 0 && 
            node.columns[0].expr && node.columns[0].expr.column === '*') {
          context.report({
            node,
            message: 'Test rule triggered on SELECT *',
            severity: 'warning',
          });
        }
      },
    };
  },
});

const mockRuleWithError = createRule({
  name: 'error-rule',
  meta: {
    description: 'Error rule for testing',
    category: 'Test',
    recommended: false,
  },
  create(context) {
    return {
      Select(node) {
        if (node.columns && node.columns.length > 0 && 
            node.columns[0].expr && node.columns[0].expr.column === '*') {
          context.report({
            node,
            message: 'This is an error',
            severity: 'error',
          });
        }
      },
    };
  },
});

describe('Linter', () => {
  test('should create linter instance', () => {
    const linter = new Linter();
    expect(linter).toBeDefined();
  });

  test('should lint SQL with rules', () => {
    const linter = new Linter();
    const sql = 'SELECT * FROM users';
    const config = { files: ['**/*.sql'], rules: [mockRule] };
    
    const result = linter.lint(sql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].message).toBe('Test rule triggered on SELECT *');
    expect(result.messages[0].severity).toBe('warning');
  });

  test('should lint SQL without triggering rules', () => {
    const linter = new Linter();
    const sql = 'SELECT id, name FROM users';
    const config = { files: ['**/*.sql'], rules: [mockRule] };
    
    const result = linter.lint(sql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  test('should handle multiple rules', () => {
    const linter = new Linter();
    const sql = 'SELECT * FROM users';
    const config = { files: ['**/*.sql'], rules: [mockRule, mockRuleWithError] };
    
    const result = linter.lint(sql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].message).toBe('Test rule triggered on SELECT *');
    expect(result.messages[0].severity).toBe('warning');
    expect(result.messages[1].message).toBe('This is an error');
    expect(result.messages[1].severity).toBe('error');
  });

  test('should handle empty SQL', () => {
    const linter = new Linter();
    const config = { files: ['**/*.sql'], rules: [mockRule] };
    
    const result = linter.lint('', config);
    
    expect(result).toBeDefined();
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.messages.length).toBe(0); // Empty SQL doesn't generate parse errors
    expect(result.errorCount).toBe(0); // No errors for empty SQL
  });

  test('should handle invalid SQL', () => {
    const linter = new Linter();
    const invalidSql = 'INVALID SQL';
    const config = { files: ['**/*.sql'], rules: [mockRule] };
    
    const result = linter.lint(invalidSql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.errorCount).toBeGreaterThan(0); // Should have parse errors
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages[0].ruleId).toBe('parse-error');
  });

  test('should handle no rules', () => {
    const linter = new Linter();
    const sql = 'SELECT * FROM users';
    const config = { files: ['**/*.sql'], rules: [] };
    
    const result = linter.lint(sql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  test('should handle CREATE TABLE statements', () => {
    const createTableRule = createRule({
      name: 'create-test-rule',
      meta: {
        description: 'Test CREATE rule',
        category: 'Test',
        recommended: false,
      },
      create(context) {
        return {
          Create(node) {
            if (node.keyword === 'table') {
              context.report({
                node,
                message: 'CREATE TABLE detected',
                severity: 'info',
              });
            }
          },
        };
      },
    });

    const linter = new Linter();
    const sql = 'CREATE TABLE users (id INT, name VARCHAR(255))';
    const config = { files: ['**/*.sql'], rules: [createTableRule] };
    
    const result = linter.lint(sql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].message).toBe('CREATE TABLE detected');
    expect(result.messages[0].severity).toBe('info');
  });

  test('should handle multiple statements', () => {
    const linter = new Linter();
    const sql = 'SELECT * FROM users; SELECT * FROM posts;';
    const config = { files: ['**/*.sql'], rules: [mockRule] };
    
    const result = linter.lint(sql, config);
    
    expect(result).toBeDefined();
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].message).toBe('Test rule triggered on SELECT *');
    expect(result.messages[1].message).toBe('Test rule triggered on SELECT *');
  });
});
