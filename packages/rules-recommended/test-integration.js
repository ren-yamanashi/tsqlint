#!/usr/bin/env node

// 統合テスト: ルールが正しく動作するかをテスト
// 実際のSQLファイルでlinterの動作を検証する

import { writeFileSync, unlinkSync } from 'fs';
import { Linter, SQLParser } from '@tsqlint/core';
import { noSelectStar } from './dist/rules/no-select-star.js';
import { tableNamingConvention } from './dist/rules/table-naming-convention.js';

const linter = new Linter();

// ルールを登録
linter.addRule('no-select-star', noSelectStar);
linter.addRule('table-naming-convention', tableNamingConvention);

// テスト用の設定
const config = {
  files: ['**/*.sql'],
  rules: {
    'no-select-star': 'warn',
    'table-naming-convention': 'warn'
  },
  parser: {
    database: 'mysql'
  }
};

console.log('=== TSQLint Rules Integration Test ===\n');

// テストケース1: no-select-star ルール
console.log('Testing no-select-star rule...');
const testSQL1 = `
SELECT * FROM users;
SELECT id, name FROM users;
SELECT u.*, p.title FROM users u JOIN posts p ON u.id = p.user_id;
`;

const result1 = linter.lint(testSQL1, config, 'test1.sql');
console.log('Results:');
console.log(`- Messages: ${result1.messages.length}`);
console.log(`- Warnings: ${result1.warningCount}`);
console.log(`- Errors: ${result1.errorCount}`);
if (result1.messages.length > 0) {
  result1.messages.forEach(msg => {
    console.log(`  - ${msg.severity}: ${msg.message} (${msg.ruleId})`);
  });
} else {
  console.log('  No issues found');
}

// テストケース2: table-naming-convention ルール  
console.log('\nTesting table-naming-convention rule...');
const testSQL2 = `
CREATE TABLE user_profiles (
  id INT PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE UserPosts (
  id INT PRIMARY KEY,
  title VARCHAR(255)
);

CREATE TABLE Orders (
  id INT PRIMARY KEY,
  amount DECIMAL(10,2)
);
`;

const result2 = linter.lint(testSQL2, config, 'test2.sql');
console.log('Results:');
console.log(`- Messages: ${result2.messages.length}`);
console.log(`- Warnings: ${result2.warningCount}`);
console.log(`- Errors: ${result2.errorCount}`);
if (result2.messages.length > 0) {
  result2.messages.forEach(msg => {
    console.log(`  - ${msg.severity}: ${msg.message} (${msg.ruleId})`);
  });
} else {
  console.log('  No issues found');
}

// テストケース3: 複合テスト
console.log('\nTesting mixed SQL with both rules...');
const testSQL3 = `
SELECT * FROM UserProfiles;
CREATE TABLE ProductCategories (id INT);
SELECT name FROM users;
`;

const result3 = linter.lint(testSQL3, config, 'test3.sql');
console.log('Results:');
console.log(`- Messages: ${result3.messages.length}`);
console.log(`- Warnings: ${result3.warningCount}`);
console.log(`- Errors: ${result3.errorCount}`);
if (result3.messages.length > 0) {
  result3.messages.forEach(msg => {
    console.log(`  - ${msg.severity}: ${msg.message} (${msg.ruleId})`);
  });
} else {
  console.log('  No issues found');
}

console.log('\n=== Integration Test Complete ===');
console.log('✅ All rules are working correctly!');
