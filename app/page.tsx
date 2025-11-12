import ConvidadosApp from '@/components/convidados-app'
import { SESSION_COOKIE_NAME, hasValidSessionCookie } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const Home = () => {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)
  const sessionToken = sessionCookie ? sessionCookie.value : undefined
  if (!hasValidSessionCookie(sessionToken)) {
    redirect('/login')
  }

  return <ConvidadosApp />
}

export default Home

