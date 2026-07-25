export default defineEventHandler(async (event) => {
  if (event.path.startsWith('/api/auth/')) {
    return
  }
  if (event.path.startsWith('/api/')) {
    await getTokenOrThrow(event)
  }
})
