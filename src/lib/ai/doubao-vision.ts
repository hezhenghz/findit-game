import { readFileSync } from "fs";
import { getConfig } from "./config";

export interface BoundingBox {
  name: string;
  bboxXMin: number;
  bboxYMin: number;
  bboxXMax: number;
  bboxYMax: number;
}

export async function locateItems(
  imagePath: string,
  items: string[]
): Promise<BoundingBox[]> {
  const config = getConfig();
  const imageBuffer = readFileSync(imagePath);
  const base64 = imageBuffer.toString("base64");

  const itemsList = items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const prompt = `在这张图片中找到以下物品，并返回每个物品的 bounding box 坐标（归一化 0-999）：

${itemsList}

对每个物品输出格式：<bbox>x_min y_min x_max y_max</bbox> 物品名称
请仔细识别每个物品的位置。`;

  const response = await fetch(config.doubaoVisionBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.volcanoApiKey}`,
    },
    body: JSON.stringify({
      model: config.doubaoVisionModel,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:image/png;base64,${base64}`,
            },
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Doubao Vision API error: ${response.status} ${text}`);
  }

  const data = await response.json();

  // Extract text from responses API format: output[].summary[].text
  let content = "";
  if (data.output && Array.isArray(data.output)) {
    for (const out of data.output) {
      if (out.summary && Array.isArray(out.summary)) {
        for (const s of out.summary) {
          if (s.text) content += s.text;
        }
      }
    }
  }

  if (!content) {
    console.error("Doubao Vision response:", JSON.stringify(data).slice(0, 500));
    throw new Error("Doubao Vision did not return content");
  }

  return parseBoundingBoxes(content, items);
}

const IMAGE_SIZE = 2048;

function parseBoundingBoxes(content: string, items: string[]): BoundingBox[] {
  const results: BoundingBox[] = [];
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
    const fallbackBBox = {
      bboxXMin: 512,
      bboxYMin: 512,
      bboxXMax: 768,
      bboxYMax: 768,
    };
    for (const item of items) {
      results.push({ name: item, ...fallbackBBox });
    }
  }

  return results;
}
