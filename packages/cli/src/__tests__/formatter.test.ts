import { describe, test, expect } from 'vitest';
import { StylishFormatter, JSONFormatter, CompactFormatter } from '../formatter';
import { LintResult, LintMessage } from '@tsqlint/core';

describe('Formatters', () => {
  const mockLintMessage: LintMessage = {
    ruleId: 'no-select-star',
    severity: 'warning',
    message: 'Avoid using SELECT *',
    line: 1,
    column: 8,
    nodeType: 'SelectStatement'
  };

  const mockLintResult: LintResult = {
    filename: '/project/src/queries.sql',
    messages: [mockLintMessage],
    errorCount: 0,
    warningCount: 1,
    infoCount: 0
  };

  describe('StylishFormatter', () => {
    test('should format results in stylish format', () => {
      const formatter = new StylishFormatter();
      const output = formatter.format([mockLintResult], { color: false });

      expect(output).toContain('src/queries.sql');
      expect(output).toContain('1:8');
      expect(output).toContain('⚠');
      expect(output).toContain('Avoid using SELECT *');
      expect(output).toContain('no-select-star');
    });

    test('should format with colors when enabled', () => {
      const formatter = new StylishFormatter();
      const output = formatter.format([mockLintResult], { color: true });

      expect(output).toContain('src/queries.sql');
      expect(output).toContain('Avoid using SELECT *');
    });

    test('should handle empty results', () => {
      const formatter = new StylishFormatter();
      const output = formatter.format([], { color: false });

      expect(output).toBe('');
    });

    test('should handle results with no messages', () => {
      const formatter = new StylishFormatter();
      const cleanResult: LintResult = {
        filename: '/project/src/clean.sql',
        messages: [],
        errorCount: 0,
        warningCount: 0,
        infoCount: 0
      };

      const output = formatter.format([cleanResult], { color: false });

      expect(output).toBe('');
    });

    test('should include summary for multiple problems', () => {
      const formatter = new StylishFormatter();
      const errorMessage: LintMessage = {
        ruleId: 'parse-error',
        severity: 'error',
        message: 'Syntax error',
        line: 2,
        column: 1,
        nodeType: 'ParseError'
      };

      const multipleProblemsResult: LintResult = {
        filename: '/project/src/queries.sql',
        messages: [mockLintMessage, errorMessage],
        errorCount: 1,
        warningCount: 1,
        infoCount: 0
      };

      const output = formatter.format([multipleProblemsResult], { color: false });

      expect(output).toContain('✖ 2 problems');
      expect(output).toContain('(1 errors, 1 warnings, 0 infos)');
    });

    test('should display correct severity symbols', () => {
      const formatter = new StylishFormatter();
      
      const infoMessage: LintMessage = {
        ruleId: 'info-rule',
        severity: 'info',
        message: 'Info message',
        line: 1,
        column: 1,
        nodeType: 'Info'
      };

      const errorMessage: LintMessage = {
        ruleId: 'error-rule',
        severity: 'error',
        message: 'Error message',
        line: 2,
        column: 1,
        nodeType: 'Error'
      };

      const result: LintResult = {
        filename: '/project/test.sql',
        messages: [mockLintMessage, infoMessage, errorMessage],
        errorCount: 1,
        warningCount: 1,
        infoCount: 1
      };

      const output = formatter.format([result], { color: false });

      expect(output).toContain('⚠'); // warning
      expect(output).toContain('ℹ'); // info
      expect(output).toContain('✖'); // error
    });
  });

  describe('JSONFormatter', () => {
    test('should format results as JSON', () => {
      const formatter = new JSONFormatter();
      const output = formatter.format([mockLintResult]);

      const parsed = JSON.parse(output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].filename).toBe('/project/src/queries.sql');
      expect(parsed[0].messages).toHaveLength(1);
      expect(parsed[0].messages[0].message).toBe('Avoid using SELECT *');
    });

    test('should handle empty results as JSON', () => {
      const formatter = new JSONFormatter();
      const output = formatter.format([]);

      const parsed = JSON.parse(output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('CompactFormatter', () => {
    test('should format results in compact format', () => {
      const formatter = new CompactFormatter();
      const output = formatter.format([mockLintResult], { color: false });

      expect(output).toContain('/project/src/queries.sql: line 1, col 8, warning - Avoid using SELECT * (no-select-star)');
    });

    test('should format with colors when enabled', () => {
      const formatter = new CompactFormatter();
      const output = formatter.format([mockLintResult], { color: true });

      expect(output).toContain('Avoid using SELECT *');
      expect(output).toContain('no-select-star');
    });

    test('should handle multiple messages', () => {
      const formatter = new CompactFormatter();
      const errorMessage: LintMessage = {
        ruleId: 'syntax-error',
        severity: 'error',
        message: 'Syntax error found',
        line: 2,
        column: 5,
        nodeType: 'Error'
      };

      const multipleResult: LintResult = {
        filename: '/project/src/queries.sql',
        messages: [mockLintMessage, errorMessage],
        errorCount: 1,
        warningCount: 1,
        infoCount: 0
      };

      const output = formatter.format([multipleResult], { color: false });

      expect(output).toContain('line 1, col 8, warning');
      expect(output).toContain('line 2, col 5, error');
    });

    test('should handle empty results', () => {
      const formatter = new CompactFormatter();
      const output = formatter.format([], { color: false });

      expect(output).toBe('');
    });
  });
});
