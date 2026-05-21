import type { GameState } from "./types";

export function createInitialState(): GameState {
  return { phase: "playing", foundItemIndices: [] };
}

export function findItem(state: GameState, itemIndex: number, totalItems: number): GameState {
  if (state.phase !== "playing") return state;
  if (state.foundItemIndices.includes(itemIndex)) return state;

  const foundItemIndices = [...state.foundItemIndices, itemIndex];
  const phase = foundItemIndices.length >= totalItems ? "completed" : "playing";

  return { phase, foundItemIndices };
}

export function getFoundCount(state: GameState): number {
  return state.foundItemIndices.length;
}

export function isCompleted(state: GameState): boolean {
  return state.phase === "completed";
}
