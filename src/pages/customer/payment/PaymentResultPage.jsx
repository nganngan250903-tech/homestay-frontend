import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import Toast from '../../../components/Toast'
import { confirmDemoPayment } from '../../../services/bookingService'

function PaymentResultPage() {
  const [params] = useSearchParams()
  const responseCode = params.get('vnp_ResponseCode')
  const bookingId = params.get('vnp_TxnRef')
  const isSuccess = responseCode === '00'
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!isSuccess || !bookingId) return

    confirmDemoPayment(bookingId)
      .then(() => setToast({ type: 'success', message: 'Đã cập nhật thanh toán demo cho booking.' }))
      .catch((error) => setToast({ type: 'error', message: error.message || 'Không cập nhật được thanh toán demo.' }))
  }, [bookingId, isSuccess])

  return (
    <section className="payment-page">
      <Toast message={toast?.message} type={toast?.type} />
      <div className="payment-panel result">
        <div className={`payment-result-icon ${isSuccess ? 'success' : 'error'}`}>
          <AppIcon name={isSuccess ? 'check' : 'close'} />
        </div>
        <h1>{isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa thành công'}</h1>
        <p>
          {isSuccess
            ? `Booking #${bookingId || ''} đã được thanh toán demo.`
            : `VNPay trả về mã ${responseCode || 'không xác định'}.`}
        </p>
        <div className="modal-actions detail-actions">
          <Link className="cancel-btn" to="/home/bookingRoom">
            <AppIcon name="chevronLeft" />
            Tiếp tục xem phòng
          </Link>
          {bookingId && (
            <Link className="save-btn" to={`/home/payment/${bookingId}`}>
              <AppIcon name="wallet" />
              Thanh toán lại
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

export default PaymentResultPage
