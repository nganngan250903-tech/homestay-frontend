import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'
import LoadingSpinner from '../../../components/LoadingSpinner'
import Toast from '../../../components/Toast'
import { cancelBooking, createVnPayPaymentUrl, getBooking } from '../../../services/bookingService'
import { updateCustomer } from '../../../services/customerService'
import { getRoom } from '../../../services/roomService'
import { formatMoney } from '../../admin/customers/customerUtils'

function formatDateTime(value) {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function countNights(checkIn, checkOut) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.max(1, Math.ceil((end - start) / 86400000))
}

function PaymentInfoRow({ label, value }) {
  return (
    <div className="payment-info-row">
      <span>{label}</span>
      <strong>{value || 'Chưa có'}</strong>
    </div>
  )
}

function formatBookingStatus(status) {
  const labels = {
    PENDING: 'Chờ thanh toán',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
  }
  return labels[status] || status || 'Chưa có'
}

function CustomerInfoField({ field, form, label, onChange, required, type = 'text', value }) {
  const hasValue = Boolean(String(value || '').trim())

  if (hasValue) {
    return <PaymentInfoRow label={`${label}${required ? ' *' : ''}`} value={value} />
  }

  return (
    <div className="payment-info-row">
      <span>{label}{required ? ' *' : ''}</span>
      <input
        className="payment-info-input"
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={`Nhập ${label.toLowerCase()}`}
        required={required}
        type={type}
        value={form[field] || ''}
      />
    </div>
  )
}

