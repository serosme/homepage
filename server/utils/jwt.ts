import type { H3Event } from 'h3'
import process from 'node:process'
import { jwtVerify, SignJWT } from 'jose'

const password = process.env.AUTH_PASSWORD || ''

function getSecret() {
  return new TextEncoder().encode(password)
}

export async function signToken(): Promise<string> {
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  }
  catch {
    return false
  }
}

export function checkPassword(input: string): boolean {
  return !!password && input === password
}

export async function getTokenOrThrow(event: H3Event): Promise<void> {
  const token = getCookie(event, 'token')
  if (!token || !(await verifyToken(token))) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
}
