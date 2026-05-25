import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'
import LoadingSpinner from '../../../components/LoadingSpinner'
import Toast from '../../../components/Toast'
import { createVnPayPaymentUrl, getBooking } from '../../../services/bookingService'
import { formatMoney } from '../../admin/customers/customerUtils'

function PaymentPage() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadPaymentData() {
      setLoading(true)
      setToast(null)
      try {
        const [bookingData, paymentData] = await Promise.all([
          getBooking(bookingId),
          createVnPayPaymentUrl(bookingId),
        ])
        if (!ignore) {
          setBooking(bookingData)
          setPayment(paymentData)
        }
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

  const pay = () => {
    if (!payment?.paymentUrl) return
    setCreating(true)
    window.location.href = payment.paymentUrl
  }

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
          <>
            <div className="payment-summary">
              <div>
                <span>Phòng</span>
                <strong>{booking.roomName || `Phòng ${booking.roomId}`}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{booking.currentStatus}</strong>
              </div>
              <div>
                <span>Check-in</span>
                <strong>{booking.checkIn}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{booking.checkOut}</strong>
              </div>
              <div>
                <span>Số khách</span>
                <strong>{booking.guestCount}</strong>
              </div>
              <div>
                <span>Tổng tiền</span>
                <strong>{formatMoney(booking.totalAmount)}</strong>
              </div>
            </div>

            {payment?.demoMode && (
              <div className="payment-demo-note">
                {payment.message}
              </div>
            )}

            <button className="save-btn payment-submit" disabled={creating || !payment?.paymentUrl} onClick={pay} type="button">
              <AppIcon name="wallet" />
              {creating ? 'Đang chuyển hướng...' : payment?.demoMode ? 'Thanh toán demo' : 'Thanh toán bằng VNPay'}
            </button>
          </>
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
