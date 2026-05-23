import { NextRequest, NextResponse } from "next/server";
import { expandKeywords } from "@/lib/ai/deepseek";

export async function POST(request: NextRequest) {
  try {
    const { keywords, itemType, itemCount } = await request.json();
    if (!keywords || !itemType || !itemCount) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }
    const result = await expandKeywords(keywords, itemType, itemCount);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI 扩充失败" },
      { status: 500 }
    );
  }
}
