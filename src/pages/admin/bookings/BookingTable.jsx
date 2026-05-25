import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { bookingStatuses, getBookingStatusLabel, roomLabel } from './bookingUtils'

function getStatusOptions(status) {
  if (status === 'PENDING') return bookingStatuses
  if (status === 'CONFIRMED') return bookingStatuses.filter((item) => item.value !== 'PENDING')
  return bookingStatuses.filter((item) => item.value === status)
}

function BookingTable({
  bookings,
  filters,
  loading,
  onApplyFilters,
  onCreate,
  onFilterChange,
  onResetFilters,
  onStatusChange,
  page,
  rooms,
  saving,
  setPage,
  total,
  totalPages,
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Danh sách booking</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Tạo booking
        </button>
      </div>

      <form className="booking-toolbar compact-booking-toolbar" onSubmit={onApplyFilters}>
        <label className="field">
          <span>Tên khách hàng</span>
          <input
            onChange={(event) => onFilterChange('customerName', event.target.value)}
            placeholder="Nhập tên khách hàng"
            value={filters.customerName}
          />
        </label>
        <label className="field">
          <span>Phòng</span>
          <select onChange={(event) => onFilterChange('roomId', event.target.value)} value={filters.roomId}>
            <option value="">Tất cả phòng</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{roomLabel(room)}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Từ ngày</span>
          <input onChange={(event) => onFilterChange('dateFrom', event.target.value)} type="date" value={filters.dateFrom} />
        </label>
        <label className="field">
          <span>Đến ngày</span>
          <input onChange={(event) => onFilterChange('dateTo', event.target.value)} type="date" value={filters.dateTo} />
        </label>
        <div className="booking-toolbar-actions">
          <button className="blue-btn compact-btn" type="submit">
            <AppIcon name="search" />
            Lọc
          </button>
          <button className="cancel-btn compact-btn" onClick={onResetFilters} type="button">
            <AppIcon name="reset" />
            Xóa lọc
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <EmptyState title="Không có booking" description="Không tìm thấy booking phù hợp." />
      ) : (
        <div className="table-wrap">
          <table className="data-table booking-table compact-booking-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Nhân viên</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.customerName || 'null'}</strong>
                  </td>
                  <td>
                    <strong>{booking.employeeName || ''}</strong>
                  </td>
                  <td>
                    <strong>{booking.roomName || `Phòng ${booking.roomId}`}</strong>
                    <span className="cell-subtext">{booking.roomTypeName || '-'}</span>
                  </td>
                  <td>
                    <select
                      className={`booking-status-select ${String(booking.currentStatus || '').toLowerCase()}`}
                      disabled={saving || !['PENDING', 'CONFIRMED'].includes(booking.currentStatus)}
                      onChange={(event) => onStatusChange(booking, event.target.value)}
                      value={booking.currentStatus || ''}
                    >
                      {getStatusOptions(booking.currentStatus).map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <span className="cell-subtext">{getBookingStatusLabel(booking.currentStatus)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-bar">
        <span>Hiển thị {bookings.length} / {total} booking</span>
        <div className="pagination-actions">
          <button className="cancel-btn compact-btn" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
            <AppIcon name="chevronLeft" />
            Trước
          </button>
          <strong>{page} / {totalPages}</strong>
          <button className="cancel-btn compact-btn" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">
            Sau
            <AppIcon name="chevronRight" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default BookingTable

