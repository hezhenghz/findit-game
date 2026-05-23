import { getConfig } from "./config";

interface ExpandResult {
  sceneDescription: string;
  items: string[];
}

export async function expandKeywords(
  keywords: string,
  itemType: string,
  itemCount: number
): Promise<ExpandResult> {
  const config = getConfig();
  const prompt = `你是一个儿童游戏场景设计师。根据用户输入的关键词，生成一个"找一找"游戏的场景描述和目标物品清单。

关键词：${keywords}
物品类型：${itemType}
物品数量：${itemCount}

请返回 JSON 格式：
{
  "sceneDescription": "详细场景描述，用于 AI 图片生成，应包含：场景风格（卡通/写实等）、色调、布局、氛围。150-300字。",
  "items": ["物品1名称", "物品2名称", ...] // 共${itemCount}个物品，名称简洁（2-6个字）
}

只返回 JSON，不要其他文字。`;

  const response = await fetch(`${config.deepseekBaseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: config.deepseekModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse DeepSeek response: ${content}`);
  }

  return JSON.parse(jsonMatch[0]);
}

export async function extractTags(sceneDescription: string): Promise<string> {
  const config = getConfig();
  const prompt = `从以下场景描述中提取 5-8 个中文分类标签（如：甜品、日式、室内、卡通、女孩向）。

场景描述：${sceneDescription}

返回格式：用逗号分隔的标签，如"甜品, 日式, 室内, 卡通, 女孩向"
只返回标签字符串，不要其他文字。`;

  const response = await fetch(`${config.deepseekBaseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: config.deepseekModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
