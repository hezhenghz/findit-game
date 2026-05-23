import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { levels } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, keywords, tags, sceneDescription, difficulty, sceneImage, targetItems } = body;

    if (!title || !sceneImage || !targetItems) {
      return NextResponse.json(
        { error: "缺少必填字段：title, sceneImage, targetItems" },
        { status: 400 }
      );
    }

    await db.insert(levels).values({
      title,
      keywords: keywords || "",
      tags: tags || "",
      sceneDescription: sceneDescription || "",
      difficulty: Math.min(Math.max(difficulty || 1, 1), 5),
      sceneImage,
      status: "approved",
      targetItems: JSON.stringify(targetItems),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Save level error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存失败" },
      { status: 500 }
    );
  }
}
