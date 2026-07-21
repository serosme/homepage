<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const props = defineProps<{
  open: boolean
  type: 'folder' | 'bookmark'
  mode: 'create' | 'edit'
  maxPosition?: number
  parentId?: number
  item?: Bookmark | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': []
  'updated': []
}>()

const title = computed(() => {
  const prefix = props.mode === 'create' ? 'New' : 'Edit'
  const suffix = props.type === 'folder' ? 'Folder' : 'Bookmark'
  return `${prefix} ${suffix}`
})

const toast = useToast()

const formState = reactive({
  name: '',
  url: '',
})

watch(() => props.open, (open) => {
  if (open) {
    if (props.mode === 'edit' && props.item) {
      formState.name = props.item.name
      formState.url = props.item.url ?? ''
    }
    else {
      formState.name = ''
      formState.url = ''
    }
  }
})

function validate(state: typeof formState): FormError<string>[] {
  const errors: FormError<string>[] = []
  if (!state.name)
    errors.push({ name: 'name', message: 'Name is required' })
  if (props.type === 'bookmark' && !state.url)
    errors.push({ name: 'url', message: 'URL is required' })
  return errors
}

async function handleSubmit() {
  try {
    if (props.mode === 'create') {
      const body: InsertBookmark = {
        type: props.type,
        name: formState.name,
        position: (props.maxPosition ?? 0) + 1,
        parentId: props.parentId,
      }
      if (props.type === 'bookmark')
        body.url = formState.url || undefined

      await $fetch('/api/bookmarks', {
        method: 'POST',
        body,
      })

      emit('created')
      emit('update:open', false)
    }
    else {
      const body: InsertBookmark = {
        type: props.type,
        name: formState.name,
        url: props.type === 'bookmark' ? formState.url || undefined : undefined,
        position: props.item?.position ?? (props.maxPosition ?? 0) + 1,
        parentId: props.item?.parentId ?? null,
      }

      await $fetch(`/api/bookmarks/${props.item!.id}`, {
        method: 'PUT',
        body,
      })

      emit('updated')
      emit('update:open', false)
    }
  }
  catch {
    toast.add({ title: 'Failed to save', description: 'Please try again', color: 'error' })
  }
}
</script>

<template>
  <UModal :open="open" :title="title" @update:open="emit('update:open', $event)">
    <template #body>
      <UForm :state="formState" class="space-y-4" :validate="validate" @submit="handleSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="formState.name" class="w-full" />
        </UFormField>
        <UFormField v-if="type === 'bookmark'" label="URL" name="url" required>
          <UInput v-model="formState.url" class="w-full" />
        </UFormField>
        <UButton type="submit">
          {{ mode === 'create' ? 'Create' : 'Save' }}
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
