import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async () => {
  return await db.select().from(schema.bookmarks).orderBy(schema.bookmarks.position).all()
})
