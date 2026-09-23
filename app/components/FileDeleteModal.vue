<script setup lang="ts">
import type { FileTreeNode } from '#shared/types/files'

const props = defineProps<{
  open: boolean
  node?: FileTreeNode
  remove: (path: string) => Promise<void>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'deleted': []
}>()

const submitting = ref(false)

const title = computed(() => props.node?.type === 'folder' ? '删除文件夹' : '删除文件')

async function handleConfirm() {
  if (!props.node || submitting.value)
    return
  submitting.value = true
  try {
    await props.remove(props.node.key)
    emit('deleted')
    emit('update:open', false)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal :open="open" :title="title" @update:open="emit('update:open', $event)">
    <template #body>
      <p class="text-sm">
        确定删除
        <span class="font-medium text-highlighted">{{ node?.label }}</span>
        吗？
      </p>
      <p v-if="node?.type === 'folder'" class="text-sm text-muted mt-2">
        文件夹内的所有文件会一并删除。
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" label="取消" @click="emit('update:open', false)" />
        <UButton color="error" label="删除" :loading="submitting" @click="handleConfirm" />
      </div>
    </template>
  </UModal>
</template>
