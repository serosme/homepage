export default defineEventHandler(async (event) => {
  const { password } = await readBody<{ password: string }>(event)

  if (!checkPassword(password)) {
    throw createError({ statusCode: 400, message: 'Wrong password' })
  }

  const token = await signToken()

  setCookie(event, 'token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 86400,
    path: '/',
  })
})
