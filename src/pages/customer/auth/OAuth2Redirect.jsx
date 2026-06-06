import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { request } from '../../../services/api'

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function buildAuthFromToken(token) {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  const user = {
    id: payload.id,
    email: payload.email,
    role: payload.role || 'CUSTOMER',
  }

  return {
    token,
    userType: payload.userType || 'CUSTOMER',
    role: payload.role || 'CUSTOMER',
    user,
  }
}

function OAuth2Redirect({ onLogin }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    const completeLogin = async () => {
      const token = searchParams.get('token')
      if (!token) {
        navigate('/login', { replace: true })
        return
      }

      const auth = buildAuthFromToken(token)
      if (!auth || String(auth.role).toUpperCase() !== 'CUSTOMER') {
        navigate('/login', { replace: true })
        return
      }

      onLogin(auth)

      try {
        const customer = await request(`/customers/${auth.user.id}`)
        if (!active) return
        onLogin({ ...auth, user: { ...auth.user, ...customer.data } })
      } catch {
        // The token is enough for authenticated customer API calls.
      }

      if (active) {
        navigate('/home', { replace: true })
      }
    }

    completeLogin()

    return () => {
      active = false
    }
  }, [navigate, onLogin, searchParams])

  return (
    <main className="login-page">
      <section className="login-card oauth-redirect-card">
        <h1>Đang đăng nhập...</h1>
      </section>
    </main>
  )
}

export default OAuth2Redirect
