import type { TreeItem } from '@nuxt/ui'
import { buildTree, sortBookmarks } from '~/utils/bookmark-tree'

function toTreeItem(b: Bookmark) {
  const item = {
    id: b.id,
    parentId: b.parentId,
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
  const { data, refresh } = useSelfFetch<Bookmark[]>('/api/bookmarks')

  const leftTree = computed<TreeItem[]>(() => {
    const filtered = (data.value ?? []).filter(b =>
      b.type === 'folder' || (b.type === 'bookmark' && b.parentId !== null),
    )
    const sorted = sortBookmarks(filtered)
    return buildTree(sorted.map(toTreeItem))
  })

  const rightTree = computed<TreeItem[]>(() => {
    const sorted = sortBookmarks((data.value ?? []).filter(b =>
      b.type === 'bookmark' && b.parentId === null,
    ))
    return sorted.map(toTreeItem)
  })

  return {
    leftTree,
    rightTree,
    data,
    refresh,
  }
}
