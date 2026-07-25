import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<InsertBookmark>(event)
  if (!body.name || !body.type || body.position == null)
    throw createError({ message: 'name, type, and position are required' })
  const existing = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, id)).get()
  if (!existing)
    throw createError({ message: 'Not found' })
  await db.update(schema.bookmarks).set(body).where(eq(schema.bookmarks.id, id)).run()
})
