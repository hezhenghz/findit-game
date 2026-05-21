import { describe, it, expect } from "vitest";
import { checkHit, findHitItem } from "../hit-detection";
import type { TargetItem } from "../types";

const item: TargetItem = {
  name: "测试物品",
  cropImage: "/test.png",
  bboxXMin: 400,
  bboxYMin: 350,
  bboxXMax: 580,
  bboxYMax: 530,
  sortOrder: 1,
};

const DISPLAY = 800;

describe("checkHit", () => {
  it("should hit when click is inside the bounding box", () => {
    // Center of bbox in 2048 space: (490, 440)
    // On 800px display: (490 * 800/2048, 440 * 800/2048) ≈ (191, 172)
    const imgCenterX = (item.bboxXMin + item.bboxXMax) / 2;
    const imgCenterY = (item.bboxYMin + item.bboxYMax) / 2;
    const displayX = imgCenterX / (2048 / DISPLAY);
    const displayY = imgCenterY / (2048 / DISPLAY);

    expect(checkHit(displayX, displayY, DISPLAY, DISPLAY, item)).toBe(true);
  });

  it("should miss when click is outside the bounding box", () => {
    expect(checkHit(0, 0, DISPLAY, DISPLAY, item)).toBe(false);
  });

  it("should miss when click is on the edge but outside", () => {
    // Just barely outside - bbox starts at imgX=400, display equivalent: 400*800/2048 ≈ 156
    const edgeX = (399 * DISPLAY) / 2048;
    const edgeY = (440 * DISPLAY) / 2048;
    expect(checkHit(edgeX, edgeY, DISPLAY, DISPLAY, item)).toBe(false);
  });

  it("should handle boundary cases correctly", () => {
    // Exact boundary
    const boundaryX = (item.bboxXMin * DISPLAY) / 2048;
    const boundaryY = (item.bboxYMin * DISPLAY) / 2048;
    expect(checkHit(boundaryX, boundaryY, DISPLAY, DISPLAY, item)).toBe(true);
  });
});

describe("findHitItem", () => {
  const items: TargetItem[] = [
    item,
    {
      name: "物品2",
      cropImage: "/test2.png",
      bboxXMin: 800,
      bboxYMin: 100,
      bboxXMax: 950,
      bboxYMax: 250,
      sortOrder: 2,
    },
  ];

  it("should return the index of the hit item", () => {
    const centerX = (490 * DISPLAY) / 2048;
    const centerY = (440 * DISPLAY) / 2048;
    expect(findHitItem(centerX, centerY, DISPLAY, DISPLAY, items, [])).toBe(0);
  });

  it("should return null when no item is hit", () => {
    expect(findHitItem(0, 0, DISPLAY, DISPLAY, items, [])).toBeNull();
  });

  it("should skip already found items", () => {
    const centerX = (490 * DISPLAY) / 2048;
    const centerY = (440 * DISPLAY) / 2048;
    // Item 0 already found, so it should not be returned
    expect(findHitItem(centerX, centerY, DISPLAY, DISPLAY, items, [0])).toBeNull();
  });

  it("should find the second item when first is already found", () => {
    const center2X = (875 * DISPLAY) / 2048;
    const center2Y = (175 * DISPLAY) / 2048;
    expect(findHitItem(center2X, center2Y, DISPLAY, DISPLAY, items, [0])).toBe(1);
  });
});
