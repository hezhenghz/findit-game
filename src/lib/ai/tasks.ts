import type { GeneratedImage } from "./seedream";
import type { BoundingBox } from "./doubao-vision";

export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface TaskResult {
  sceneDescription: string;
  items: string[];
  tags: string;
  candidates: Array<{
    image: GeneratedImage;
    bboxes: BoundingBox[];
  }>;
}

export interface Task {
  id: string;
  status: TaskStatus;
  progress: string;
  result: TaskResult | null;
  error: string | null;
  createdAt: Date;
}

const tasks = new Map<string, Task>();

export function createTask(): Task {
  const id = generateId();
  const task: Task = {
    id,
    status: "pending",
    progress: "等待开始...",
    result: null,
    error: null,
    createdAt: new Date(),
  };
  tasks.set(id, task);
  return task;
}

export function updateTask(
  id: string,
  updates: Partial<Pick<Task, "status" | "progress" | "result" | "error">>
) {
  const task = tasks.get(id);
  if (task) {
    Object.assign(task, updates);
  }
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
