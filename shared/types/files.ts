export interface FileTreeNode {
  id: string
  label: string
  type: 'folder' | 'file'
  key: string
  children?: FileTreeNode[]
}
