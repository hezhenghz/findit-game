import { db } from "./index";
import { difficultyPresets } from "./schema";

const defaultPresets = [
  {
    level: 1,
    targetSizePercentMin: 10,
    targetSizePercentMax: 15,
    interferenceCountMin: 0,
    interferenceCountMax: 1,
    totalItemCountMin: 20,
    totalItemCountMax: 30,
  },
  {
    level: 2,
    targetSizePercentMin: 8,
    targetSizePercentMax: 12,
    interferenceCountMin: 1,
    interferenceCountMax: 2,
    totalItemCountMin: 25,
    totalItemCountMax: 35,
  },
  {
    level: 3,
    targetSizePercentMin: 6,
    targetSizePercentMax: 10,
    interferenceCountMin: 2,
    interferenceCountMax: 3,
    totalItemCountMin: 30,
    totalItemCountMax: 40,
  },
  {
    level: 4,
    targetSizePercentMin: 4,
    targetSizePercentMax: 8,
    interferenceCountMin: 3,
    interferenceCountMax: 4,
    totalItemCountMin: 35,
    totalItemCountMax: 45,
  },
  {
    level: 5,
    targetSizePercentMin: 3,
    targetSizePercentMax: 6,
    interferenceCountMin: 4,
    interferenceCountMax: 5,
    totalItemCountMin: 40,
    totalItemCountMax: 50,
  },
];

export async function seed() {
  console.log("Seeding difficulty presets...");

  await db.delete(difficultyPresets);

  const now = new Date().toISOString();
  for (const preset of defaultPresets) {
    await db.insert(difficultyPresets).values({
      ...preset,
      updatedAt: now,
    });
  }

  console.log("Seeded 5 difficulty presets.");
}

// Run directly: npx tsx src/db/seed.ts
const isDirectRun = process.argv[1]?.includes("seed");
if (isDirectRun) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}
