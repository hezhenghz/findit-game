import { NextResponse } from "next/server";
import { getTask } from "@/lib/ai/tasks";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTask(id);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: task.id,
    status: task.status,
    progress: task.progress,
    result: task.result,
    error: task.error,
  });
}
