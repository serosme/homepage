import type { ContextMenuItem, TreeItem } from '@nuxt/ui'

function getBookmark(item: TreeItem): Bookmark {
  return (item as TreeItem & { _bookmark: Bookmark })._bookmark
}

interface CreateModal {
  open: boolean
  type: 'folder' | 'bookmark'
  parentId?: number
}
interface EditModal {
  open: boolean
  type: 'folder' | 'bookmark'
  item: Bookmark | null
}

export function useBookmarkMenu() {
  const { remove, refresh, maxPosition, bookmarks } = useBookmarks()
  const toast = useToast()

  const createModal = reactive<CreateModal>({
    open: false,
    type: 'folder',
    parentId: undefined,
  })
  const editModal = reactive<EditModal>({
    open: false,
    type: 'folder',
    item: null,
  })

  function openEdit(b: Bookmark) {
    editModal.type = b.type as 'folder' | 'bookmark'
    editModal.item = b
    editModal.open = true
  }

  async function handleDelete(b: Bookmark) {
    if (b.type === 'folder') {
      const children = (bookmarks.value ?? []).filter(c => c.parentId === b.id)
      if (children.length > 0) {
        toast.add({ title: 'Cannot delete', description: 'Folder is not empty', color: 'warning' })
        return
      }
    }
    try {
      await remove(b.id)
      toast.add({ title: 'Deleted', color: 'success' })
    }
    catch {
      toast.add({ title: 'Failed to delete', description: 'Please try again', color: 'error' })
    }
  }

  function folderMenu(b: Bookmark): ContextMenuItem[][] {
    return [
      [
        {
          label: 'New Folder',
          icon: 'i-lucide-folder-plus',
          onSelect() {
            createModal.type = 'folder'
            createModal.parentId = b.id
            createModal.open = true
          },
        },
        {
          label: 'New Bookmark',
          icon: 'i-lucide-bookmark-plus',
          onSelect() {
            createModal.type = 'bookmark'
            createModal.parentId = b.id
            createModal.open = true
          },
        },
      ],
      [
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect() { openEdit(b) },
        },
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error',
          onSelect() { handleDelete(b) },
        },
      ],
    ]
  }

  function bookmarkMenu(b: Bookmark): ContextMenuItem[][] {
    const items: ContextMenuItem[][] = [
      [
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect() { openEdit(b) },
        },
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error',
          onSelect() { handleDelete(b) },
        },
      ],
    ]
    if (b.url) {
      items.unshift([
        {
          label: 'Open in New Tab',
          icon: 'i-lucide-external-link',
          onSelect() { navigateTo(b.url!, { external: true, open: { target: '_blank' } }) },
        },
      ])
    }
    return items
  }

  function getMenu(item: TreeItem): ContextMenuItem[][] {
    const b = getBookmark(item)
    return b.type === 'folder' ? folderMenu(b) : bookmarkMenu(b)
  }

  return { createModal, editModal, getMenu, maxPosition, refresh }
}
