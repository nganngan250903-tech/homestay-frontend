import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'
import Brand from '../../../components/Brand'
import Toast from '../../../components/Toast'
import { request } from '../../../services/api'

function getRolePath(auth) {
  const role = String(auth?.role || auth?.userType || '').toUpperCase()
  if (role === 'ADMIN') return '/admin'
  if (role === 'EMPLOYEE') return '/admin/bookings'
  if (role === 'CUSTOMER') return '/home'
  return '/home'
}

function LoginPage({ onLogin }) {
  const [searchParams] = useSearchParams()
  const initialMode = useMemo(() => (searchParams.get('mode') === 'register' ? 'register' : 'login'), [searchParams])
  const [mode, setMode] = useState(initialMode)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const submitLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setToast(null)

    try {
      const response = await request('/auth/login', { method: 'POST', data: loginForm })
      const auth = response.data
      if (!auth?.role && !auth?.userType) {
        setToast({ type: 'error', message: 'Khong tim thay vai tro tai khoan. Vui long dang ky tai khoan khach hang.' })
        setMode('register')
        return
      }
      onLogin(auth)
      navigate(getRolePath(auth), { replace: true })
    } catch (error) {
      setToast({
        type: 'error',
        message: `${error.message || 'Khong tim thay tai khoan phu hop.'} Neu chua co tai khoan, vui long dang ky khach hang.`,
      })
      setMode('register')
      setRegisterForm((current) => ({ ...current, email: loginForm.email }))
    } finally {
      setLoading(false)
    }
  }

  const submitRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    setToast(null)

    try {
      const response = await request('/auth/customer/register', { method: 'POST', data: registerForm })
      onLogin(response.data)
      navigate('/home', { replace: true })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Dang ky that bai' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Brand subtitle="Customer & staff portal" />
      </header>

      <section className="login-card">
        <div>
          <p className="eyebrow">LULLABY HOMESTAY</p>
          <h1>{mode === 'login' ? 'Dang nhap tai khoan' : 'Dang ky khach hang'}</h1>
          <p className="muted-text">
            Admin vao khu quan tri, nhan vien vao trang nghiep vu, khach hang vao trang dat phong.
          </p>
        </div>

        <div className="home-auth-switch login-mode-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
            Dang nhap
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
            Dang ky
          </button>
        </div>

        <Toast message={toast?.message} type={toast?.type} />

        {mode === 'login' ? (
          <form className="form-grid single" onSubmit={submitLogin}>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                required
                type="email"
                value={loginForm.email}
              />
            </label>
            <label className="field">
              <span>Mat khau</span>
              <input
                autoComplete="current-password"
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                required
                type="password"
                value={loginForm.password}
              />
            </label>
            <button className="blue-btn" disabled={loading} type="submit">
              <AppIcon name="login" />
              {loading ? 'Dang dang nhap...' : 'Dang nhap'}
            </button>
          </form>
        ) : (
          <form className="form-grid single" onSubmit={submitRegister}>
            <label className="field">
              <span>Ho ten</span>
              <input
                onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                required
                value={registerForm.name}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                required
                type="email"
                value={registerForm.email}
              />
            </label>
            <label className="field">
              <span>So dien thoai</span>
              <input
                onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                required
                value={registerForm.phone}
              />
            </label>
            <label className="field">
              <span>Mat khau</span>
              <input
                autoComplete="new-password"
                onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                required
                type="password"
                value={registerForm.password}
              />
            </label>
            <button className="save-btn" disabled={loading} type="submit">
              <AppIcon name="plus" />
              {loading ? 'Dang tao tai khoan...' : 'Dang ky khach hang'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default LoginPage
