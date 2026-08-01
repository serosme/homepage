<script setup lang="ts">
const route = useRoute()
const redirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//')
    ? r
    : '/'
})

function onLoggedIn() {
  navigateTo(redirect.value)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-sm">
      <LoginForm @logged-in="onLoggedIn" />
    </div>
  </div>
</template>
