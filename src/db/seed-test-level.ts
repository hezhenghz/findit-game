import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "fs";
import { db } from "./index";
import { levels } from "./schema";

const SIZE = 2048;
const TARGET_ITEMS = [
  { name: "红色星星", cx: 400, cy: 350, w: 180, h: 180, color: "#e74c3c" },
  { name: "蓝色方块", cx: 1000, cy: 700, w: 200, h: 200, color: "#3498db" },
  { name: "绿色三角", cx: 1600, cy: 500, w: 190, h: 190, color: "#2ecc71" },
  { name: "黄色圆圈", cx: 600, cy: 1300, w: 220, h: 220, color: "#f1c40f" },
  { name: "紫色菱形", cx: 1400, cy: 1400, w: 200, h: 200, color: "#9b59b6" },
];

function generateSceneImage(): Buffer {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  // Background - warm cream color
  ctx.fillStyle = "#fef9e7";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Draw some background decorations (non-target shapes)
  const rng = seedRandom(42);
  for (let i = 0; i < 35; i++) {
    const x = rng() * SIZE;
    const y = rng() * SIZE;
    const size = 30 + rng() * 120;
    const colors = ["#e8daef", "#d5f5e3", "#fadbd8", "#d6eaf8", "#fdebd0", "#e5e7e9"];
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
    ctx.beginPath();
    if (rng() > 0.5) {
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    } else {
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
    ctx.fill();
  }

  // Draw target items
  for (const item of TARGET_ITEMS) {
    ctx.fillStyle = item.color;
    ctx.globalAlpha = 0.9;

    if (item.name.includes("星星")) {
      drawStar(ctx, item.cx, item.cy, item.w / 2);
    } else if (item.name.includes("方块")) {
      ctx.fillRect(item.cx - item.w / 2, item.cy - item.h / 2, item.w, item.h);
    } else if (item.name.includes("三角")) {
      ctx.beginPath();
      ctx.moveTo(item.cx, item.cy - item.h / 2);
      ctx.lineTo(item.cx + item.w / 2, item.cy + item.h / 2);
      ctx.lineTo(item.cx - item.w / 2, item.cy + item.h / 2);
      ctx.closePath();
      ctx.fill();
    } else if (item.name.includes("圆圈")) {
      ctx.beginPath();
      ctx.arc(item.cx, item.cy, item.w / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.name.includes("菱形")) {
      ctx.beginPath();
      ctx.moveTo(item.cx, item.cy - item.h / 2);
      ctx.lineTo(item.cx + item.w / 2, item.cy);
      ctx.lineTo(item.cx, item.cy + item.h / 2);
      ctx.lineTo(item.cx - item.w / 2, item.cy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return canvas.toBuffer("image/png");
}

function generateCropImage(item: { name: string; color: string; w: number; h: number }): Buffer {
  const pad = 20;
  const cw = item.w + pad * 2;
  const ch = item.h + pad * 2;
  const canvas = createCanvas(cw, ch);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = item.color;

  if (item.name.includes("星星")) {
    drawStar(ctx, cw / 2, ch / 2, item.w / 2);
  } else if (item.name.includes("方块")) {
    ctx.fillRect(pad, pad, item.w, item.h);
  } else if (item.name.includes("三角")) {
    ctx.beginPath();
    ctx.moveTo(cw / 2, pad);
    ctx.lineTo(cw - pad, ch - pad);
    ctx.lineTo(pad, ch - pad);
    ctx.closePath();
    ctx.fill();
  } else if (item.name.includes("圆圈")) {
    ctx.beginPath();
    ctx.arc(cw / 2, ch / 2, item.w / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.name.includes("菱形")) {
    ctx.beginPath();
    ctx.moveTo(cw / 2, pad);
    ctx.lineTo(cw - pad, ch / 2);
    ctx.lineTo(cw / 2, ch - pad);
    ctx.lineTo(pad, ch / 2);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toBuffer("image/png");
}

function drawStar(ctx: any, cx: number, cy: number, r: number) {
  const spikes = 5;
  const outerR = r;
  const innerR = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export async function seedTestLevel() {
  console.log("Generating test level...");

  // Generate scene image
  const sceneBuffer = generateSceneImage();
  writeFileSync("public/levels/test_scene.png", sceneBuffer);
  console.log("  Scene image saved to public/levels/test_scene.png");

  // Generate crop images
  for (let i = 0; i < TARGET_ITEMS.length; i++) {
    const item = TARGET_ITEMS[i];
    const cropBuffer = generateCropImage(item);
    writeFileSync(`public/crops/test_${i}.png`, cropBuffer);
    console.log(`  Crop image saved to public/crops/test_${i}.png`);
  }

  // Insert level into database
  await db.insert(levels).values({
    title: "测试关卡 — 寻找形状",
    keywords: "形状, 颜色",
    tags: "形状, 颜色, 启蒙, 认知",
    sceneDescription: "一个充满各种彩色形状的画面，找出指定的5个目标形状",
    difficulty: 2,
    sceneImage: "/levels/test_scene.png",
    status: "approved",
    targetItems: JSON.stringify(
      TARGET_ITEMS.map((item, i) => ({
        name: item.name,
        cropImage: `/crops/test_${i}.png`,
        bboxXMin: Math.round(item.cx - item.w / 2),
        bboxYMin: Math.round(item.cy - item.h / 2),
        bboxXMax: Math.round(item.cx + item.w / 2),
        bboxYMax: Math.round(item.cy + item.h / 2),
        sortOrder: i + 1,
      }))
    ),
    createdAt: new Date().toISOString(),
  });

  console.log("  Level inserted into database");
  console.log("Test level seeded successfully!");
}

const isDirectRun = process.argv[1]?.includes("seed-test-level");
if (isDirectRun) {
  seedTestLevel()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}
