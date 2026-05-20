import { useState } from 'react'
import AppIcon from '../../components/AppIcon'
import Brand from '../../components/Brand'
import Toast from '../../components/Toast'
import { request } from '../../services/api'

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const submitLogin = async (event) => {
    event.preventDefault()
    await submitAuth('/auth/login', loginForm, 'Dang nhap thanh cong')
  }

  const submitRegister = async (event) => {
    event.preventDefault()
    await submitAuth('/auth/customer/register', registerForm, 'Dang ky thanh cong')
  }

  const submitAuth = async (path, payload, successMessage) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await request(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      onLogin(response.data)
      setMessage({ type: 'success', text: successMessage })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Khong the dang nhap' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <Brand subtitle="Dang nhap bang JWT" />
          <h1>Quan ly dat phong, phong va nhan su trong mot man hinh.</h1>
          <p>
            Employee va customer dang nhap chung qua email/password. Customer co the dang ky
            tai khoan moi, token duoc luu trong localStorage.
          </p>
          <div className="auth-facts">
            <span>POST /auth/login</span>
            <span>24h access token</span>
            <span>Role tu employee.roles</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="mode-switch">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
              type="button"
            >
              <AppIcon name="login" />
              Dang nhap
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
              type="button"
            >
              <AppIcon name="plus" />
              Dang ky customer
            </button>
          </div>

          <Toast message={message?.text} type={message?.type} />

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={submitLogin}>
              <label className="field">
                <span>Email</span>
                <input
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  type="email"
                  value={loginForm.email}
                />
              </label>
              <label className="field">
                <span>Mat khau</span>
                <input
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                  type="password"
                  value={loginForm.password}
                />
              </label>
              <button className="blue-btn" disabled={loading} type="submit">
                <AppIcon name="login" />
                {loading ? 'Dang xu ly...' : 'Dang nhap'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={submitRegister}>
              <label className="field">
                <span>Ho ten</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  value={registerForm.name}
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  type="email"
                  value={registerForm.email}
                />
              </label>
              <label className="field">
                <span>Mat khau</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                  type="password"
                  value={registerForm.password}
                />
              </label>
              <label className="field">
                <span>So dien thoai</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  required
                  value={registerForm.phone}
                />
              </label>
              <button className="save-btn" disabled={loading} type="submit">
                <AppIcon name="plus" />
                {loading ? 'Dang xu ly...' : 'Tao tai khoan customer'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

export default AuthPage
