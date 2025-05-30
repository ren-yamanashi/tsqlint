import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ConfigLoader } from '../loader';
import { readFile, access } from 'fs/promises';

// fs/promisesのモック
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  access: vi.fn(),
}));

const mockReadFile = vi.mocked(readFile);
const mockAccess = vi.mocked(access);

describe('ConfigLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load', () => {
    test('should load config from specified path', async () => {
      const loader = new ConfigLoader();
      const mockConfig = { files: ['**/*.sql'], rules: [] };
      
      mockReadFile.mockResolvedValue(JSON.stringify(mockConfig));
      
      const result = await loader.load('/path/to/config.json');
      
      expect(result).toBeDefined();
      expect(result.files).toEqual(['**/*.sql']);
      expect(mockReadFile).toHaveBeenCalledWith(expect.stringContaining('config.json'), 'utf-8');
    });

    test('should return default config when no path specified and no config found', async () => {
      const loader = new ConfigLoader();
      
      // すべての設定ファイル候補をアクセス不可に設定
      mockAccess.mockRejectedValue(new Error('File not found'));
      
      const result = await loader.load();
      
      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.rules).toBeDefined();
    });

    test('should throw error when config file is invalid JSON', async () => {
      const loader = new ConfigLoader();
      
      mockReadFile.mockResolvedValue('{ invalid json }');
      
      await expect(loader.load('/path/to/invalid.json')).rejects.toThrow();
    });
  });

  describe('search', () => {
    test('should find config file in current directory', async () => {
      const loader = new ConfigLoader();
      
      // 最初のファイルが見つかる設定
      mockAccess
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(undefined); // tsqlint.config.ts が見つかる
      
      const result = await loader.search('/test/dir');
      
      expect(result).toBeDefined();
      expect(result).toContain('tsqlint.config.ts');
    });

    test('should return null when no config file found', async () => {
      const loader = new ConfigLoader();
      
      // すべてのファイルが見つからない
      mockAccess.mockRejectedValue(new Error('Not found'));
      
      const result = await loader.search('/test/dir');
      
      expect(result).toBeNull();
    });
  });

  describe('mergeConfigs', () => {
    test.skip('should merge configurations correctly', () => {
      const base = {
        files: ['**/*.sql'],
        rules: { 'rule1': 'error' as const },
        parser: { database: 'mysql' as const },
        env: { node: true }
      };
      
      const override = {
        rules: { 'rule2': 'warning' as const }
      };
      
      const result = ConfigLoader.mergeConfigs(base as any, override as any);
      
      expect(result.files).toEqual(['**/*.sql']);
      expect(result.rules).toEqual({ 'rule1': 'error', 'rule2': 'warning' });
      expect(result.parser).toEqual({ database: 'mysql' });
      expect(result.env).toEqual({ node: true });
    });

    test.skip('should handle multiple overrides', () => {
      const base = {
        files: ['**/*.sql'],
        rules: { 'rule1': 'error' as const },
        parser: { database: 'mysql' as const },
        env: { node: true }
      };
      
      const override1 = { rules: { 'rule2': 'warning' as const } };
      const override2 = { files: ['src/**/*.sql'] };
      
      const result = ConfigLoader.mergeConfigs(base as any, override1 as any, override2 as any);
      
      expect(result.files).toEqual(['src/**/*.sql']);
      expect(result.rules).toEqual({ 'rule1': 'error', 'rule2': 'warning' });
    });
  });
});