function PaymentPage({ bookingCustomer }) {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [room, setRoom] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState(null)
  const [customerForm, setCustomerForm] = useState({ email: '', name: '', phone: '', address: '' })

  useEffect(() => {
    let ignore = false

    async function loadPaymentData() {
      setLoading(true)
      setToast(null)
      try {
        const bookingData = await getBooking(bookingId)
        const paymentData = bookingData.currentStatus === 'PENDING'
          ? await createVnPayPaymentUrl(bookingId)
          : null
        if (!ignore) {
          setBooking(bookingData)
          setPayment(paymentData)
          if (bookingData.currentStatus === 'CONFIRMED') {
            setToast({ type: 'success', message: 'Booking đã được thanh toán' })
          }
        }

        getRoom(bookingData.roomId)
          .then((roomData) => {
            if (!ignore) setRoom(roomData)
          })
          .catch(() => {
            if (!ignore) setRoom(null)
          })
      } catch (error) {
        if (!ignore) {
          setToast({ type: 'error', message: error.message || 'Không tải được thông tin thanh toán' })
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPaymentData()

    return () => {
      ignore = true
    }
  }, [bookingId])

  const updateCustomerField = (field, value) => {
    setCustomerForm((current) => ({ ...current, [field]: value }))
  }

  const pay = async () => {
    if (!payment?.paymentUrl) return
    const customer = bookingCustomer || {}
    const email = (customer.email || customerForm.email || '').trim()
    const phone = (customer.phone || customerForm.phone || '').trim()

    if (!email || !phone) {
      setToast({ type: 'error', message: 'Vui lòng nhập đầy đủ Gmail và số điện thoại trước khi thanh toán' })
      return
    }

    setCreating(true)
    setToast(null)
    try {
      const payload = {}
      for (const field of ['email', 'name', 'phone', 'address']) {
        const currentValue = String(customer[field] || '').trim()
        const nextValue = String(customerForm[field] || '').trim()
        if (!currentValue && nextValue) {
          payload[field] = nextValue
        }
      }

      const customerId = customer.id || booking?.customerId
      if (customerId && Object.keys(payload).length > 0) {
        await updateCustomer(customerId, payload)
      }

      window.location.href = payment.paymentUrl
    } catch (error) {
      setCreating(false)
      setToast({ type: 'error', message: error.message || 'Không cập nhật được thông tin khách hàng' })
    }
  }

  const cancel = async () => {
    if (!booking) return
    setCancelling(true)
    setToast(null)
    try {
      await cancelBooking(booking.id)
      setToast({ type: 'success', message: 'Đã hủy booking' })
      window.setTimeout(() => navigate('/home/bookingRoom'), 600)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không hủy được booking' })
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking?.currentStatus)
  const nights = booking ? countNights(booking.checkIn, booking.checkOut) : 0
  const customer = bookingCustomer || {}
  const roomImage = room?.thumbnail || room?.roomType?.image || '/Lim Dim.png'

  return (
    <section className="payment-page">
      <Toast message={toast?.message} type={toast?.type} />
      <div className="payment-panel">
        <div className="payment-head">
          <div>
            <h1>Thanh toán booking</h1>
          </div>
          <Link className="cancel-btn compact-btn" to="/home/bookingRoom">
            <AppIcon name="chevronLeft" />
            Quay lại
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Đang tải thanh toán..." />
        ) : booking ? (
          <div className="payment-checkout-grid">
            <aside className="payment-booking-card">
              <img src={roomImage} alt={booking.roomName || 'Phòng đã đặt'} />
              <div className="payment-booking-body">
                <div>
                  <h2>{booking.roomName || `Phòng ${booking.roomId}`}</h2>
                  <p>{booking.roomTypeName || 'Lim Dim Homestay'}</p>
                </div>
                <div className="payment-booking-dates">
                  <div>
                    <span>Nhận phòng</span>
                    <strong>{formatDateTime(booking.checkIn)}</strong>
                  </div>
                  <div>
                    <span>Trả phòng</span>
                    <strong>{formatDateTime(booking.checkOut)}</strong>
                  </div>
                </div>
                <div className="payment-booking-selection">
                  <span>Bạn đã chọn</span>
                  <strong>{nights} đêm, 1 phòng cho {booking.guestCount} khách</strong>
                </div>
                <div className="payment-price-box">
                  <div>
                    <span>Trạng thái</span>
                    <strong>{formatBookingStatus(booking.currentStatus)}</strong>
                  </div>
                  <div>
                    <span>Tổng cộng</span>
                    <strong>{formatMoney(booking.totalAmount)}</strong>
                  </div>
                </div>
              </div>
            </aside>

            <section className="payment-customer-card">
              <div className="payment-card-title">
                <h2>Thông tin khách hàng</h2>
                <p>Vui lòng kiểm tra thông tin trước khi thanh toán.</p>
              </div>

              <div className="payment-info-list">
                <CustomerInfoField
                  field="email"
                  form={customerForm}
                  label="Gmail"
                  onChange={updateCustomerField}
                  required
                  type="email"
                  value={customer.email}
                />
                <CustomerInfoField
                  field="name"
                  form={customerForm}
                  label="Họ tên"
                  onChange={updateCustomerField}
                  value={customer.name || booking.customerName}
                />
                <CustomerInfoField
                  field="phone"
                  form={customerForm}
                  label="Số điện thoại"
                  onChange={updateCustomerField}
                  required
                  value={customer.phone}
                />
                <CustomerInfoField
                  field="address"
                  form={customerForm}
                  label="Địa chỉ"
                  onChange={updateCustomerField}
                  value={customer.address}
                />
              </div>

              {payment?.demoMode && (
                <div className="payment-demo-note">
                  {payment.message}
                </div>
              )}

              <div className="payment-action-row">
                <button className="save-btn payment-submit" disabled={creating || !payment?.paymentUrl} onClick={pay} type="button">
                  <AppIcon name="wallet" />
                  {creating ? 'Đang chuyển hướng...' : payment?.demoMode ? 'Thanh toán demo' : 'Thanh toán'}
                </button>
                <button
                  className="cancel-btn payment-cancel-btn"
                  disabled={!canCancel || cancelling || creating}
                  onClick={cancel}
                  type="button"
                >
                  <AppIcon name="close" />
                  {cancelling ? 'Đang hủy...' : 'Hủy'}
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="empty-state">
            <strong>Không tìm thấy booking</strong>
            <span>Vui lòng quay lại trang đặt phòng.</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default PaymentPage
