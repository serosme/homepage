CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parentId` integer,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`position` integer NOT NULL
);
