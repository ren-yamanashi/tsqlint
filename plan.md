# TSQLint 設計書

## プロジェクト概要

`tsqlint` は、SQLファイルに対するASTベースのリンターです。ESLintと類似した設計を採用し、拡張可能なルールシステムを提供します。

## モノレポ構成

```sh
tsqlint/
├── packages/
│   ├── core/                    # コアライブラリ (@tsqlint/core)
│   │   ├── src/
│   │   │   ├── linter.ts       # メインのリンター実装
│   │   │   ├── rule.ts         # ルール作成API
│   │   │   ├── config.ts       # 設定API
│   │   │   ├── context.ts      # ルール実行コンテキスト
│   │   │   ├── parser.ts       # SQLパーサー（node-sql-parser ラッパー）
│   │   │   └── types.ts        # 型定義
│   │   └── package.json
│   ├── cli/                     # CLIパッケージ (tsqlint)
│   │   ├── src/
│   │   │   ├── cli.ts          # CLIエントリーポイント
│   │   │   ├── formatter.ts    # 出力フォーマッター
│   │   │   └── loader.ts       # 設定ローダー
│   │   ├── bin/
│   │   │   └── tsqlint         # 実行ファイル
│   │   └── package.json
│   └── rules-recommended/       # 推奨ルールセット (@tsqlint/rules-recommended)
│       ├── src/
│       │   ├── rules/
│       │   │   ├── no-select-star.ts
│       │   │   ├── table-naming-convention.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       └── package.json
├── examples/                    # 使用例
└── docs/                       # ドキュメント
```

## パッケージ詳細

### @tsqlint/core

**責務:**

- SQLファイルの解析とAST生成
- ルール実行エンジン
- ルール作成API提供
- 設定管理API提供

**主要API:**

```ts
// ルール作成API
export function createRule<T extends Record<string, any> = {}>(
  definition: RuleDefinition<T>
): Rule<T>

// 設定API
export function defineConfig(config: Config): Config

// リンター実行API
export class Linter {
  lint(filePath: string, content: string, config: Config): LintResult[]
}
```

### tsqlint (CLI)

**責務:**

- コマンドライン実行
- ファイル検索・読み込み
- 結果出力・フォーマット
- 設定ファイル読み込み

**実行方法:**

```bash
# 基本実行
tsqlint --config tsqlint.config.ts

# ファイル指定
tsqlint --config tsqlint.config.ts "src/**/*.sql"

# 出力形式指定（将来的に）
tsqlint --format json --config tsqlint.config.ts
```

## ルールシステム

### ルール定義

```ts
import { createRule } from "@tsqlint/core";

const exampleRule = createRule({
  name: "example-rule",
  meta: {
    description: "An example rule that checks for something.",
    category: "Best Practices",
    recommended: true,
  },
  create(context) {
    return {
      // node-sql-parser のASTノードタイプに対応
      Create(node) {
        // CREATE文をチェック
        if (node.keyword === "table") {
          const tableInfo = node.table?.[0];
          if (tableInfo && !tableInfo.table.includes("_")) {
            context.report({
              node,
              message: "Table name should use snake_case convention",
              severity: "error",
            });
          }
        }
      },
      
      Select(node) {
        // SELECT文をチェック
        if (node.columns === "*") {
          context.report({
            node,
            message: "Avoid using SELECT *",
            severity: "warning",
          });
        }
      },
    };
  },
});

export default exampleRule;
```

### Context API

```ts
interface RuleContext {
  // ファイル情報
  filename: string;
  sourceCode: string;
  
  // 報告API
  report(descriptor: {
    node: ASTNode;
    message: string;
    severity: "error" | "warning";
    data?: Record<string, string>; // メッセージテンプレート用
  }): void;
  
  // ユーティリティ
  getSourceLocation(node: ASTNode): SourceLocation;
  getTokens(node: ASTNode): Token[];
}
```

### メッセージテンプレート

ASTノードから自動的に抽出される変数：

- `{{database_name}}`: テーブルのデータベース名
- `{{table_name}}`: テーブル名
- `{{column_name}}`: カラム名

```ts
context.report({
  node,
  message: "Table {{database_name}}.{{table_name}} violates naming convention",
  severity: "error",
});
```

出力例：

```plain
Table aim_contents.user_data violates naming convention
  at sample.sql:15:1
```

## 設定ファイル

```ts
import { defineConfig } from "@tsqlint/core";
import recommended from "@tsqlint/rules-recommended";
import customRule from "./rules/custom-rule";

export default defineConfig({
  // ファイル対象（glob パターン）
  files: ["**/*.sql"],
  
  // ルール設定
  rules: [
    ...recommended.rules,
    customRule,
  ],
  
  // パーサー設定
  parser: {
    database: "mysql", // mysql | postgres | sqlite | mssql
    options: {
      // node-sql-parser のオプション
    },
  },
  
  // 環境設定
  env: {
    // 将来的な拡張用
  },
});
```

## AST ノードタイプ

`node-sql-parser`のASTノードタイプに基づく：

- `Create`: CREATE文（テーブル、インデックスなど）
- `Select`: SELECT文
- `Insert`: INSERT文
- `Update`: UPDATE文
- `Delete`: DELETE文
- `Alter`: ALTER文
- `Drop`: DROP文
- `Use`: USE文

各ノードは以下の情報を含む：

```ts
interface CreateNode {
  type: "create";
  keyword: "table" | "index" | "view";
  table?: Array<{ db?: string; table: string; }>;
  create_definitions?: ColumnDefinition[];
  // その他のプロパティ
}
```

## エラー出力形式

### プレーンテキスト形式

```plain
error: Table name should use snake_case convention
  table: aim_contents.userData
  file: migrations/001_create_users.sql:15:1

warning: Avoid using SELECT *
  file: queries/get_users.sql:3:8
```

### JSON形式（将来実装）

```json
{
  "results": [
    {
      "filePath": "migrations/001_create_users.sql",
      "messages": [
        {
          "ruleId": "table-naming-convention",
          "severity": "error",
          "message": "Table name should use snake_case convention",
          "line": 15,
          "column": 1,
          "data": {
            "database_name": "aim_contents",
            "table_name": "userData"
          }
        }
      ]
    }
  ]
}
```

## 実装フェーズ

### Phase 1: Core機能

- [ ] @tsqlint/core パッケージの基本実装
- [ ] CLI パッケージの基本実装
- [ ] 基本的なルール実行エンジン
- [ ] 設定ファイル読み込み

### Phase 2: ルールシステム

- [ ] ルール作成API
- [ ] Context API
- [ ] メッセージテンプレート機能
- [ ] 基本的な推奨ルールセット

### Phase 3: 拡張機能

- [ ] JSON出力形式対応
- [ ] 詳細なエラー位置情報
- [ ] プラグインシステムの拡張

## 依存関係管理

### パッケージ間の依存関係

- `tsqlint` → `@tsqlint/core`
- `@tsqlint/rules-recommended` → `@tsqlint/core`
- カスタムルールパッケージ → `@tsqlint/core`

### 外部依存関係

- `node-sql-parser`: SQLパーサー（コア機能）
- `glob`: ファイル検索（CLI）
- `typescript`: 開発時のみ

バンドル時に`node-sql-parser`以外の依存関係は含めず、ルール作成者は`@tsqlint/core`のみを依存関係に追加すれば済むように設計する。
