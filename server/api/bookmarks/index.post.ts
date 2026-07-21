import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<InsertBookmark>(event)
  if (!body.name || !body.type || body.position == null)
    throw createError({ statusCode: 400, statusMessage: 'name, type, and position are required' })

  return await db.insert(schema.bookmarks).values(body).returning()
})
