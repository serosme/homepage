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
  const { data: bookmarks, refresh } = useSelfFetch<Bookmark[]>('/api/bookmarks')

  const maxPosition = computed(() => {
    const list = bookmarks.value ?? []
    let max = 0
    for (const b of list) {
      if (b.position > max)
        max = b.position
    }
    return max
  })

  const leftTree = computed<TreeItem[]>(() => {
    const filtered = (bookmarks.value ?? []).filter(b =>
      b.type === 'folder' || (b.type === 'bookmark' && b.parentId !== null),
    )
    const sorted = sortBookmarks(filtered)
    return buildTree(sorted.map(toTreeItem))
  })

  const rightTree = computed<TreeItem[]>(() => {
    return (bookmarks.value ?? []).filter(b =>
      b.type === 'bookmark' && b.parentId === null,
    ).sort((a, b) => a.position - b.position).map(toTreeItem)
  })

  return {
    leftTree,
    rightTree,
    maxPosition,
    refresh,
  }
}
