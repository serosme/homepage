import { sortBookmarks } from '~/utils/bookmark-tree'

type MoveDirection = 'up' | 'down'

export function useReorderBookmarks(
  data: Ref<Bookmark[] | null | undefined>,
  refresh: () => Promise<void>,
) {
  const moving = ref(false)

  // id → 所在分组的成员与下标。只在 data 变化时重建一次：
  // 菜单在渲染期求值，每个节点每次渲染都会调 canMove 两次，不能在里面重排全量数据。
  const located = computed(() => {
    const map = new Map<number, { item: Bookmark, group: Bookmark[], index: number }>()
    const groups = new Map<string, Bookmark[]>()
    for (const b of sortBookmarks(data.value ?? [])) {
      const key = `${b.parentId}|${b.type}`
      let group = groups.get(key)
      if (!group)
        groups.set(key, group = [])
      map.set(b.id, { item: b, group, index: group.length })
      group.push(b)
    }
    return map
  })

  function locate(id: number) {
    return located.value.get(id) ?? null
  }

  function canMove(id: number, direction: MoveDirection): boolean {
    if (moving.value)
      return false
    const found = locate(id)
    if (!found)
      return false
    return direction === 'up' ? found.index > 0 : found.index < found.group.length - 1
  }

  function nextPosition(parentId: number | null, type: 'folder' | 'bookmark'): number {
    const group = (data.value ?? []).filter(b => b.parentId === parentId && b.type === type)
    return group.reduce((max, b) => Math.max(max, b.position), 0) + 1
  }

  async function move(id: number, direction: MoveDirection) {
    const found = locate(id)
    if (!found)
      return
    const { item, group, index } = found
    const target = direction === 'up' ? index - 1 : index + 1
    const ids = group.map(b => b.id).filter((_, i) => i !== index)
    ids.splice(target, 0, item.id)
    moving.value = true
    try {
      await selfFetch('/api/bookmarks/reorder', {
        method: 'PUT',
        body: { parentId: item.parentId, type: item.type, ids },
      })
      await refresh()
    }
    finally {
      moving.value = false
    }
  }

  return { move, canMove, nextPosition }
}
