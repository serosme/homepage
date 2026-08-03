<script setup lang="ts">
import type { ContextMenuItem, TreeItem } from '@nuxt/ui'

const { leftTree, rightTree, refresh, maxPosition } = useBookmarks()
const bookmarkForm = useBookmarkForm()
const folderForm = useFolderForm()
const { remove: removeBookmark } = useDeleteBookmark(refresh)
const { remove: removeFolder } = useDeleteFolder(refresh)
const { getMenu: getBookmarkMenu } = useBookmarkMenu(bookmarkForm, removeBookmark)
const { getMenu: getFolderMenu } = useFolderMenu(bookmarkForm, folderForm, removeFolder)

function getLeftMenu(item: TreeItem): ContextMenuItem[][] {
  const b = (item as TreeItem & { _bookmark: Bookmark })._bookmark
  return b.type === 'folder' ? getFolderMenu(item) : getBookmarkMenu(item)
}
</script>

<template>
  <div class="px-[25vw] py-[10vh] min-h-screen flex items-stretch">
    <div class="w-1/2 min-w-0">
      <UContextMenu :items="[[{ label: 'New Folder', icon: 'i-lucide-folder-plus', onSelect: () => folderForm.openCreate() }]]">
        <UTree
          :items="leftTree"
          :ui="{
            link: 'truncate cursor-pointer before:bg-transparent text-inherit',
            linkTrailing: 'hidden',
          }"
        >
          <template #item-label="{ item }">
            <UContextMenu :items="getLeftMenu(item)">
              <div>{{ item.label }}</div>
            </UContextMenu>
          </template>
        </UTree>
      </UContextMenu>
    </div>
    <div class="w-1/2 min-w-0">
      <UContextMenu :items="[[{ label: 'New Bookmark', icon: 'i-lucide-bookmark-plus', onSelect: () => bookmarkForm.openCreate() }]]">
        <UTree
          :items="rightTree"
          :ui="{
            link: 'truncate cursor-pointer before:bg-transparent text-inherit',
          }"
        >
          <template #item-label="{ item }">
            <UContextMenu :items="getBookmarkMenu(item)">
              <div>{{ item.label }}</div>
            </UContextMenu>
          </template>
        </UTree>
      </UContextMenu>
    </div>
    <BookmarkFormModal
      v-model:open="bookmarkForm.modal.open"
      :mode="bookmarkForm.modal.mode"
      :parent-id="bookmarkForm.modal.parentId"
      :item="bookmarkForm.modal.item"
      :max-position="maxPosition"
      @created="refresh"
      @updated="refresh"
    />
    <FolderFormModal
      v-model:open="folderForm.modal.open"
      :mode="folderForm.modal.mode"
      :parent-id="folderForm.modal.parentId"
      :item="folderForm.modal.item"
      :max-position="maxPosition"
      @created="refresh"
      @updated="refresh"
    />
  </div>
</template>
