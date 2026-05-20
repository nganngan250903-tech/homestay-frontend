import { useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import Toast from '../../../components/Toast'
import { request } from '../../../services/api'

const AUTH_MODAL_ANIMATION_MS = 180

function CustomerAuthModal({ initialMode = 'login', onClose, onLogin }) {
  const [mode, setMode] = useState(initialMode)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [closing, setClosing] = useState(false)

  const closeModal = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, AUTH_MODAL_ANIMATION_MS)
  }

  const updateLoginField = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }))
  }

  const updateRegisterField = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }))
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setToast(null)

    try {
      const response = await request('/auth/login', { method: 'POST', data: loginForm })
      const auth = response.data
      const role = String(auth?.role || auth?.userType || '').toUpperCase()

      if (role !== 'CUSTOMER') {
        setToast({ type: 'error', message: 'Tai khoan nay khong phai khach hang. Vui long dang nhap o trang quan tri.' })
        return
      }

      onLogin(auth)
      closeModal()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Dang nhap that bai' })
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
      closeModal()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Dang ky that bai' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`modal-backdrop auth-modal-backdrop ${closing ? 'closing' : ''}`} role="presentation">
      <section className="customer-auth-modal" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title">
        <div className="customer-auth-head">
          <div>
            <p className="eyebrow">Lim Dim Homestay</p>
            <h2 id="customer-auth-title">{mode === 'login' ? 'Dang nhap khach hang' : 'Dang ky khach hang'}</h2>
          </div>
          <button className="icon-btn" onClick={closeModal} type="button" aria-label="Dong">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="home-auth-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
            Dang nhap
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
            Dang ky
          </button>
        </div>

        <Toast message={toast?.message} type={toast?.type} />

        {mode === 'login' ? (
          <form className="home-auth-form" onSubmit={submitLogin}>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => updateLoginField('email', event.target.value)}
                required
                type="email"
                value={loginForm.email}
              />
            </label>
            <label className="field">
              <span>Mat khau</span>
              <input
                autoComplete="current-password"
                onChange={(event) => updateLoginField('password', event.target.value)}
                required
                type="password"
                value={loginForm.password}
              />
            </label>
            <button className="home-primary-btn" disabled={loading} type="submit">
              <AppIcon name="login" />
              {loading ? 'Dang dang nhap...' : 'Dang nhap'}
            </button>
          </form>
        ) : (
          <form className="home-auth-form" onSubmit={submitRegister}>
            <label className="field">
              <span>Ho ten</span>
              <input
                onChange={(event) => updateRegisterField('name', event.target.value)}
                required
                value={registerForm.name}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => updateRegisterField('email', event.target.value)}
                required
                type="email"
                value={registerForm.email}
              />
            </label>
            <label className="field">
              <span>So dien thoai</span>
              <input
                onChange={(event) => updateRegisterField('phone', event.target.value)}
                required
                value={registerForm.phone}
              />
            </label>
            <label className="field">
              <span>Mat khau</span>
              <input
                autoComplete="new-password"
                onChange={(event) => updateRegisterField('password', event.target.value)}
                required
                type="password"
                value={registerForm.password}
              />
            </label>
            <button className="home-primary-btn" disabled={loading} type="submit">
              <AppIcon name="plus" />
              {loading ? 'Dang tao tai khoan...' : 'Dang ky'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

export default CustomerAuthModal
