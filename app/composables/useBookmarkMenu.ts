import type { DropdownMenuItem, TreeItem } from '@nuxt/ui'

function getBookmark(item: TreeItem): Bookmark {
  return (item as TreeItem & { _bookmark: Bookmark })._bookmark
}

export function useBookmarkMenu(
  bookmarkForm: ReturnType<typeof useBookmarkForm>,
  remove: (id: number) => Promise<void>,
  move: (id: number, direction: 'up' | 'down') => Promise<void>,
  canMove: (id: number, direction: 'up' | 'down') => boolean,
) {
  function getMenu(item: TreeItem): DropdownMenuItem[][] {
    const b = getBookmark(item)
    const items: DropdownMenuItem[][] = [
      [
        {
          label: 'Move Up',
          icon: 'i-lucide-arrow-up',
          disabled: !canMove(b.id, 'up'),
          onSelect() { move(b.id, 'up') },
        },
        {
          label: 'Move Down',
          icon: 'i-lucide-arrow-down',
          disabled: !canMove(b.id, 'down'),
          onSelect() { move(b.id, 'down') },
        },
      ],
      [
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect() { bookmarkForm.openEdit(b) },
        },
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error',
          onSelect() { remove(b.id) },
        },
      ],
    ]
    const url = b.url
    if (url) {
      items.unshift([
        {
          label: 'Open in New Tab',
          icon: 'i-lucide-external-link',
          onSelect() { navigateTo(url, { external: true, open: { target: '_blank' } }) },
        },
      ])
    }
    return items
  }

  return { getMenu }
}
