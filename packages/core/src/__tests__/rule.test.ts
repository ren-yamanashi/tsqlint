import { describe, test, expect, vi } from 'vitest';

import { createRule } from '../rule';

describe('createRule', () => {
  test('should create a rule with basic properties', () => {
    const rule = createRule({
      name: 'test-rule',
      meta: {
        description: 'A test rule',
        category: 'Best Practices',
        recommended: true,
      },
      create(context) {
        return {};
      },
    });

    expect(rule.name).toBe('test-rule');
    expect(rule.meta.description).toBe('A test rule');
    expect(rule.meta.category).toBe('Best Practices');
    expect(rule.meta.recommended).toBe(true);
    expect(typeof rule.create).toBe('function');
  });

  test('should create rule with Select visitor', () => {
    const mockContext = {
      filename: 'test.sql',
      sourceCode: 'SELECT * FROM users',
      report: vi.fn(),
    };

    const rule = createRule({
      name: 'select-rule',
      meta: {
        description: 'Test SELECT rule',
        category: 'Test',
        recommended: false,
      },
      create(context) {
        return {
          Select(node) {
            context.report({
              node,
              message: 'SELECT detected',
              severity: 'info',
            });
          },
        };
      },
    });

    const visitor = rule.create(mockContext as any);
    expect(visitor.Select).toBeDefined();
    expect(typeof visitor.Select).toBe('function');

    // モックノードでテスト
    const mockNode = { type: 'select' as const, columns: '*' };
    visitor.Select!(mockNode as any);

    expect(mockContext.report).toHaveBeenCalledWith({
      node: mockNode,
      message: 'SELECT detected',
      severity: 'info',
    });
  });

  test('should create rule with Create visitor', () => {
    const mockContext = {
      filename: 'test.sql',
      sourceCode: 'CREATE TABLE users',
      report: vi.fn(),
    };

    const rule = createRule({
      name: 'create-rule',
      meta: {
        description: 'Test CREATE rule',
        category: 'Test',
        recommended: false,
      },
      create(context) {
        return {
          Create(node) {
            context.report({
              node,
              message: 'CREATE detected',
              severity: 'warning',
            });
          },
        };
      },
    });

    const visitor = rule.create(mockContext as any);
    expect(visitor.Create).toBeDefined();
    expect(typeof visitor.Create).toBe('function');

    // モックノードでテスト
    const mockNode = { type: 'create' as const, keyword: 'table' };
    visitor.Create!(mockNode as any);

    expect(mockContext.report).toHaveBeenCalledWith({
      node: mockNode,
      message: 'CREATE detected',
      severity: 'warning',
    });
  });

  test('should create rule with multiple visitors', () => {
    const mockContext = {
      filename: 'test.sql',
      sourceCode: 'SELECT * FROM users',
      report: vi.fn(),
    };

    const rule = createRule({
      name: 'multi-rule',
      meta: {
        description: 'Test multi-visitor rule',
        category: 'Test',
        recommended: false,
      },
      create(context) {
        return {
          Select(node) {
            context.report({
              node,
              message: 'SELECT in multi-rule',
              severity: 'info',
            });
          },
          Create(node) {
            context.report({
              node,
              message: 'CREATE in multi-rule',
              severity: 'info',
            });
          },
          Insert(node) {
            context.report({
              node,
              message: 'INSERT in multi-rule',
              severity: 'info',
            });
          },
        };
      },
    });

    const visitor = rule.create(mockContext as any);
    expect(visitor.Select).toBeDefined();
    expect(visitor.Create).toBeDefined();
    expect(visitor.Insert).toBeDefined();
  });

  test('should handle rule with no visitors', () => {
    const rule = createRule({
      name: 'empty-rule',
      meta: {
        description: 'Empty rule',
        category: 'Test',
        recommended: false,
      },
      create(context) {
        return {};
      },
    });

    const mockContext = {
      filename: 'test.sql',
      sourceCode: '',
      report: vi.fn(),
    };

    const visitor = rule.create(mockContext as any);
    expect(visitor).toEqual({});
  });

  test('should preserve rule metadata', () => {
    const metadata = {
      description: 'Complex test rule',
      category: 'Best Practices',
      recommended: true,
    };

    const rule = createRule({
      name: 'complex-rule',
      meta: metadata,
      create(context) {
        return {
          Select(node) {
            // Rule logic
          },
        };
      },
    });

    expect(rule.meta).toEqual(metadata);
    expect(rule.meta.description).toBe('Complex test rule');
    expect(rule.meta.category).toBe('Best Practices');
    expect(rule.meta.recommended).toBe(true);
  });
});
