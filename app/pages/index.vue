<script setup lang="ts">
const { leftTree, rightTree } = useBookmarks()
const { createModal, editModal, getMenu, maxPosition, refresh } = useBookmarkMenu()

function create(type: 'folder' | 'bookmark') {
  createModal.type = type
  createModal.parentId = undefined
  createModal.open = true
}
</script>

<template>
  <div class="px-[25vw] py-[10vh] min-h-screen flex items-stretch">
    <div class="w-1/2 min-w-0">
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
    </div>
    <div class="w-1/2 min-w-0">
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
    </div>

    <div class="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
      <UButton
        icon="i-lucide-folder-plus"
        size="lg"
        color="neutral"
        variant="ghost"
        class="rounded-full"
        @click="create('folder')"
      />
      <UButton
        icon="i-lucide-bookmark-plus"
        size="lg"
        color="neutral"
        variant="ghost"
        class="rounded-full"
        @click="create('bookmark')"
      />
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
