import crypto from 'crypto'
import { NextRequest } from 'next/server'

const ADMIN_USER = 'frison'
const ADMIN_PASS = 'frison50anos'
const AUTH_SECRET = 'e9c0f2f9f34141a38c30f2197b64b0ca1f75a7d138f047f2adf923c4a5b1e4ad'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000
export const SESSION_COOKIE_NAME = 'admin_session'

type SessionPayload = {
  sub: 'admin'
  exp: number
  iat: number
}

const base64Url = (input: string | Buffer) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64Url = (input: string) => {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

export const validateAdminCredentials = (username: string, password: string) => {
  return username === ADMIN_USER && password === ADMIN_PASS
}

const sign = (payload: string) => {
  return base64Url(crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest())
}

const buildPayload = (): SessionPayload => {
  const now = Date.now()
  return {
    sub: 'admin',
    iat: now,
    exp: now + SESSION_DURATION_MS,
  }
}

export const createSessionToken = () => {
  const payload = buildPayload()
  const encodedPayload = base64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return {
    token: `${encodedPayload}.${signature}`,
    expires: new Date(payload.exp),
  }
}

const parseToken = (token: string | undefined): SessionPayload | null => {
  if (!token) return null
  const [encodedPayload, providedSignature] = token.split('.')
  if (!encodedPayload || !providedSignature) return null

  const expectedSignature = sign(encodedPayload)
  if (providedSignature.length !== expectedSignature.length) {
    return null
  }

  if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload
    if (payload.sub !== 'admin') return null
    if (Date.now() > payload.exp) return null
    return payload
  } catch (error) {
    return null
  }
}

export const verifySessionToken = (token: string | undefined) => parseToken(token)

export const requireAuth = (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export const hasValidSessionCookie = (token: string | undefined) => !!verifySessionToken(token)
