import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import type { BoundingBox } from "./doubao-vision";

export async function cropTargetItem(
  sceneImagePath: string,
  bbox: BoundingBox,
  outputFilename: string
): Promise<string> {
  const dir = "public/crops";
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const padX = Math.round((bbox.bboxXMax - bbox.bboxXMin) * 0.15);
  const padY = Math.round((bbox.bboxYMax - bbox.bboxYMin) * 0.15);

  const left = Math.max(0, bbox.bboxXMin - padX);
  const top = Math.max(0, bbox.bboxYMin - padY);
  const width = bbox.bboxXMax - bbox.bboxXMin + padX * 2;
  const height = bbox.bboxYMax - bbox.bboxYMin + padY * 2;

  const outputPath = path.join(dir, outputFilename);

  await sharp(sceneImagePath)
    .extract({ left, top, width, height })
    .png()
    .toFile(outputPath);

  return `/crops/${outputFilename}`;
}
