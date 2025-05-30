import { describe, test, expect } from 'vitest';
import { tableNamingConvention } from "../table-naming-convention";

// テスト用のモックコンテキスト
function createMockContext() {
  const messages: Array<{ node: any; message: string; severity: string; data?: Record<string, string> }> = [];
  
  return {
    filename: "test.sql",
    sourceCode: "",
    report: (descriptor: { node: any; message: string; severity: string; data?: Record<string, string> }) => {
      messages.push(descriptor);
    },
    getMessages: () => messages,
  };
}

// テスト用のCREATEノード作成ヘルパー
function createCreateTableNode(tableName: string) {
  return {
    type: "create" as const,
    keyword: "table" as const,
    table: [{ table: tableName }],
    create_definitions: [],
  };
}

function createCreateIndexNode(indexName: string) {
  return {
    type: "create" as const,
    keyword: "index" as const,
    table: [{ table: indexName }],
  };
}

describe("table-naming-convention rule", () => {
  test("should accept valid snake_case table names", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const validNames = [
      "users",
      "user_profiles",
      "product_categories",
      "order_items",
      "api_keys",
      "user_sessions2",
      "log_entries_2024",
    ];

    validNames.forEach(name => {
      const node = createCreateTableNode(name);
      rule.Create!(node);
    });
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(0);
  });

  test("should flag PascalCase table names", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = createCreateTableNode("UserProfiles");
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain("UserProfiles");
    expect(messages[0].message).toContain("snake_case");
    expect(messages[0].message).toContain("user_profiles");
    expect(messages[0].severity).toBe("warning");
    expect(messages[0].data?.tableName).toBe("UserProfiles");
    expect(messages[0].data?.suggestedName).toBe("user_profiles");
  });

  test("should flag camelCase table names", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = createCreateTableNode("userProfiles");
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain("userProfiles");
    expect(messages[0].message).toContain("user_profiles");
    expect(messages[0].data?.suggestedName).toBe("user_profiles");
  });

  test("should flag kebab-case table names", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = createCreateTableNode("user-profiles");
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain("user-profiles");
    expect(messages[0].message).toContain("user_profiles");
    expect(messages[0].data?.suggestedName).toBe("user_profiles");
  });

  test("should flag uppercase table names", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = createCreateTableNode("USERS");
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain("USERS");
    expect(messages[0].message).toContain("users");
    expect(messages[0].data?.suggestedName).toBe("users");
  });

  test("should flag names with spaces", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = createCreateTableNode("User Profiles");
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].data?.suggestedName).toBe("user_profiles");
  });

  test("should not check non-table CREATE statements", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = createCreateIndexNode("UserProfilesIndex");
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(0);
  });

  test("should handle missing table information", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = {
      type: "create" as const,
      keyword: "table" as const,
      table: [],
    };
    rule.Create!(node);
    
    const messages = context.getMessages();
    expect(messages).toHaveLength(0);
  });

  test("should handle complex table names", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const testCases = [
      { input: "XMLHttpRequest", expected: "xml_http_request" },
      { input: "APIResponseLog", expected: "api_response_log" },
      { input: "URLShortener", expected: "url_shortener" },
      { input: "HTTPSConnection", expected: "https_connection" },
    ];

    testCases.forEach(({ input, expected }) => {
      const context = createMockContext();
      const rule = tableNamingConvention.create(context as any);
      
      const node = createCreateTableNode(input);
      rule.Create!(node);
      
      const messages = context.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].data?.suggestedName).toBe(expected);
    });
  });

  test("should reject invalid patterns", () => {
    const invalidTestCases = [
      { name: "_users", description: "先頭アンダースコア" },
      { name: "users_", description: "末尾アンダースコア" },
      { name: "user__profiles", description: "連続アンダースコア" },
      { name: "Users", description: "大文字始まり" },
      { name: "2users", description: "数字始まり" },
    ];

    invalidTestCases.forEach(({ name, description }) => {
      const context = createMockContext();
      const rule = tableNamingConvention.create(context as any);
      
      const node = createCreateTableNode(name);
      rule.Create!(node);
      
      const messages = context.getMessages();
      expect(messages).toHaveLength(1);
    });
  });

  test("should handle empty table name", () => {
    const context = createMockContext();
    const rule = tableNamingConvention.create(context as any);
    
    const node = {
      type: "create" as const,
      keyword: "table" as const,
      table: [{ table: "" }],
      create_definitions: [],
    };
    rule.Create!(node);
    
    const messages = context.getMessages();
    // 空文字列はエラーとして報告されるべき
    expect(messages).toHaveLength(1);
  });

  test("rule metadata should be correct", () => {
    expect(tableNamingConvention.name).toBe("table-naming-convention");
    expect(tableNamingConvention.meta.description).toBe("Enforce consistent table naming conventions (snake_case)");
    expect(tableNamingConvention.meta.category).toBe("Stylistic Issues");
    expect(tableNamingConvention.meta.recommended).toBe(true);
  });
});
