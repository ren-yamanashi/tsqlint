# TSQLint 使用例

このディレクトリには、TSQLintの使用方法を示すサンプルファイルが含まれています。

## ファイル構成

- `tsqlint.config.js` - TSQLintの設定ファイル
- `bad-examples.sql` - ルール違反のあるSQLファイル（lint エラーが発生）
- `good-examples.sql` - 適切に書かれたSQLファイル（lint エラーなし）
- `package.json` - このサンプルプロジェクトの設定

## 使用方法

### 1. 依存関係のインストール

```bash
# ルートディレクトリから
pnpm install
```

### 2. TSQLintの実行

```bash
# このディレクトリで実行
cd examples

# すべてのSQLファイルをlint
pnpm run lint

# JSON形式で出力
pnpm run lint:json

# 自動修正（将来実装予定）
pnpm run lint:fix
```

### 3. 期待される出力

`bad-examples.sql`に対して以下のようなエラーが報告されます：

- **no-select-star** ルール違反: `SELECT *` の使用
- **table-naming-convention** ルール違反: PascalCase、camelCase、kebab-case のテーブル名

`good-examples.sql`に対してはエラーが報告されません。

## 設定ファイルの説明

### tsqlint.config.js

```javascript
import { defineConfig } from "@tsqlint/core";
import { recommendedRules } from "@tsqlint/rules-recommended";

export default defineConfig({
  // 対象ファイル（glob パターン）
  files: ["**/*.sql"],
  
  // ルール設定
  rules: recommendedRules,
  
  // パーサー設定
  parser: {
    database: "mysql",
  },
});
```

### カスタム設定の例

ルールを個別に設定したい場合：

```javascript
export default defineConfig({
  files: ["**/*.sql"],
  rules: {
    "no-select-star": "error",
    "table-naming-convention": "warning",
  },
  parser: {
    database: "postgres",
  },
});
```

## 利用可能なルール

- **no-select-star**: `SELECT *` の使用を禁止
- **table-naming-convention**: テーブル名のsnake_case命名規則を強制

各ルールの詳細については、`@tsqlint/rules-recommended` パッケージのドキュメントを参照してください。
