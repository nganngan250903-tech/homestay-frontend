import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import Toast from '../../../components/Toast'
import { confirmVnPayReturnPayment } from '../../../services/bookingService'

function PaymentResultPage() {
  const [params] = useSearchParams()
  const responseCode = params.get('vnp_ResponseCode')
  const bookingId = params.get('vnp_TxnRef')
  const isSuccess = responseCode === '00'
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!bookingId) return

    confirmVnPayReturnPayment(Object.fromEntries(params.entries()))
      .then(() => {
        if (isSuccess) {
          setToast({ type: 'success', message: 'Đã cập nhật thanh toán cho booking.' })
        }
      })
      .catch((error) => setToast({ type: 'error', message: error.message || 'Không cập nhật được thanh toán.' }))
  }, [bookingId, isSuccess, params])

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
            ? 'Booking đã được thanh toán.'
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
