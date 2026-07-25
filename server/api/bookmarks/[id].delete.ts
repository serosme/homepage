import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const bookmark = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, id)).get()
  if (!bookmark)
    throw createError({ message: 'Not found' })
  if (bookmark.type === 'folder') {
    const children = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.parentId, id)).all()
    if (children.length > 0)
      throw createError({ message: 'Folder is not empty' })
  }
  await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, id)).run()
})
