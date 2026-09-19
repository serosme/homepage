import type { DropdownMenuItem, TreeItem } from '@nuxt/ui'

function getBookmark(item: TreeItem): Bookmark {
  return (item as TreeItem & { _bookmark: Bookmark })._bookmark
}

export function useFolderMenu(
  bookmarkForm: ReturnType<typeof useBookmarkForm>,
  folderForm: ReturnType<typeof useFolderForm>,
  remove: (id: number) => Promise<void>,
  move: (id: number, direction: 'up' | 'down') => Promise<void>,
  canMove: (id: number, direction: 'up' | 'down') => boolean,
) {
  function getMenu(item: TreeItem): DropdownMenuItem[][] {
    const b = getBookmark(item)
    return [
      [
        {
          label: 'New Folder',
          icon: 'i-lucide-folder-plus',
          onSelect() { folderForm.openCreate(b.id) },
        },
        {
          label: 'New Bookmark',
          icon: 'i-lucide-bookmark-plus',
          onSelect() { bookmarkForm.openCreate(b.id) },
        },
      ],
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
          onSelect() { folderForm.openEdit(b) },
        },
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error',
          onSelect() { remove(b.id) },
        },
      ],
    ]
  }

  return { getMenu }
}
