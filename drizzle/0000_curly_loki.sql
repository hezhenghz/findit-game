CREATE TABLE `difficulty_presets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` integer NOT NULL,
	`target_size_percent_min` integer NOT NULL,
	`target_size_percent_max` integer NOT NULL,
	`interference_count_min` integer NOT NULL,
	`interference_count_max` integer NOT NULL,
	`total_item_count_min` integer NOT NULL,
	`total_item_count_max` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `difficulty_presets_level_unique` ON `difficulty_presets` (`level`);--> statement-breakpoint
CREATE TABLE `levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`keywords` text NOT NULL,
	`tags` text NOT NULL,
	`scene_description` text NOT NULL,
	`difficulty` integer NOT NULL,
	`scene_image` text NOT NULL,
	`status` text NOT NULL,
	`target_items` text NOT NULL,
	`created_at` text NOT NULL
);
