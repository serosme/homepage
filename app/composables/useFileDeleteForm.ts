import type { FileTreeNode } from '#shared/types/files'

export function useFileDeleteForm() {
  const modal = reactive({
    open: false,
    node: undefined as FileTreeNode | undefined,
  })

  function open(node: FileTreeNode) {
    modal.node = node
    modal.open = true
  }

  return { modal, open }
}
