import { getConfig } from "./config";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { db } from "@/db";
import { difficultyPresets } from "@/db/schema";
import { eq } from "drizzle-orm";

const IMAGE_SIZE = "2048x2048";

interface GenerateImagesInput {
  sceneDescription: string;
  items: string[];
  difficulty: number;
}

export interface GeneratedImage {
  url: string;
  localPath: string;
}

async function fetchDifficultyParams(difficulty: number) {
  const preset = await db
    .select()
    .from(difficultyPresets)
    .where(eq(difficultyPresets.level, difficulty))
    .get();

  if (!preset) {
    throw new Error(`No difficulty preset for level ${difficulty}`);
  }

  return {
    targetSize: `${preset.targetSizePercentMin}%-${preset.targetSizePercentMax}%`,
    interference: `${preset.interferenceCountMin}-${preset.interferenceCountMax}`,
    totalItems: `${preset.totalItemCountMin}-${preset.totalItemCountMax}`,
  };
}

function buildPrompt(
  sceneDescription: string,
  items: string[],
  difficultyParams: {
    targetSize: string;
    interference: string;
    totalItems: string;
  }
): string {
  const itemsList = items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  return `创建一个儿童"找一找"游戏的场景图片。卡通风格，色彩鲜艳明亮，适合3-8岁儿童。

场景描述：${sceneDescription}

画面中必须包含以下${items.length}个目标物品（这些物品应该自然地融入场景中）：
${itemsList}

难度要求：
- 目标物品在画面中占比约 ${difficultyParams.targetSize}（相对较小，需要仔细找）
- 画面中放置 ${difficultyParams.interference} 个与目标物品外形或颜色相似的干扰物品
- 画面中各类物品总数约 ${difficultyParams.totalItems} 个
- 目标物品不应太显眼，鼓励探索和发现
- 部分目标物品可以半遮挡、放在角落或与其他物品重叠

画质：4K，丰富的细节，适合长时间观察。`;
}

export async function generateImages(
  input: GenerateImagesInput
): Promise<GeneratedImage[]> {
  const config = getConfig();
  const difficultyParams = await fetchDifficultyParams(input.difficulty);
  const prompt = buildPrompt(
    input.sceneDescription,
    input.items,
    difficultyParams
  );

  const response = await fetch(config.seedreamBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.volcanoApiKey}`,
    },
    body: JSON.stringify({
      model: config.seedreamModel,
      prompt,
      size: IMAGE_SIZE,
      response_format: "url",
      watermark: false,
      sequential_image_generation: "auto",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Seedream API error: ${response.status} ${text}`);
  }

  const data = await response.json();

  // Seedream returns { data: [{ url: "..." }, ...] }
  const images: GeneratedImage[] = [];
  const results = data.data || [];

  const dir = "public/levels";
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  for (let i = 0; i < results.length; i++) {
    const imageUrl = results[i].url;
    const localFilename = `generated_${Date.now()}_${i}.png`;
    const localPath = `/levels/${localFilename}`;

    // Download image
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) {
      throw new Error(`Failed to download image ${i}: ${imageResp.status}`);
    }
    const buffer = Buffer.from(await imageResp.arrayBuffer());
    writeFileSync(path.join(dir, localFilename), buffer);

    images.push({ url: imageUrl, localPath });
  }

  return images;
}
