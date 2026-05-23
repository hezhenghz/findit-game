import { NextRequest, NextResponse } from "next/server";
import { startPipeline } from "@/lib/ai/pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty } = body;

    if (!difficulty || (!body.sceneDescription && !body.keywords)) {
      return NextResponse.json(
        { error: "缺少必填字段：difficulty, sceneDescription（或 keywords）" },
        { status: 400 }
      );
    }

    const task = startPipeline({
      keywords: body.keywords || "",
      itemType: body.itemType || "",
      itemCount: Math.min(Math.max(body.itemCount, 1), 10),
      difficulty: Math.min(Math.max(body.difficulty, 1), 5),
      sceneDescription: body.sceneDescription || "",
      items: body.items || [],
    });

    return NextResponse.json({ taskId: task.id }, { status: 202 });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成失败" },
      { status: 500 }
    );
  }
}
