import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../schema";
import { eq, sql } from "drizzle-orm";
import { unlinkSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DB_PATH = "data/test.db";

let db: ReturnType<typeof drizzle<typeof schema, Database.Database>>;
let sqlite: Database.Database;

beforeAll(async () => {
  // Ensure data directory exists
  const dir = path.dirname(TEST_DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }

  sqlite = new Database(TEST_DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  db = drizzle(sqlite, { schema });

  migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../../../drizzle"),
  });
});

afterAll(async () => {
  sqlite.close();

  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
  if (existsSync(TEST_DB_PATH + "-wal")) {
    unlinkSync(TEST_DB_PATH + "-wal");
  }
  if (existsSync(TEST_DB_PATH + "-shm")) {
    unlinkSync(TEST_DB_PATH + "-shm");
  }
});

describe("difficultyPresets", () => {
  it("should have an empty table initially", async () => {
    const rows = await db.select().from(schema.difficultyPresets);
    expect(rows).toHaveLength(0);
  });

  it("should insert a preset", async () => {
    await db.insert(schema.difficultyPresets).values({
      level: 1,
      targetSizePercentMin: 10,
      targetSizePercentMax: 15,
      interferenceCountMin: 0,
      interferenceCountMax: 1,
      totalItemCountMin: 20,
      totalItemCountMax: 30,
      updatedAt: new Date().toISOString(),
    });

    const rows = await db.select().from(schema.difficultyPresets);
    expect(rows).toHaveLength(1);
    expect(rows[0].level).toBe(1);
    expect(rows[0].targetSizePercentMin).toBe(10);
  });

  it("should update a preset", async () => {
    await db
      .update(schema.difficultyPresets)
      .set({ targetSizePercentMin: 8 })
      .where(eq(schema.difficultyPresets.level, 1));

    const row = await db
      .select()
      .from(schema.difficultyPresets)
      .where(eq(schema.difficultyPresets.level, 1))
      .get();

    expect(row?.targetSizePercentMin).toBe(8);
  });

  it("should delete a preset", async () => {
    await db
      .delete(schema.difficultyPresets)
      .where(eq(schema.difficultyPresets.level, 1));

    const rows = await db.select().from(schema.difficultyPresets);
    expect(rows).toHaveLength(0);
  });

  it("should enforce unique level constraint", async () => {
    await db.insert(schema.difficultyPresets).values({
      level: 1,
      targetSizePercentMin: 5,
      targetSizePercentMax: 10,
      interferenceCountMin: 0,
      interferenceCountMax: 1,
      totalItemCountMin: 20,
      totalItemCountMax: 30,
      updatedAt: new Date().toISOString(),
    });

    await expect(
      db.insert(schema.difficultyPresets).values({
        level: 1,
        targetSizePercentMin: 3,
        targetSizePercentMax: 6,
        interferenceCountMin: 4,
        interferenceCountMax: 5,
        totalItemCountMin: 40,
        totalItemCountMax: 50,
        updatedAt: new Date().toISOString(),
      })
    ).rejects.toThrow();
  });
});

