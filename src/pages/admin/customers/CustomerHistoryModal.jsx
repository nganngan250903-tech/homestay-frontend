import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { formatMoney } from './customerUtils'

function CustomerHistoryModal({ bookings, customer, loading, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="history-title">{customer.name}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Đang tải lịch sử..." />
        ) : bookings.length === 0 ? (
          <EmptyState title="Chưa có booking" description="Khách hàng này chưa có lịch sử đặt phòng." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
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

export default CustomerHistoryModal

