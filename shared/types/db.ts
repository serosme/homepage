import type { schema } from '@nuxthub/db'

// Select types (for reading data)
export type Bookmark = typeof schema.bookmarks.$inferSelect

// Insert types (for creating data)
export type InsertBookmark = typeof schema.bookmarks.$inferInsert
