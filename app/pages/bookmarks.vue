<script setup lang="ts">
const { leftTree, rightTree, remove, refresh, maxPosition } = useBookmarks()
const { createModal, editModal, getMenu } = useBookmarkMenu(remove)

function create(type: 'folder' | 'bookmark') {
  createModal.type = type
  createModal.parentId = undefined
  createModal.open = true
}
</script>

<template>
  <div class="px-[25vw] py-[10vh] min-h-screen flex items-stretch">
    <div class="w-1/2 min-w-0">
      <UContextMenu :items="[[{ label: 'New Folder', icon: 'i-lucide-folder-plus', onSelect: () => create('folder') }]]">
        <UTree
          :items="leftTree"
          :ui="{
            link: 'truncate cursor-pointer before:bg-transparent text-inherit',
            linkTrailing: 'hidden',
          }"
        >
          <template #item-label="{ item }">
            <UContextMenu :items="getMenu(item)">
              <div>{{ item.label }}</div>
            </UContextMenu>
          </template>
        </UTree>
      </UContextMenu>
    </div>
    <div class="w-1/2 min-w-0">
      <UContextMenu :items="[[{ label: 'New Bookmark', icon: 'i-lucide-bookmark-plus', onSelect: () => create('bookmark') }]]">
        <UTree
          :items="rightTree"
          :ui="{
            link: 'truncate cursor-pointer before:bg-transparent text-inherit',
          }"
        >
          <template #item-label="{ item }">
            <UContextMenu :items="getMenu(item)">
              <div>{{ item.label }}</div>
            </UContextMenu>
          </template>
        </UTree>
      </UContextMenu>
    </div>
    <BookmarkFormModal
      v-model:open="createModal.open"
      mode="create"
      :type="createModal.type"
      :parent-id="createModal.parentId"
      :max-position="maxPosition"
      @created="refresh"
    />
    <BookmarkFormModal
      v-model:open="editModal.open"
      mode="edit"
      :type="editModal.type"
      :item="editModal.item"
      @updated="refresh"
    />
  </div>
</template>
