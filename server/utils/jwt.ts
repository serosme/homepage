import type { H3Event } from 'h3'
import process from 'node:process'
import { jwtVerify, SignJWT } from 'jose'

const password = process.env.AUTH_SECRET || ''

// 刻意设计：单用户应用，密码同时作为登录凭证与 HS256 签名密钥。
// 多用户系统中密码即密钥会造成权限升级（知道他人密码即可伪造其 token），
// 但本应用只有一个账号，能构造 token 的人与能直接登录的人权限等价，
// 因此合并为一个环境变量（AUTH_SECRET）简化部署配置。
function getSecret() {
  return new TextEncoder().encode(password)
}

export async function signToken(): Promise<string> {
  if (!password)
    throw createError({ statusCode: 400, message: 'AUTH_SECRET is not configured' })
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!password)
    return false
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
