import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<InsertBookmark>(event)

  const data: InsertBookmark = {
    type: body.type,
    name: body.name,
    position: body.position,
    parentId: body.parentId,
    url: body.url,
  }

  await db.insert(schema.bookmarks).values(data).run()
})
