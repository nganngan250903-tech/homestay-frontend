import { bookingStatuses } from './resourceConfig'

function ResourceLookup({
  activeKey,
  bookingStatus,
  loading,
  lookupId,
  onCancelBooking,
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
          <p className="eyebrow">Tra cuu</p>
          <h2>Lay hoac xoa theo ID</h2>
        </div>
      </div>

      <div className="lookup-row">
        <label className="field compact">
          <span>ID</span>
          <input min="1" onChange={onLookupIdChange} type="number" value={lookupId || ''} />
        </label>
        <button className="secondary-btn" disabled={loading} onClick={onFetchById} type="button">
          Lay du lieu
        </button>
        <button className="danger-btn" disabled={loading} onClick={onDeleteById} type="button">
          Xoa
        </button>
      </div>

      {activeKey === 'employees' && (
        <button className="wide-btn" disabled={loading} onClick={onLoadEmployees} type="button">
          Tai danh sach nhan vien
        </button>
      )}

      {activeKey === 'bookings' && (
        <form className="status-box" onSubmit={onSubmitStatus}>
          <h3>Cap nhat booking</h3>
          <div className="lookup-row">
            <label className="field compact">
              <span>ID booking</span>
              <input
                min="1"
                onChange={(event) => onStatusChange('bookingId', event.target.value)}
                type="number"
                value={bookingStatus.bookingId}
              />
            </label>
            <label className="field compact">
              <span>Trang thai</span>
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
            <button className="primary-btn" disabled={loading} type="submit">
              Cap nhat
            </button>
            <button className="danger-btn" disabled={loading} onClick={onCancelBooking} type="button">
              Huy booking
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ResourceLookup
