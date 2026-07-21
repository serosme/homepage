import type { TreeItem } from '@nuxt/ui'
import { buildTree, sortBookmarks } from '~/utils/bookmark-tree'

function toTreeItem(b: Bookmark) {
  const item = {
    id: b.id,
    parentId: b.parentId as number | null,
    label: b.name,
    _bookmark: b,
    icon: undefined as string | undefined,
    onSelect: undefined as (() => void) | undefined,
  }
  if (b.type === 'bookmark') {
    item.icon = 'i-lucide-bookmark'
    if (b.url) {
      item.onSelect = () => navigateTo(b.url!, { external: true })
    }
  }
  else if (b.type === 'folder') {
    item.icon = 'i-lucide-folder'
  }
  return item
}

export function useBookmarks() {
  const { data: bookmarks, refresh } = useFetch<Bookmark[]>('/api/bookmarks')

  const maxPosition = computed(() => {
    const list = bookmarks.value ?? []
    return list.length > 0 ? Math.max(...list.map(b => b.position)) : 0
  })

  const leftTree = computed<TreeItem[]>(() => {
    const filtered = (bookmarks.value ?? []).filter(b =>
      b.type === 'folder' || (b.type === 'bookmark' && b.parentId != null),
    )
    const sorted = sortBookmarks(filtered)
    return buildTree(sorted.map(toTreeItem))
  })

  const rightTree = computed<TreeItem[]>(() => {
    return (bookmarks.value ?? []).filter(b =>
      b.type === 'bookmark' && b.parentId == null,
    ).sort((a, b) => a.position - b.position).map(toTreeItem)
  })

  async function remove(id: number) {
    await $fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    refresh()
  }

  async function update(id: number, data: InsertBookmark) {
    await $fetch(`/api/bookmarks/${id}`, { method: 'PUT', body: data })
    refresh()
  }

  return {
    leftTree,
    rightTree,
    maxPosition,
    bookmarks,
    refresh,
    remove,
    update,
  }
}
