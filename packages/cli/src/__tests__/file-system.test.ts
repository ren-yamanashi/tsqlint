import { describe, test, expect, vi, beforeEach } from 'vitest';
import { FileSystem } from '../file-system';
import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';

// 外部モジュールのモック
vi.mock('glob', () => ({
  glob: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  stat: vi.fn(),
}));

const mockGlob = vi.mocked(glob);
const mockReadFile = vi.mocked(readFile);
const mockStat = vi.mocked(stat);

describe('FileSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findFiles', () => {
    test('should find SQL files using glob patterns', async () => {
      const fileSystem = new FileSystem();
      const mockFiles = ['/path/to/file1.sql', '/path/to/file2.sql'];
      
      mockGlob.mockResolvedValue(mockFiles);
      
      const result = await fileSystem.findFiles('**/*.sql');
      
      expect(result).toEqual(mockFiles);
      expect(mockGlob).toHaveBeenCalledWith('**/*.sql', {
        cwd: process.cwd(),
        ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
        absolute: true,
        nodir: true,
      });
    });

    test('should handle multiple patterns', async () => {
      const fileSystem = new FileSystem();
      const patterns = ['src/**/*.sql', 'test/**/*.sql'];
      
      mockGlob
        .mockResolvedValueOnce(['/src/file1.sql'])
        .mockResolvedValueOnce(['/test/file2.sql']);
      
      const result = await fileSystem.findFiles(patterns);
      
      expect(result).toHaveLength(2);
      expect(result).toContain('/src/file1.sql');
      expect(result).toContain('/test/file2.sql');
    });

    test('should filter out non-SQL files', async () => {
      const fileSystem = new FileSystem();
      const mockFiles = ['/path/file1.sql', '/path/file2.txt', '/path/file3.sql'];
      
      mockGlob.mockResolvedValue(mockFiles);
      
      const result = await fileSystem.findFiles('**/*');
      
      expect(result).toEqual(['/path/file1.sql', '/path/file3.sql']);
    });

    test('should respect maxFiles limit', async () => {
      const fileSystem = new FileSystem();
      const mockFiles = Array.from({ length: 10 }, (_, i) => `/path/file${i}.sql`);
      
      mockGlob.mockResolvedValue(mockFiles);
      
      const result = await fileSystem.findFiles('**/*.sql', { maxFiles: 5 });
      
      expect(result).toHaveLength(5);
    });

    test('should handle custom ignore patterns', async () => {
      const fileSystem = new FileSystem();
      
      await fileSystem.findFiles('**/*.sql', { 
        ignore: ['**/temp/**'] 
      });
      
      expect(mockGlob).toHaveBeenCalledWith('**/*.sql', {
        cwd: process.cwd(),
        ignore: ['**/temp/**', '**/node_modules/**', '**/dist/**', '**/.git/**'],
        absolute: true,
        nodir: true,
      });
    });
  });

  describe('readFiles', () => {
    test('should read file contents successfully', async () => {
      const fileSystem = new FileSystem();
      const files = ['/path/file1.sql', '/path/file2.sql'];
      
      mockReadFile
        .mockResolvedValueOnce('SELECT * FROM users;')
        .mockResolvedValueOnce('CREATE TABLE posts (id INT);');
      
      const result = await fileSystem.readFiles(files);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        content: 'SELECT * FROM users;',
        filename: '/path/file1.sql'
      });
      expect(result[1]).toEqual({
        content: 'CREATE TABLE posts (id INT);',
        filename: '/path/file2.sql'
      });
    });

    test('should handle file read errors', async () => {
      const fileSystem = new FileSystem();
      const files = ['/path/nonexistent.sql'];
      
      mockReadFile.mockRejectedValue(new Error('File not found'));
      
      await expect(fileSystem.readFiles(files)).rejects.toThrow('File not found');
    });

    test('should handle empty file list', async () => {
      const fileSystem = new FileSystem();
      
      const result = await fileSystem.readFiles([]);
      
      expect(result).toEqual([]);
      expect(mockReadFile).not.toHaveBeenCalled();
    });
  });

  describe('isDirectory', () => {
    test('should return true for directories', async () => {
      const fileSystem = new FileSystem();
      
      mockStat.mockResolvedValue({ isDirectory: () => true } as any);
      
      const result = await fileSystem.isDirectory('/path/to/dir');
      
      expect(result).toBe(true);
      expect(mockStat).toHaveBeenCalledWith('/path/to/dir');
    });

    test('should return false for files', async () => {
      const fileSystem = new FileSystem();
      
      mockStat.mockResolvedValue({ isDirectory: () => false } as any);
      
      const result = await fileSystem.isDirectory('/path/to/file.sql');
      
      expect(result).toBe(false);
    });

    test('should handle stat errors', async () => {
      const fileSystem = new FileSystem();
      
      mockStat.mockRejectedValue(new Error('Path not found'));
      
      await expect(fileSystem.isDirectory('/nonexistent')).rejects.toThrow('Path not found');
    });
  });
});
