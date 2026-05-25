import AppIcon from '../../components/AppIcon'
import { bookingStatuses } from './resourceConfig'

function ResourceLookup({
  activeKey,
  bookingStatus,
  loading,
  lookupId,
  onCancelBooking,
  canDelete = true,
  onDeleteById,
  onFetchById,
  onLoadEmployees,
  onLookupIdChange,
  onStatusChange,
  onSubmitStatus,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{canDelete ? 'Tra cứu hoặc xóa dữ liệu' : 'Tra cứu dữ liệu'}</h2>
        </div>
      </div>

      <div className="lookup-row">
        <label className="field compact">
          <span>Giá trị tra cứu</span>
          <input min="1" onChange={onLookupIdChange} type="number" value={lookupId || ''} />
        </label>
        <button className="view-btn" disabled={loading} onClick={onFetchById} type="button">
          <AppIcon name="eye" />
          Lấy dữ liệu
        </button>
        {canDelete && (
          <button className="danger-btn" disabled={loading} onClick={onDeleteById} type="button">
            <AppIcon name="trash" />
            Xóa
          </button>
        )}
      </div>

      {activeKey === 'employees' && (
        <button className="blue-btn wide-btn" disabled={loading} onClick={onLoadEmployees} type="button">
          <AppIcon name="list" />
          Tải danh sách nhân viên
        </button>
      )}

      {activeKey === 'bookings' && (
        <form className="status-box" onSubmit={onSubmitStatus}>
          <h3>Cập nhật booking</h3>
          <div className="lookup-row">
            <label className="field compact">
              <span>Booking</span>
              <input
                min="1"
                onChange={(event) => onStatusChange('bookingId', event.target.value)}
                type="number"
                value={bookingStatus.bookingId}
              />
            </label>
            <label className="field compact">
              <span>Trạng thái</span>
              <select
                onChange={(event) => onStatusChange('status', event.target.value)}
                value={bookingStatus.status}
              >
                {bookingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button className="save-btn" disabled={loading} type="submit">
              <AppIcon name="save" />
              Cập nhật
            </button>
            <button className="danger-btn" disabled={loading} onClick={onCancelBooking} type="button">
              <AppIcon name="close" />
              Hủy booking
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ResourceLookup
