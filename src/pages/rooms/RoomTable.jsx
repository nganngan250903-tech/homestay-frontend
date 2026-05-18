import EmptyState from '../../components/EmptyState'

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

function RoomTable({ rooms, loading, onDelete, onEdit, onView }) {
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
            <th>So phong</th>
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
                <strong>#{room.number}</strong>
              </td>
              <td>{room.branch?.name || 'Chua gan'}</td>
              <td>{room.roomType?.name || 'Chua gan'}</td>
              <td>
                <span className={`status-pill ${getRoomStatus(room).toLowerCase()}`}>
                  {formatStatus(getRoomStatus(room))}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button className="secondary-btn compact-btn" onClick={() => onView(room)} type="button">
                    Xem
                  </button>
                  <button className="ghost-btn compact-btn" onClick={() => onEdit(room)} type="button">
                    Sua
                  </button>
                  <button
                    className="danger-btn compact-btn"
                    onClick={() => onDelete(room)}
                    type="button"
                  >
                    Xoa
                  </button>
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
