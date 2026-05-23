import { describe, it, expect, beforeEach } from "vitest";
import { createTask, updateTask, getTask } from "../tasks";
import type { TaskResult } from "../tasks";

describe("task store", () => {
  it("should create a task with pending status", () => {
    const task = createTask();
    expect(task.id).toBeTruthy();
    expect(task.status).toBe("pending");
    expect(task.progress).toBe("等待开始...");
    expect(task.result).toBeNull();
    expect(task.error).toBeNull();
  });

  it("should create unique task IDs", () => {
    const t1 = createTask();
    const t2 = createTask();
    expect(t1.id).not.toBe(t2.id);
  });

  it("should retrieve a task by ID", () => {
    const task = createTask();
    const found = getTask(task.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(task.id);
  });

  it("should return undefined for non-existent task", () => {
    expect(getTask("nonexistent")).toBeUndefined();
  });

  it("should update task status and progress", () => {
    const task = createTask();
    updateTask(task.id, { status: "processing", progress: "正在生成..." });
    const updated = getTask(task.id);
    expect(updated!.status).toBe("processing");
    expect(updated!.progress).toBe("正在生成...");
  });

  it("should update task result on completion", () => {
    const task = createTask();
    const result: TaskResult = {
      sceneDescription: "测试场景",
      items: ["item1", "item2"],
      tags: "测试, 场景",
      candidates: [],
    };
    updateTask(task.id, { status: "completed", progress: "完成", result });
    const completed = getTask(task.id);
    expect(completed!.status).toBe("completed");
    expect(completed!.result!.sceneDescription).toBe("测试场景");
  });

  it("should update task error on failure", () => {
    const task = createTask();
    updateTask(task.id, { status: "failed", error: "API 调用失败" });
    const failed = getTask(task.id);
    expect(failed!.status).toBe("failed");
    expect(failed!.error).toBe("API 调用失败");
  });
});
