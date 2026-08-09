import type { schema } from '@nuxthub/db'

// Select types (for reading data)
export type Bookmark = typeof schema.bookmarks.$inferSelect

// Bookmark augmented with ancestor folder ids (root-first, direct parent last)
export type BookmarkWithAncestors = Bookmark & { ancestorIds: number[] }

// Insert types (for creating data)
export type InsertBookmark = typeof schema.bookmarks.$inferInsert
