export function useDeleteFolder(refresh: () => void) {
  const toast = useToast()

  async function remove(id: number) {
    await selfFetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    refresh()
    toast.add({ title: 'Folder deleted', color: 'success' })
  }

  return { remove }
}
