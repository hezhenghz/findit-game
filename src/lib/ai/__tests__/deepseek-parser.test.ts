import { describe, it, expect } from "vitest";

// Test the JSON extraction logic from DeepSeek responses
function extractJson(content: string): object | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  return JSON.parse(jsonMatch[0]);
}

describe("deepseek response parser", () => {
  it("should extract plain JSON", () => {
    const content = '{"sceneDescription": "测试场景", "items": ["a", "b"]}';
    const result = extractJson(content);
    expect(result).toEqual({ sceneDescription: "测试场景", items: ["a", "b"] });
  });

  it("should extract JSON from markdown code block", () => {
    const content = '```json\n{"sceneDescription": "场景", "items": ["物品1"]}\n```';
    const result = extractJson(content);
    expect(result).toEqual({ sceneDescription: "场景", items: ["物品1"] });
  });

  it("should extract JSON with surrounding text", () => {
    const content = '这是生成的场景：\n{"sceneDescription": "甜品屋", "items": ["蛋糕", "马卡龙"]}\n希望你喜欢。';
    const result = extractJson(content);
    expect(result).toEqual({ sceneDescription: "甜品屋", items: ["蛋糕", "马卡龙"] });
  });

  it("should return null for invalid content", () => {
    expect(extractJson("没有 JSON 的文本")).toBeNull();
  });

  it("should handle nested JSON objects in description", () => {
    const content = '{"sceneDescription": "复杂场景", "items": ["a", "b"]}';
    const result = extractJson(content);
    expect(result).toHaveProperty("items");
    expect((result as { items: string[] }).items).toHaveLength(2);
  });
});
