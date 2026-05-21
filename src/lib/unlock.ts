const STORAGE_KEY = "findit_unlocked";

export function getUnlockedLevels(): number[] {
  if (typeof window === "undefined") return [1];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [1];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.includes(1)) return [1];
    return parsed;
  } catch {
    return [1];
  }
}

export function unlockLevel(levelId: number): void {
  if (typeof window === "undefined") return;
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(levelId)) {
    unlocked.push(levelId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }
}

export function isLevelUnlocked(levelId: number): boolean {
  return getUnlockedLevels().includes(levelId);
}

export function unlockNextLevel(currentLevelId: number): number | null {
  if (typeof window === "undefined") return null;
  const nextId = currentLevelId + 1;
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(nextId)) {
    unlocked.push(nextId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }
  return nextId;
}
