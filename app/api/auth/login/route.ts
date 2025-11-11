import { NextRequest, NextResponse } from 'next/server'

import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  validateAdminCredentials,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!username || !password) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 400 })
  }

  let isValid = false
  try {
    isValid = validateAdminCredentials(username, password)
  } catch (error) {
    console.error('Erro de configuração de autenticação:', error)
    return NextResponse.json({ error: 'Autenticação indisponível' }, { status: 500 })
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { token, expires } = createSessionToken()
  const response = NextResponse.json({ success: true })

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  })

  return response
}
