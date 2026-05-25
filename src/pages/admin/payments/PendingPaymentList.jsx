import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import { formatCurrency, formatDateTime } from './paymentUtils'

function getOutstandingAmount(booking) {
  return Math.max(0, Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
}

function PendingPaymentList({ bookings, loading, onCreatePayment, saving }) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Booking chưa thanh toán đủ</h2>
        </div>
      </div>

      {loading ? (
        <div className="payment-mini-loading">Đang tải booking cần thanh toán...</div>
      ) : bookings.length === 0 ? (
        <EmptyState title="Không có booking cần thanh toán" description="Các booking hiện tại đã được ghi nhận đủ tiền." />
      ) : (
        <div className="payment-due-grid">
          {bookings.map((booking) => (
            <article className="payment-due-item" key={booking.id}>
              <div>
                <strong>{booking.customerName || '-'}</strong>
                <span>{booking.roomName || '-'}{booking.roomTypeName ? ` - ${booking.roomTypeName}` : ''}</span>
              </div>
              <div>
                <span>Check-in</span>
                <strong>{formatDateTime(booking.checkIn) || '-'}</strong>
              </div>
              <div>
                <span>Còn thiếu</span>
                <strong>{formatCurrency(getOutstandingAmount(booking))}</strong>
              </div>
              <button className="save-btn compact-btn" disabled={saving} onClick={() => onCreatePayment(booking)} type="button">
                <AppIcon name="wallet" />
                Tạo link
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default PendingPaymentList
