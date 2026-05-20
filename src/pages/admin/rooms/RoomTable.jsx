import EmptyState from '../../../components/EmptyState'
import AppIcon from '../../../components/AppIcon'

function getRoomStatus(room) {
  return room.status || room.roomStatus || 'NO_STATUS'
}

function formatStatus(status) {
  const labels = {
    AVAILABLE: 'Đang trống',
    OCCUPIED: 'Đang thuê',
    NO_STATUS: 'Chưa có trang thai',
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
                <button
                  className={`status-action-pill ${getRoomStatus(room) === 'OCCUPIED' ? 'locked' : 'active'}`}
                  disabled={!onStatusChange}
                  onClick={() => onStatusChange?.(room)}
                  type="button"
                >
                  <AppIcon name={getRoomStatus(room) === 'OCCUPIED' ? 'unlock' : 'lock'} />
                  {formatStatus(getRoomStatus(room))}
                </button>
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
