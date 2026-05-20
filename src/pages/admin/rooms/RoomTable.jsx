import EmptyState from '../../../components/EmptyState'
import AppIcon from '../../../components/AppIcon'

function getRoomStatus(room) {
  return room.status || room.roomStatus || 'NO_STATUS'
}

function formatStatus(status) {
  const labels = {
    AVAILABLE: 'Dang trong',
    OCCUPIED: 'Dang thue',
    NO_STATUS: 'Chua co trang thai',
  }

  return labels[status] || status
}

function RoomTable({ rooms, loading, onDelete, onEdit, onStatusChange, onView }) {
  if (!loading && rooms.length === 0) {
    return (
      <EmptyState
        title="Khong co phong"
        description="Khong tim thay phong phu hop voi dieu kien hien tai."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ten phong</th>
            <th>Chi nhanh</th>
            <th>Loai phong</th>
            <th>Trang thai</th>
            <th>Thao tac</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>
                <strong>{room.name}</strong>
              </td>
              <td>{room.branch?.name || 'Chua gan'}</td>
              <td>{room.roomType?.name || 'Chua gan'}</td>
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
                      Sua
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="danger-btn compact-btn"
                      onClick={() => onDelete(room)}
                      type="button"
                    >
                      <AppIcon name="trash" />
                      Xoa
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
