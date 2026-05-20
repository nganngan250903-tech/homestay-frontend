import { useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import Toast from '../../../components/Toast'
import { updateCustomer } from '../../../services/customerService'
import { formatMoney } from '../../admin/customers/customerUtils'
import { customerFormFrom } from './homeUtils'

export function CustomerProfileModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState(() => customerFormFrom(customer))
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)
    try {
      const updated = await updateCustomer(customer.id, form)
      onSaved(updated)
      onClose()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong cap nhat duoc thong tin' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-account-modal" role="dialog" aria-modal="true" aria-labelledby="customer-profile-title">
        <div className="customer-auth-head">
          <div>
            <p className="eyebrow">Tai khoan</p>
            <h2 id="customer-profile-title">Chinh sua thong tin</h2>
          </div>
          <button className="icon-btn" disabled={saving} onClick={onClose} type="button" aria-label="Dong">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <form className="home-account-form" onSubmit={submit}>
          <label className="field">
            <span>Ho ten</span>
            <input onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Email</span>
            <input onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} />
          </label>
          <label className="field">
            <span>So dien thoai</span>
            <input onChange={(event) => updateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field">
            <span>Dia chi</span>
            <input onChange={(event) => updateField('address', event.target.value)} value={form.address} />
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" disabled={saving} onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu thay doi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export function CustomerPasswordModal({ customer, onClose }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setToast({ type: 'error', message: 'Mat khau xac nhan khong trung khop' })
      return
    }
    setSaving(true)
    setToast(null)
    try {
      await updateCustomer(customer.id, { password: form.password })
      onClose()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong doi duoc mat khau' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-account-modal small" role="dialog" aria-modal="true" aria-labelledby="customer-password-title">
        <div className="customer-auth-head">
          <div>
            <p className="eyebrow">Bao mat</p>
            <h2 id="customer-password-title">Doi mat khau</h2>
          </div>
          <button className="icon-btn" disabled={saving} onClick={onClose} type="button" aria-label="Dong">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <form className="home-account-form single" onSubmit={submit}>
          <label className="field">
            <span>Mat khau moi</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
              type="password"
              value={form.password}
            />
          </label>
          <label className="field">
            <span>Xac nhan mat khau</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              required
              type="password"
              value={form.confirmPassword}
            />
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" disabled={saving} onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Xac nhan'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export function CustomerBookingHistoryModal({ bookings, loading, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-account-modal wide" role="dialog" aria-modal="true" aria-labelledby="customer-history-title">
        <div className="customer-auth-head">
          <div>
            <p className="eyebrow">Booking</p>
            <h2 id="customer-history-title">Lich su dat phong</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong">
            <AppIcon name="close" />
          </button>
        </div>
        {loading ? (
          <LoadingSpinner label="Dang tai lich su..." />
        ) : bookings.length === 0 ? (
          <EmptyState title="Chua co booking" description="Cac booking cua ban se hien thi tai day." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Phong</th>
                  <th>Thoi gian</th>
                  <th>Trang thai</th>
                  <th>Tong tien</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.roomName || `Room ${booking.roomId}`} - {booking.roomTypeName}</td>
                    <td>
                      <span className="cell-subtext">{booking.checkIn}</span>
                      <span className="cell-subtext">{booking.checkOut}</span>
                    </td>
                    <td>{booking.currentStatus}</td>
                    <td>{formatMoney(booking.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
