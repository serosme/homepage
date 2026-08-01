import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<InsertBookmark>(event)
  if (body.parentId === id)
    throw createError({ statusCode: 400, message: 'parentId cannot be itself' })
  const existing = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, id)).get()
  if (!existing)
    throw createError({ statusCode: 400, message: 'Not found' })
  const data: InsertBookmark = {
    type: body.type,
    name: body.name,
    position: body.position,
    parentId: body.parentId,
    url: body.url,
  }
  await db.update(schema.bookmarks).set(data).where(eq(schema.bookmarks.id, id)).run()
})
