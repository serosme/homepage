import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async () => {
  const list = await db.select().from(schema.bookmarks).orderBy(schema.bookmarks.position).all()
  const byId = new Map(list.map(b => [b.id, b]))
  return list.map((b) => {
    const ancestorIds: number[] = []
    let parentId = b.parentId
    while (parentId != null) {
      ancestorIds.push(parentId)
      parentId = byId.get(parentId)?.parentId ?? null
    }
    return { ...b, ancestorIds: ancestorIds.reverse() }
  })
})
