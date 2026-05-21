import { NextResponse } from "next/server";
import { db } from "@/db";
import { levels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      id: levels.id,
      title: levels.title,
      keywords: levels.keywords,
      tags: levels.tags,
      sceneDescription: levels.sceneDescription,
      difficulty: levels.difficulty,
      sceneImage: levels.sceneImage,
    })
    .from(levels)
    .where(eq(levels.status, "approved"))
    .orderBy(levels.id);

  return NextResponse.json(rows);
}
