import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const difficultyPresets = sqliteTable("difficulty_presets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: integer("level").notNull().unique(),
  targetSizePercentMin: integer("target_size_percent_min").notNull(),
  targetSizePercentMax: integer("target_size_percent_max").notNull(),
  interferenceCountMin: integer("interference_count_min").notNull(),
  interferenceCountMax: integer("interference_count_max").notNull(),
  totalItemCountMin: integer("total_item_count_min").notNull(),
  totalItemCountMax: integer("total_item_count_max").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const levels = sqliteTable("levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  keywords: text("keywords").notNull(),
  tags: text("tags").notNull(),
  sceneDescription: text("scene_description").notNull(),
  difficulty: integer("difficulty").notNull(),
  sceneImage: text("scene_image").notNull(),
  status: text("status", { enum: ["draft", "approved"] }).notNull(),
  targetItems: text("target_items").notNull(), // JSON string
  createdAt: text("created_at").notNull(),
});
