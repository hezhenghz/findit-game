import type { TargetItem } from "./types";

const IMAGE_SIZE = 2048;

export function checkHit(
  clickX: number,
  clickY: number,
  displayWidth: number,
  displayHeight: number,
  item: TargetItem
): boolean {
  const scaleX = IMAGE_SIZE / displayWidth;
  const scaleY = IMAGE_SIZE / displayHeight;

  const imgX = clickX * scaleX;
  const imgY = clickY * scaleY;

  return (
    imgX >= item.bboxXMin &&
    imgX <= item.bboxXMax &&
    imgY >= item.bboxYMin &&
    imgY <= item.bboxYMax
  );
}

export function findHitItem(
  clickX: number,
  clickY: number,
  displayWidth: number,
  displayHeight: number,
  items: TargetItem[],
  foundIndices: number[]
): number | null {
  for (let i = 0; i < items.length; i++) {
    if (foundIndices.includes(i)) continue;
    if (checkHit(clickX, clickY, displayWidth, displayHeight, items[i])) {
      return i;
    }
  }
  return null;
}
