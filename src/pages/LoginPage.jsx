import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppIcon from '../components/AppIcon'
import Brand from '../components/Brand'
import Toast from '../components/Toast'
import { loginStaff } from '../services/authService'

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setToast(null)

    try {
      const auth = await loginStaff(form)
      onLogin(auth)
      navigate('/admin', { replace: true })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Dang nhap that bai' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Brand subtitle="Staff portal" />
      </header>

      <section className="login-card">
        <div>
          <p className="eyebrow">LIMDIMHOMESTAY</p>
          <h1>Dang nhap he thong quan ly</h1>
          <p className="muted-text">Admin co toan quyen. Nhan vien duoc truy cap cac nghiep vu duoc phan cong.</p>
        </div>

        <Toast message={toast?.message} type={toast?.type} />

        <form className="form-grid single" onSubmit={submitLogin}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => updateField('email', event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="field">
            <span>Mat khau</span>
            <input
              autoComplete="current-password"
              onChange={(event) => updateField('password', event.target.value)}
              required
              type="password"
              value={form.password}
            />
          </label>
          <button className="blue-btn" disabled={loading} type="submit">
            <AppIcon name="login" />
            {loading ? 'Dang dang nhap...' : 'Dang nhap'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
