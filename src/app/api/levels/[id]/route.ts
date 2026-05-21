import { NextResponse } from "next/server";
import { db } from "@/db";
import { levels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const levelId = parseInt(id, 10);

  if (isNaN(levelId)) {
    return NextResponse.json({ error: "Invalid level ID" }, { status: 400 });
  }

  const row = await db
    .select()
    .from(levels)
    .where(eq(levels.id, levelId))
    .get();

  if (!row) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  if (row.status !== "approved") {
    return NextResponse.json({ error: "Level not available" }, { status: 403 });
  }

  return NextResponse.json({
    ...row,
    targetItems: JSON.parse(row.targetItems as string),
  });
}
