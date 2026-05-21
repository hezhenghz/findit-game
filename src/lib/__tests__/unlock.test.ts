import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStorage: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
};

vi.stubGlobal("localStorage", mockLocalStorage);
// unlock.ts checks typeof window, so we need window to exist
vi.stubGlobal("window", {});

// Import after stubs are set up
const unlockModule = await import("../unlock");

const {
  getUnlockedLevels,
  unlockLevel,
  isLevelUnlocked,
  unlockNextLevel,
} = unlockModule;

describe("unlock system", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  it("should default to level 1 unlocked", () => {
    const unlocked = getUnlockedLevels();
    expect(unlocked).toEqual([1]);
  });

  it("level 1 should be unlocked by default", () => {
    expect(isLevelUnlocked(1)).toBe(true);
  });

  it("level 2 should be locked by default", () => {
    expect(isLevelUnlocked(2)).toBe(false);
  });

  it("should return [1] as default without persisting", () => {
    expect(getUnlockedLevels()).toEqual([1]);
    // getUnlockedLevels is read-only, doesn't write to storage
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("should unlock a specific level", () => {
    unlockLevel(3);
    expect(isLevelUnlocked(3)).toBe(true);
    expect(mockStorage["findit_unlocked"]).toContain("3");
  });

  it("should not duplicate already unlocked levels", () => {
    unlockLevel(1);
    expect(getUnlockedLevels()).toEqual([1]);
  });

  it("should unlock next level after current", () => {
    const nextId = unlockNextLevel(1);
    expect(nextId).toBe(2);
    expect(isLevelUnlocked(2)).toBe(true);
  });

  it("should unlock the next level only once", () => {
    unlockNextLevel(1);
    unlockNextLevel(1);
    expect(getUnlockedLevels()).toEqual([1, 2]);
  });

  it("should maintain all unlocked levels through multiple completions", () => {
    unlockNextLevel(1); // unlock 2
    unlockNextLevel(2); // unlock 3
    unlockNextLevel(3); // unlock 4
    expect(getUnlockedLevels()).toEqual([1, 2, 3, 4]);
  });
});
