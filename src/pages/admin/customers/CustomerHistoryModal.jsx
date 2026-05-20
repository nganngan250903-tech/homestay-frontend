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
            <p className="eyebrow">Lich su dat phong</p>
            <h2 id="history-title">{customer.name}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Dang tai lich su..." />
        ) : bookings.length === 0 ? (
          <EmptyState title="Chua co booking" description="Khach hang nay chua co lich su dat phong." />
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
                    <td>Room {booking.roomId} - {booking.roomTypeName}</td>
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
