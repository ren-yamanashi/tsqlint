import { describe, test, expect } from 'vitest';
import { noSelectStar } from "../no-select-star";

// テスト用のモックコンテキスト
function createMockContext() {
  const messages: Array<{ node: any; message: string; severity: string }> = [];
  
  return {
    filename: "test.sql",
    sourceCode: "",
    report: (descriptor: { node: any; message: string; severity: string }) => {
      messages.push(descriptor);
    },
    getMessages: () => messages,
  };
}

// テスト用のSELECTノード作成ヘルパー
function createSelectNode(columns: any) {
  return {
    type: "select" as const,
    columns,
    from: [],
  };
}

describe("no-select-star rule", () => {
  test("should detect simple SELECT *", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode("*");
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
    expect(messages[0].severity).toBe("warning");
  });

  test("should detect SELECT_STAR keyword", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode("SELECT_STAR");
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
  });

  test("should detect * in columns array", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode([
      { expr: { type: "column_ref", column: "id" } },
      { expr: { type: "star" } },
    ]);
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
  });

  test("should detect table.* pattern", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode([
      {
        expr: {
          type: "column_ref",
          table: "users",
          column: "*",
        },
      },
    ]);
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
  });

  test("should not flag explicit column names", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode([
      { expr: { type: "column_ref", column: "id" } },
      { expr: { type: "column_ref", column: "name" } },
      { expr: { type: "column_ref", column: "email" } },
    ]);
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(0);
  });

  test("should not flag qualified column names", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode([
      {
        expr: {
          type: "column_ref",
          table: "users",
          column: "id",
        },
      },
      {
        expr: {
          type: "column_ref",
          table: "posts",
          column: "title",
        },
      },
    ]);
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(0);
  });

  test("should handle multiple * in same query", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode([
      { expr: { type: "star" } },
      {
        expr: {
          type: "column_ref",
          table: "posts",
          column: "*",
        },
      },
    ]);
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
    expect(messages[1].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
  });

  test("should handle string format columns", () => {
    const context = createMockContext();
    const rule = noSelectStar.create(context as any);
    
    const node = createSelectNode(["id", "*", "name"]);
    rule.Select!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("Unexpected SELECT *. Specify explicit column names instead.");
  });

  test("rule metadata should be correct", () => {
    expect(noSelectStar.name).toBe("no-select-star");
    expect(noSelectStar.meta.description).toBe("Disallow SELECT * statements");
    expect(noSelectStar.meta.category).toBe("Best Practices");
    expect(noSelectStar.meta.recommended).toBe(true);
  });
});
