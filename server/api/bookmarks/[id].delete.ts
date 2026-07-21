import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const bookmark = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, id)).get()
  if (!bookmark)
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (bookmark.type === 'folder') {
    const children = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.parentId, id)).all()
    if (children.length > 0)
      throw createError({ statusCode: 409, statusMessage: 'Folder is not empty' })
  }
  await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, id))
  return { success: true }
})