describe("levels", () => {
  const validTargetItems = JSON.stringify([
    {
      name: "草莓蛋糕",
      cropImage: "/crops/1_cake.png",
      bboxXMin: 100,
      bboxYMin: 200,
      bboxXMax: 300,
      bboxYMax: 400,
      sortOrder: 1,
    },
    {
      name: "马卡龙",
      cropImage: "/crops/1_macaron.png",
      bboxXMin: 500,
      bboxYMin: 300,
      bboxXMax: 650,
      bboxYMax: 450,
      sortOrder: 2,
    },
    {
      name: "可颂",
      cropImage: "/crops/1_croissant.png",
      bboxXMin: 800,
      bboxYMin: 100,
      bboxXMax: 950,
      bboxYMax: 250,
      sortOrder: 3,
    },
    {
      name: "蛋挞",
      cropImage: "/crops/1_tart.png",
      bboxXMin: 300,
      bboxYMin: 600,
      bboxXMax: 450,
      bboxYMax: 750,
      sortOrder: 4,
    },
    {
      name: "布丁",
      cropImage: "/crops/1_pudding.png",
      bboxXMin: 1200,
      bboxYMin: 800,
      bboxXMax: 1400,
      bboxYMax: 1000,
      sortOrder: 5,
    },
  ]);

  it("should insert a level with targetItems JSON", async () => {
    await db.insert(schema.levels).values({
      title: "甜品屋寻宝",
      keywords: "女孩, 甜品",
      tags: "甜品, 蛋糕, 日式, 室内",
      sceneDescription: "一个明亮的日式甜品屋内部，暖色调，卡通风格",
      difficulty: 2,
      sceneImage: "/levels/scene_1.png",
      status: "approved",
      targetItems: validTargetItems,
      createdAt: new Date().toISOString(),
    });

    const rows = await db.select().from(schema.levels);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("甜品屋寻宝");
    expect(rows[0].status).toBe("approved");

    const parsed = JSON.parse(rows[0].targetItems as string);
    expect(parsed).toHaveLength(5);
    expect(parsed[0].name).toBe("草莓蛋糕");
  });

  it("should parse targetItems with correct bounding box values", async () => {
    const row = await db
      .select()
      .from(schema.levels)
      .where(eq(schema.levels.title, "甜品屋寻宝"))
      .get();

    const targetItems = JSON.parse(row!.targetItems as string);
    expect(targetItems[2].name).toBe("可颂");
    expect(targetItems[2].bboxXMin).toBe(800);
    expect(targetItems[2].bboxYMax).toBe(250);
  });

  it("should support draft status", async () => {
    await db.insert(schema.levels).values({
      title: "测试关",
      keywords: "测试",
      tags: "",
      sceneDescription: "测试描述",
      difficulty: 1,
      sceneImage: "/levels/test.png",
      status: "draft",
      targetItems: "[]",
      createdAt: new Date().toISOString(),
    });

    const draftRows = await db
      .select()
      .from(schema.levels)
      .where(eq(schema.levels.status, "draft"));

    expect(draftRows).toHaveLength(1);
  });

  it("should delete a level", async () => {
    await db
      .delete(schema.levels)
      .where(eq(schema.levels.title, "测试关"));

    const rows = await db.select().from(schema.levels);
    expect(rows).toHaveLength(1); // only the first level remains
  });

  it("should query levels by difficulty", async () => {
    const rows = await db
      .select()
      .from(schema.levels)
      .where(eq(schema.levels.difficulty, 2));

    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("甜品屋寻宝");
  });

  it("should search levels by keywords containing substring", async () => {
    const rows = await db
      .select()
      .from(schema.levels)
      .where(sql`${schema.levels.keywords} LIKE '%甜品%'`);

    expect(rows).toHaveLength(1);
  });

  it("should search levels by tags containing substring", async () => {
    const rows = await db
      .select()
      .from(schema.levels)
      .where(sql`${schema.levels.tags} LIKE '%日式%'`);

    expect(rows).toHaveLength(1);
  });
});

describe("seed data", () => {
  it("should seed 5 difficulty presets covering levels 1-5", async () => {
    // Clear existing data first
    await db.delete(schema.difficultyPresets);

    const now = new Date().toISOString();
    await db.insert(schema.difficultyPresets).values([
      { level: 1, targetSizePercentMin: 10, targetSizePercentMax: 15, interferenceCountMin: 0, interferenceCountMax: 1, totalItemCountMin: 20, totalItemCountMax: 30, updatedAt: now },
      { level: 2, targetSizePercentMin: 8, targetSizePercentMax: 12, interferenceCountMin: 1, interferenceCountMax: 2, totalItemCountMin: 25, totalItemCountMax: 35, updatedAt: now },
      { level: 3, targetSizePercentMin: 6, targetSizePercentMax: 10, interferenceCountMin: 2, interferenceCountMax: 3, totalItemCountMin: 30, totalItemCountMax: 40, updatedAt: now },
      { level: 4, targetSizePercentMin: 4, targetSizePercentMax: 8, interferenceCountMin: 3, interferenceCountMax: 4, totalItemCountMin: 35, totalItemCountMax: 45, updatedAt: now },
      { level: 5, targetSizePercentMin: 3, targetSizePercentMax: 6, interferenceCountMin: 4, interferenceCountMax: 5, totalItemCountMin: 40, totalItemCountMax: 50, updatedAt: now },
    ]);

    const rows = await db.select().from(schema.difficultyPresets);
    expect(rows).toHaveLength(5);

    // Verify difficulty increases: smaller targets, more interference
    expect(rows[0].targetSizePercentMin).toBeGreaterThan(rows[4].targetSizePercentMin);
    expect(rows[0].interferenceCountMax).toBeLessThan(rows[4].interferenceCountMax);
    expect(rows[0].totalItemCountMax).toBeLessThan(rows[4].totalItemCountMax);
  });
});
