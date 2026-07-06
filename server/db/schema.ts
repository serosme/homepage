import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const bookmarks = sqliteTable('bookmarks', {
  id: integer().primaryKey({ autoIncrement: true }),
  parentId: integer(),
  type: text().notNull(),
  name: text().notNull(),
  url: text(),
  position: integer().notNull(),
})
