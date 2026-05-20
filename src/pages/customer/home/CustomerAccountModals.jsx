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
      setToast({ type: 'error', message: error.message || 'Không cập nhật được thông tin' })
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
            <h2 id="customer-profile-title">Chỉnh sửa thong tin</h2>
          </div>
          <button className="icon-btn" disabled={saving} onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <form className="home-account-form" onSubmit={submit}>
          <label className="field">
            <span>Họ tên</span>
            <input onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Email</span>
            <input onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input onChange={(event) => updateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field">
            <span>Địa chỉ</span>
            <input onChange={(event) => updateField('address', event.target.value)} value={form.address} />
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" disabled={saving} onClick={onClose} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu thay doi'}
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
      setToast({ type: 'error', message: 'Mật khẩu xác nhận không trùng khớp' })
      return
    }
    setSaving(true)
    setToast(null)
    try {
      await updateCustomer(customer.id, { password: form.password })
      onClose()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không đổi được mật khẩu' })
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
          <button className="icon-btn" disabled={saving} onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <form className="home-account-form single" onSubmit={submit}>
          <label className="field">
            <span>Mật khẩu moi</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
              type="password"
              value={form.password}
            />
          </label>
          <label className="field">
            <span>Xác nhận mat khau</span>
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
              Hủy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Xác nhận'}
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
            <h2 id="customer-history-title">Lịch sử đặt phòng</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        {loading ? (
          <LoadingSpinner label="Đang tải lịch sử..." />
        ) : bookings.length === 0 ? (
          <EmptyState title="Chưa có booking" description="Cac booking cua ban se hien thi tai day." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Phòng</th>
                  <th>Thoi gian</th>
                  <th>Trạng thái</th>
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
