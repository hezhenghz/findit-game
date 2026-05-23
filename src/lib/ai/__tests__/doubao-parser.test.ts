import { describe, it, expect } from "vitest";

// Replicate the parseBoundingBoxes function logic for testing
const IMAGE_SIZE = 2048;

function parseBoundingBoxes(
  content: string,
  items: string[]
): Array<{
  name: string;
  bboxXMin: number;
  bboxYMin: number;
  bboxXMax: number;
  bboxYMax: number;
}> {
  const results: Array<{
    name: string;
    bboxXMin: number;
    bboxYMin: number;
    bboxXMax: number;
    bboxYMax: number;
  }> = [];
  const bboxRegex =
    /<bbox>\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*<\/bbox>\s*([\s\S]+?)(?=<bbox>|$)/g;

  let match;
  while ((match = bboxRegex.exec(content)) !== null) {
    const [, xMin, yMin, xMax, yMax, rawName] = match;
    const name = rawName.trim();
    results.push({
      name,
      bboxXMin: Math.round((parseInt(xMin) / 1000) * IMAGE_SIZE),
      bboxYMin: Math.round((parseInt(yMin) / 1000) * IMAGE_SIZE),
      bboxXMax: Math.round((parseInt(xMax) / 1000) * IMAGE_SIZE),
      bboxYMax: Math.round((parseInt(yMax) / 1000) * IMAGE_SIZE),
    });
  }

  if (results.length === 0) {
    const fallbackBBox = { bboxXMin: 512, bboxYMin: 512, bboxXMax: 768, bboxYMax: 768 };
    for (const item of items) {
      results.push({ name: item, ...fallbackBBox });
    }
  }

  return results;
}

describe("doubao vision bbox parser", () => {
  it("should parse single bbox", () => {
    const content = "<bbox>100 200 300 400</bbox> 草莓蛋糕";
    const result = parseBoundingBoxes(content, ["草莓蛋糕"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("草莓蛋糕");
    // 100/1000 * 2048 ≈ 205
    expect(result[0].bboxXMin).toBe(205);
    expect(result[0].bboxYMin).toBe(410);
    expect(result[0].bboxXMax).toBe(614);
    expect(result[0].bboxYMax).toBe(819);
  });

  it("should parse multiple bboxes", () => {
    const content =
      "<bbox>50 60 150 160</bbox> 苹果\n<bbox>200 300 400 500</bbox> 香蕉";
    const result = parseBoundingBoxes(content, ["苹果", "香蕉"]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("苹果");
    expect(result[1].name).toBe("香蕉");
  });

  it("should convert from 0-999 to 0-2048 pixel coords", () => {
    const content = "<bbox>0 0 999 999</bbox> 测试";
    const result = parseBoundingBoxes(content, ["测试"]);
    expect(result[0].bboxXMin).toBe(0);
    expect(result[0].bboxYMin).toBe(0);
    expect(result[0].bboxXMax).toBe(2046); // Math.round(999/1000*2048) = 2046
    expect(result[0].bboxYMax).toBe(2046);
  });

  it("should return fallback bboxes when no bbox tags found", () => {
    const content = "没有 bbox 标签的回应";
    const items = ["物品1", "物品2"];
    const result = parseBoundingBoxes(content, items);
    expect(result).toHaveLength(2);
    expect(result[0].bboxXMin).toBe(512);
    expect(result[1].bboxXMin).toBe(512);
  });

  it("should handle bbox with no name", () => {
    const content = "<bbox>100 200 300 400</bbox> ";
    const result = parseBoundingBoxes(content, ["物品"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("");
  });
});
