<script setup lang="ts">
import type { DropdownMenuItem, TreeItem } from '@nuxt/ui'

const bookmarkForm = useBookmarkForm()
const folderForm = useFolderForm()
const { leftTree, rightTree, refresh, maxPosition } = useBookmarks()
const { remove: removeBookmark } = useDeleteBookmark(refresh)
const { remove: removeFolder } = useDeleteFolder(refresh)
const { getMenu: getBookmarkMenu } = useBookmarkMenu(bookmarkForm, removeBookmark)
const { getMenu: getFolderMenu } = useFolderMenu(bookmarkForm, folderForm, removeFolder)

function getLeftMenu(item: TreeItem): DropdownMenuItem[][] {
  const b = (item as TreeItem & { _bookmark: Bookmark })._bookmark
  return b.type === 'folder' ? getFolderMenu(item) : getBookmarkMenu(item)
}

function getItemKey(item: TreeItem): string {
  return String((item as TreeItem & { id: number | string }).id)
}

const addFolderItem: TreeItem & { id: string } = {
  id: 'add-folder',
  label: 'New Folder',
  icon: 'i-lucide-folder-plus',
  onSelect: () => folderForm.openCreate(),
  class: 'opacity-0 hover:opacity-100 hover:delay-500 transition-opacity',
}

const addBookmarkItem: TreeItem & { id: string } = {
  id: 'add-bookmark',
  label: 'New Bookmark',
  icon: 'i-lucide-bookmark-plus',
  onSelect: () => bookmarkForm.openCreate(),
  class: 'opacity-0 hover:opacity-100 hover:delay-500 transition-opacity',
}

const leftTreeWithAdd = computed<TreeItem[]>(() => [...leftTree.value, addFolderItem])
const rightTreeWithAdd = computed<TreeItem[]>(() => [...rightTree.value, addBookmarkItem])
</script>

<template>
  <div class="pl-[28vw] pr-[22vw] py-[10vh] min-h-screen flex">
    <div class="w-1/2 min-w-0">
      <UTree
        :items="leftTreeWithAdd"
        :get-key="getItemKey"
        :ui="{
          link: 'hover:text-inherit hover:before:bg-transparent before:bg-inherit text-inherit',
        }"
      >
        <template #item-trailing="{ item }">
          <UDropdownMenu v-if="'_bookmark' in item" :items="getLeftMenu(item)" :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="link"
              size="xs"
              class="opacity-0 transition-opacity group-hover:opacity-100 group-hover:delay-500"
              @click.stop
            />
          </UDropdownMenu>
        </template>
      </UTree>
    </div>
    <div class="w-1/2 min-w-0">
      <UTree
        :items="rightTreeWithAdd"
        :get-key="getItemKey"
        :ui="{
          link: 'hover:text-inherit hover:before:bg-transparent before:bg-inherit text-inherit',
        }"
      >
        <template #item-trailing="{ item }">
          <UDropdownMenu v-if="'_bookmark' in item" :items="getBookmarkMenu(item)" :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="link"
              size="xs"
              class="opacity-0 transition-opacity group-hover:opacity-100 group-hover:delay-500"
              @click.stop
            />
          </UDropdownMenu>
        </template>
      </UTree>
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
