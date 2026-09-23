import type { DropdownMenuItem } from '@nuxt/ui'
import type { FileTreeNode } from '#shared/types/files'

export function useFileMenu(
  uploadForm: ReturnType<typeof useFileUploadForm>,
  deleteForm: ReturnType<typeof useFileDeleteForm>,
) {
  function download(node: FileTreeNode) {
    const link = document.createElement('a')
    link.href = `/api/files/download?path=${encodeURIComponent(node.key)}`
    link.download = node.label
    link.click()
  }

  function getMenu(node?: FileTreeNode): DropdownMenuItem[][] {
    if (node?.type === 'folder') {
      return [
        [
          {
            label: '上传文件',
            icon: 'i-lucide-upload',
            onSelect() { uploadForm.open(node.key) },
          },
        ],
        [
          {
            label: '删除文件夹',
            icon: 'i-lucide-trash',
            onSelect() { deleteForm.open(node) },
          },
        ],
      ]
    }

    if (node?.type === 'file') {
      return [
        [
          {
            label: '下载文件',
            icon: 'i-lucide-download',
            onSelect() { download(node) },
          },
        ],
        [
          {
            label: '删除文件',
            icon: 'i-lucide-trash',
            onSelect() { deleteForm.open(node) },
          },
        ],
      ]
    }

    return [[
      {
        label: '上传文件',
        icon: 'i-lucide-upload',
        onSelect() { uploadForm.open() },
      },
    ]]
  }

  return { getMenu }
}
