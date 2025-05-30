import { describe, test, expect } from 'vitest';
import { SQLParser } from '../parser';

describe('SQLParser', () => {
  test('should parse simple SELECT statement', () => {
    const parser = new SQLParser();
    const sql = 'SELECT * FROM users';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
  });

  test('should parse CREATE TABLE statement', () => {
    const parser = new SQLParser();
    const sql = 'CREATE TABLE users (id INT, name VARCHAR(255))';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
    expect(result.ast.length).toBeGreaterThan(0);
  });

  test('should handle invalid SQL', () => {
    const parser = new SQLParser();
    const invalidSql = 'INVALID SQL SYNTAX';
    
    const result = parser.parse(invalidSql);
    
    expect(result).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should parse multiple statements', () => {
    const parser = new SQLParser();
    const sql = 'SELECT * FROM users; CREATE TABLE posts (id INT);';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
  });

  test('should parse SELECT with specific columns', () => {
    const parser = new SQLParser();
    const sql = 'SELECT id, name, email FROM users WHERE id = 1';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
    expect(result.ast.length).toBeGreaterThan(0);
  });

  test('should handle empty input', () => {
    const parser = new SQLParser();
    
    const result = parser.parse('');
    
    expect(result).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
    expect(result.ast.length).toBe(0); // Empty SQL returns empty AST
    expect(result.errors.length).toBe(0); // Empty SQL doesn't generate parse errors
  });

  test('should parse INSERT statement', () => {
    const parser = new SQLParser();
    const sql = 'INSERT INTO users (name, email) VALUES ("John", "john@example.com")';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
  });

  test('should parse UPDATE statement', () => {
    const parser = new SQLParser();
    const sql = 'UPDATE users SET name = "Jane" WHERE id = 1';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
  });

  test('should parse DELETE statement', () => {
    const parser = new SQLParser();
    const sql = 'DELETE FROM users WHERE id = 1';
    
    const result = parser.parse(sql);
    
    expect(result).toBeDefined();
    expect(result.ast).toBeDefined();
    expect(Array.isArray(result.ast)).toBe(true);
  });
});
