<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const props = defineProps<{
  bookmarks: BookmarkWithAncestors[]
}>()

const emit = defineEmits<{
  reveal: [bookmark: BookmarkWithAncestors]
}>()

const open = ref(false)

const groups = computed<CommandPaletteGroup[]>(() => [{
  id: 'bookmarks',
  label: 'Bookmarks',
  items: props.bookmarks
    .filter(b => b.type === 'bookmark')
    .map(b => ({
      label: b.name,
      suffix: b.url ?? '',
      icon: 'i-lucide-bookmark',
      onSelect: () => {
        emit('reveal', b)
        open.value = false
      },
    }) satisfies CommandPaletteItem),
}])
</script>

<template>
  <UButton
    icon="i-lucide-search"
    color="neutral"
    variant="link"
    aria-label="Search bookmarks"
    class="fixed right-6 bottom-6"
    @click="open = true"
  />

  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-5xl top-[10vh] translate-y-0',
    }"
  >
    <template #content>
      <UCommandPalette
        :groups="groups"
        :fuse="{ fuseOptions: { keys: ['label', 'suffix'] } }"
        close
        placeholder="Search bookmarks..."
        class="max-h-[70vh]"
        @update:open="open = $event"
      />
    </template>
  </UModal>
</template>
