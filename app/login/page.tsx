import LoginForm from '@/components/login-form'
import { SESSION_COOKIE_NAME, hasValidSessionCookie } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const LoginPage = () => {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)
  const token = sessionCookie ? sessionCookie.value : undefined
  if (hasValidSessionCookie(token)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Acesso restrito</h1>
        <p className="mb-6 text-sm text-gray-500">Insira suas credenciais para visualizar a lista.</p>
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
