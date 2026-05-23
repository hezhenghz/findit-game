import { NextRequest, NextResponse } from "next/server";
import { startPipeline } from "@/lib/ai/pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, itemType, itemCount, difficulty } = body;

    if (!keywords || !itemType || !itemCount || !difficulty) {
      return NextResponse.json(
        { error: "缺少必填字段：keywords, itemType, itemCount, difficulty" },
        { status: 400 }
      );
    }

    const task = startPipeline({
      keywords,
      itemType,
      itemCount: Math.min(Math.max(itemCount, 1), 10),
      difficulty: Math.min(Math.max(difficulty, 1), 5),
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
