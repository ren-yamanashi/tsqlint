import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CLI } from '../cli';
import { Linter } from '@tsqlint/core';

// 依存関係のモック
vi.mock('@tsqlint/core', () => ({
  Linter: vi.fn(() => ({
    lintFiles: vi.fn(),
  })),
}));

vi.mock('../loader.js', () => ({
  configLoader: {
    load: vi.fn(),
  },
}));

vi.mock('../file-system.js', () => ({
  fileSystem: {
    findFiles: vi.fn(),
    readFiles: vi.fn(),
  },
}));

const mockLinter = vi.mocked(Linter);

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // console.log をモック
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // process.exit をモック
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  test('should create CLI instance', () => {
    const cli = new CLI();
    expect(cli).toBeDefined();
    expect(mockLinter).toHaveBeenCalled();
  });

  test('should handle successful run with no arguments', async () => {
    const cli = new CLI();
    
    // 最小限の引数でテスト
    const result = await cli.run(['node', 'tsqlint', '--help']);
    
    expect(result).toBe(0);
  });

  test('should handle version option', async () => {
    const cli = new CLI();
    
    const result = await cli.run(['node', 'tsqlint', '--version']);
    
    expect(result).toBe(0);
  });

  test('should handle error in run', async () => {
    const cli = new CLI();
    
    // 無効なオプションを渡してエラーを発生させる
    const result = await cli.run(['node', 'tsqlint', '--invalid-option']);
    
    expect(result).toBe(1);
  });

  test('should parse command line options correctly', () => {
    const cli = new CLI();
    
    // プログラムの作成をテスト
    const program = (cli as any).createProgram();
    
    expect(program).toBeDefined();
    expect(program.name()).toBe('tsqlint');
    expect(program.description()).toBe('An AST-based SQL linter');
    expect(program.version()).toBe('0.1.0');
  });

  test('should collect extensions correctly', () => {
    const cli = new CLI();
    
    const extensions: string[] = [];
    const collectExtensions = (cli as any).collectExtensions;
    
    collectExtensions('.sql', extensions);
    collectExtensions('.mysql', extensions);
    
    expect(extensions).toEqual(['.sql', '.mysql']);
  });

  test('should collect ignore patterns correctly', () => {
    const cli = new CLI();
    
    const patterns: string[] = [];
    const collectIgnore = (cli as any).collectIgnore;
    
    collectIgnore('node_modules/**', patterns);
    collectIgnore('dist/**', patterns);
    
    expect(patterns).toEqual(['node_modules/**', 'dist/**']);
  });

  test('should handle error gracefully', () => {
    const cli = new CLI();
    
    const error = new Error('Test error');
    const handleError = (cli as any).handleError;
    
    expect(() => handleError(error)).not.toThrow();
    expect(console.error).toHaveBeenCalledWith('Error:', 'Test error');
  });

  test('should determine exit code correctly', () => {
    const cli = new CLI();
    
    const determineExitCode = (cli as any).determineExitCode;
    
    // エラーがある場合
    const resultsWithErrors = [
      { errorCount: 1, warningCount: 0, messages: [] }
    ];
    expect(determineExitCode(resultsWithErrors, {})).toBe(1);
    
    // 警告のみで maxWarnings 以下
    const resultsWithWarnings = [
      { errorCount: 0, warningCount: 2, messages: [] }
    ];
    expect(determineExitCode(resultsWithWarnings, { maxWarnings: 5 })).toBe(0);
    
    // 警告が maxWarnings を超える
    expect(determineExitCode(resultsWithWarnings, { maxWarnings: 1 })).toBe(1);
    
    // 問題なし
    const cleanResults = [
      { errorCount: 0, warningCount: 0, messages: [] }
    ];
    expect(determineExitCode(cleanResults, {})).toBe(0);
  });
});
