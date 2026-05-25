import EmptyState from '../../../components/EmptyState'
import AppIcon from '../../../components/AppIcon'

const roomStatusOptions = ['AVAILABLE', 'WAITING_CHECKIN', 'OCCUPIED', 'CLEANING', 'MAINTENANCE']

function getRoomStatus(room) {
  return room.status || room.roomStatus || 'NO_STATUS'
}

function formatStatus(status) {
  const labels = {
    AVAILABLE: 'Trống',
    WAITING_CHECKIN: 'Chờ nhận phòng',
    OCCUPIED: 'Đang ở',
    CLEANING: 'Cần dọn phòng',
    MAINTENANCE: 'Bảo trì',
    NO_STATUS: 'Chưa có trạng thái',
  }

  return labels[status] || status
}

function RoomTable({ rooms, loading, onDelete, onEdit, onStatusChange, onView }) {
  if (!loading && rooms.length === 0) {
    return (
      <EmptyState
        title="Không có phòng"
        description="Không tìm thấy phòng phù hợp với điều kiện hiện tại."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên phòng</th>
            <th>Chi nhánh</th>
            <th>Loại phòng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>
                <strong>{room.name}</strong>
              </td>
              <td>{room.branch?.name || 'Chưa gắn'}</td>
              <td>{room.roomType?.name || 'Chưa gắn'}</td>
              <td>
                <select
                  className={`booking-status-select ${getRoomStatus(room).toLowerCase()}`}
                  disabled={!onStatusChange}
                  onChange={(event) => onStatusChange?.(room, event.target.value)}
                  value={getRoomStatus(room)}
                >
                  {roomStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div className="table-actions">
                  <button className="view-btn compact-btn" onClick={() => onView(room)} type="button">
                    <AppIcon name="eye" />
                    Xem
                  </button>
                  {onEdit && (
                    <button className="edit-btn compact-btn" onClick={() => onEdit(room)} type="button">
                      <AppIcon name="edit" />
                      Sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="danger-btn compact-btn"
                      onClick={() => onDelete(room)}
                      type="button"
                    >
                      <AppIcon name="trash" />
                      Xóa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RoomTable
