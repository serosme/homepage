import { listBlobs } from '../../utils/blob-files'
import { buildFileTree } from '../../utils/blob-tree'

export default defineEventHandler(async () => {
  return buildFileTree(await listBlobs(''))
})
