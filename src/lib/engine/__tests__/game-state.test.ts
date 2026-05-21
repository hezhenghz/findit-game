import { describe, it, expect } from "vitest";
import { createInitialState, findItem, getFoundCount, isCompleted } from "../game-state";

describe("game state", () => {
  it("should start in playing phase with no items found", () => {
    const state = createInitialState();
    expect(state.phase).toBe("playing");
    expect(state.foundItemIndices).toEqual([]);
    expect(getFoundCount(state)).toBe(0);
    expect(isCompleted(state)).toBe(false);
  });

  it("should add a found item", () => {
    const state = createInitialState();
    const next = findItem(state, 0, 5);
    expect(next.foundItemIndices).toEqual([0]);
    expect(next.phase).toBe("playing");
    expect(getFoundCount(next)).toBe(1);
  });

  it("should transition to completed when all items found", () => {
    let state = createInitialState();
    state = findItem(state, 0, 5);
    state = findItem(state, 1, 5);
    state = findItem(state, 2, 5);
    state = findItem(state, 3, 5);
    expect(isCompleted(state)).toBe(false);
    state = findItem(state, 4, 5);
    expect(isCompleted(state)).toBe(true);
    expect(state.phase).toBe("completed");
  });

  it("should not add duplicate items", () => {
    let state = createInitialState();
    state = findItem(state, 0, 5);
    state = findItem(state, 0, 5);
    expect(getFoundCount(state)).toBe(1);
  });

  it("should not change state after completion", () => {
    let state = createInitialState();
    for (let i = 0; i < 5; i++) {
      state = findItem(state, i, 5);
    }
    expect(isCompleted(state)).toBe(true);

    // Try to add another
    const next = findItem(state, 3, 5);
    expect(next).toEqual(state);
  });

  it("should maintain found items in order of discovery", () => {
    let state = createInitialState();
    state = findItem(state, 3, 5);
    state = findItem(state, 0, 5);
    state = findItem(state, 4, 5);
    expect(state.foundItemIndices).toEqual([3, 0, 4]);
  });
});
