export function useDeleteFile() {
  const toast = useToast()

  async function remove(path: string) {
    await selfFetch('/api/files/delete', { method: 'DELETE', query: { path } })
    toast.add({ title: 'File deleted', color: 'success' })
  }

  return { remove }
}
