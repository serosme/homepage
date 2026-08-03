export function useBookmarkForm() {
  const modal = reactive<{
    open: boolean
    mode: 'create' | 'edit'
    parentId?: number
    item: Bookmark | null
  }>({
    open: false,
    mode: 'create',
    parentId: undefined,
    item: null,
  })

  function openCreate(parentId?: number) {
    modal.open = true
    modal.mode = 'create'
    modal.parentId = parentId
    modal.item = null
  }

  function openEdit(item: Bookmark) {
    modal.open = true
    modal.mode = 'edit'
    modal.parentId = undefined
    modal.item = item
  }

  return { modal, openCreate, openEdit }
}
