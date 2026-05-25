import AppIcon from '../../../components/AppIcon'
import { formatDateTime, formatMoney, getBookingStatusLabel, getStayStatus } from './bookingUtils'

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

function BookingDetailModal({ booking, onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card room-detail-card">
        <div className="modal-head detail-modal-head">
          <div>
            <h2>Chi tiết booking</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="detail-list">
          <DetailItem label="Khách hàng" value={booking.customerName || '-'} />
          <DetailItem label="Phòng" value={`${booking.roomName || booking.roomId} - ${booking.roomTypeName || '-'}`} />
          <DetailItem label="Trạng thái booking" value={getBookingStatusLabel(booking.currentStatus)} />
          <DetailItem label="Trạng thái lưu trú" value={getStayStatus(booking)} />
          <DetailItem label="Check-in dự kiến" value={formatDateTime(booking.checkIn)} />
          <DetailItem label="Check-out dự kiến" value={formatDateTime(booking.checkOut)} />
          <DetailItem label="Check-in thực tế" value={formatDateTime(booking.actualCheckInAt)} />
          <DetailItem label="Check-out thực tế" value={formatDateTime(booking.actualCheckOutAt)} />
          <DetailItem label="Số khách" value={booking.guestCount} />
          <DetailItem label="Tổng tiền" value={formatMoney(booking.totalAmount)} />
          <DetailItem label="Đã thanh toán" value={formatMoney(booking.paidAmount)} />
          <DetailItem label="Hết hạn giữ chỗ" value={formatDateTime(booking.pendingExpiresAt)} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
        </div>
      </section>
    </div>
  )
}

export default BookingDetailModal
