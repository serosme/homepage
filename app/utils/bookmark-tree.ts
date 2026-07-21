export function sortBookmarks<T extends { parentId: number | null, type: string, position: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const pa = a.parentId ?? -1
    const pb = b.parentId ?? -1
    if (pa !== pb)
      return pa - pb
    if (a.type !== b.type)
      return a.type === 'folder' ? -1 : 1
    return a.position - b.position
  })
}

export function buildTree<T extends { id: string | number | undefined, parentId: string | number | null | undefined }>(list: T[]): (T & { children: T[] })[] {
  if (list.length === 0)
    return []

  const map = new Map<string | number, T & { children: T[] }>()
  for (const item of list)
    map.set(item.id!, { ...item, children: [] })

  const roots: (T & { children: T[] })[] = []
  for (const item of list) {
    const node = map.get(item.id!)!
    if (item.parentId == null || !map.has(item.parentId))
      roots.push(node)
    else
      map.get(item.parentId)!.children.push(node)
  }

  return roots
}
