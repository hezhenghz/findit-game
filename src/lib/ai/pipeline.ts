import { expandKeywords, extractTags } from "./deepseek";
import { generateImages, type GeneratedImage } from "./seedream";
import { locateItems, type BoundingBox } from "./doubao-vision";
import { cropTargetItem } from "./crop";
import { createTask, updateTask, type Task, type TaskResult } from "./tasks";

export interface PipelineInput {
  keywords: string;
  itemType: string;
  itemCount: number;
  difficulty: number;
}

export function startPipeline(input: PipelineInput): Task {
  const task = createTask();
  runPipeline(task, input).catch((e) => {
    console.error("Pipeline error:", e);
    updateTask(task.id, {
      status: "failed",
      error: e instanceof Error ? e.message : "未知错误",
    });
  });
  return task;
}

async function runPipeline(task: Task, input: PipelineInput) {
  updateTask(task.id, { status: "processing", progress: "正在生成场景描述..." });

  // Step 1: Expand keywords with DeepSeek
  const { sceneDescription, items } = await expandKeywords(
    input.keywords,
    input.itemType,
    input.itemCount
  );

  updateTask(task.id, { progress: "正在生成 4 张场景底图..." });

  // Step 2: Generate images with Seedream
  const images: GeneratedImage[] = await generateImages({
    sceneDescription,
    items,
    difficulty: input.difficulty,
  });

  // Step 3: Locate items in each image with Doubao Vision
  const candidates: TaskResult["candidates"] = [];
  for (let i = 0; i < images.length; i++) {
    updateTask(task.id, {
      progress: `正在识别第 ${i + 1}/${images.length} 张图片中的物品...`,
    });

    const bboxes = await locateItems(images[i].localPath, items);

    // Step 4: Crop target items from scene
    const bboxesWithCrops: (BoundingBox & { cropImage: string })[] = [];
    for (const bbox of bboxes) {
      const cropFilename = `gen_${task.id}_${i}_${bbox.name}.png`;
      const cropImage = await cropTargetItem(
        images[i].localPath,
        bbox,
        cropFilename
      );
      bboxesWithCrops.push({ ...bbox, cropImage });
    }

    candidates.push({
      image: images[i],
      bboxes: bboxesWithCrops,
    });
  }

  // Step 5: Extract tags
  updateTask(task.id, { progress: "正在提取标签..." });
  const tags = await extractTags(sceneDescription);

  // Done
  const result: TaskResult = {
    sceneDescription,
    items,
    tags,
    candidates,
  };

  updateTask(task.id, {
    status: "completed",
    progress: "生成完成！",
    result,
  });
}
