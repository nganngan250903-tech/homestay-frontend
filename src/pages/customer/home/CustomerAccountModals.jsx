import { useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import Toast from '../../../components/Toast'
import { updateCustomer } from '../../../services/customerService'
import { uploadImage } from '../../../services/uploadService'
import CustomerAvatar from '../../admin/customers/CustomerAvatar'
import { formatMoney } from '../../admin/customers/customerUtils'
import { customerFormFrom } from './homeUtils'

function canCancelBooking(booking) {
  return ['PENDING', 'CONFIRMED'].includes(booking.currentStatus)
}

function canPayBooking(booking) {
  if (booking.currentStatus !== 'PENDING' || !booking.pendingExpiresAt) return false
  const expiresAt = new Date(booking.pendingExpiresAt).getTime()
  return !Number.isNaN(expiresAt) && expiresAt > new Date().getTime()
}

export function CustomerProfileModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState(() => customerFormFrom(customer))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
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

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'customers')
      updateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Không thể upload ảnh đại diện.')
    } finally {
      setUploading(false)
    }
  }

  const statusLabel = customer?.status === 'LOCKED' ? 'Đang khóa' : 'Đang hoạt động'
  const statusClass = customer?.status === 'LOCKED' ? 'locked' : 'active'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-account-modal" role="dialog" aria-modal="true" aria-labelledby="customer-profile-title">
        <div className="customer-auth-head">
          <div>
            <h2 id="customer-profile-title">Chỉnh sửa thông tin</h2>
          </div>
          <button className="icon-btn" disabled={saving} onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <form className="home-account-form customer-profile-form" onSubmit={submit}>
          <div className="customer-profile-editor form-wide">
            <CustomerAvatar customer={{ ...customer, ...form }} size="large" />
            <div>
              <strong>{form.name || customer?.email}</strong>
              <span>{form.email}</span>
              <em className={`status-action-pill ${statusClass}`}>{statusLabel}</em>
            </div>
          </div>
          <label className="field">
            <span>Họ tên</span>
            <input onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
          </label>
          <div className="profile-readonly-field">
            <span>Email</span>
            <strong>{form.email || 'Chưa có'}</strong>
          </div>
          <label className="field">
            <span>Số điện thoại</span>
            <input onChange={(event) => updateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field">
            <span>Địa chỉ</span>
            <input onChange={(event) => updateField('address', event.target.value)} value={form.address} />
          </label>
          <label className="field form-wide">
            <span>Ảnh đại diện</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Đang upload ảnh...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" disabled={saving} onClick={onClose} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
            <h2 id="customer-password-title">Đổi mật khẩu</h2>
          </div>
          <button className="icon-btn" disabled={saving} onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <form className="home-account-form single" onSubmit={submit}>
          <label className="field">
            <span>Mật khẩu mới</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
              type="password"
              value={form.password}
            />
          </label>
          <label className="field">
            <span>Xác nhận mật khẩu</span>
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

export function CustomerBookingHistoryModal({ bookings, loading, onBookingCancelled, onClose }) {
  const [savingId, setSavingId] = useState(null)
  const [toast, setToast] = useState(null)

  const cancel = async (booking) => {
    setSavingId(booking.id)
    setToast(null)
    try {
      await onBookingCancelled(booking.id)
      setToast({ type: 'success', message: 'Đã hủy booking' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không hủy được booking' })
    } finally {
      setSavingId(null)
    }
  }

  const pay = (booking) => {
    onClose()
    window.location.assign(`/home/payment/${booking.id}`)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-account-modal wide" role="dialog" aria-modal="true" aria-labelledby="customer-history-title">
        <div className="customer-auth-head">
          <div>
            <h2 id="customer-history-title">Lịch sử đặt phòng</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        {loading ? (
          <LoadingSpinner label="Đang tải lịch sử..." />
        ) : bookings.length === 0 ? (
          <EmptyState title="Chưa có booking" description="Các booking của bạn sẽ hiển thị tại đây." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.roomName || `Phòng ${booking.roomId}`} - {booking.roomTypeName}</td>
                    <td>
                      <span className="cell-subtext">{booking.checkIn}</span>
                      <span className="cell-subtext">{booking.checkOut}</span>
                    </td>
                    <td>{booking.currentStatus}</td>
                    <td>{formatMoney(booking.totalAmount)}</td>
                    <td>
                      <div className="booking-history-actions">
                        {canPayBooking(booking) && (
                          <button className="save-btn compact-btn" onClick={() => pay(booking)} type="button">
                            <AppIcon name="wallet" />
                            Thanh toán
                          </button>
                        )}
                        {canCancelBooking(booking) ? (
                          <button
                            className="danger-btn compact-btn"
                            disabled={savingId === booking.id}
                            onClick={() => cancel(booking)}
                            type="button"
                          >
                            <AppIcon name="close" />
                            {savingId === booking.id ? 'Đang hủy...' : 'Hủy'}
                          </button>
                        ) : !canPayBooking(booking) ? (
                          <span className="cell-subtext">Không khả dụng</span>
                        ) : null}
                      </div>
                    </td>
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
