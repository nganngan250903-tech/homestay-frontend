import EmptyState from '../../components/EmptyState'

function getRoomStatus(room) {
  return room.status || room.roomStatus || 'NO_STATUS'
}

function formatStatus(status) {
  const labels = {
    AVAILABLE: 'Con trong',
    OCCUPIED: 'Dang thue',
    NO_STATUS: 'Chua co trang thai',
  }

  return labels[status] || status
}

function RoomTable({ rooms, loading, onEdit, onDelete }) {
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
            <th>Phong</th>
            <th>Chi nhanh</th>
            <th>Loai phong</th>
            <th>Dien tich</th>
            <th>Trang thai</th>
            <th>Tien nghi</th>
            <th>Hinh anh</th>
            <th>Thao tac</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>
                <strong>#{room.number}</strong>
                <span className="cell-subtext">ID {room.id}</span>
              </td>
              <td>{room.branch?.name || 'Chua gan'}</td>
              <td>{room.roomType?.name || 'Chua gan'}</td>
              <td>{room.area ? `${room.area} m2` : 'Chua co'}</td>
              <td>
                <span className={`status-pill ${getRoomStatus(room).toLowerCase()}`}>
                  {formatStatus(getRoomStatus(room))}
                </span>
              </td>
              <td>
                <span className="cell-subtext">
                  {(room.amenities || []).map((amenity) => amenity.amenityName).join(', ') ||
                    'Chua gan'}
                </span>
              </td>
              <td>
                {room.thumbnail ? (
                  <img className="room-thumb" src={room.thumbnail} alt={`Phong ${room.number}`} />
                ) : (
                  <span className="muted-text">Chua co anh</span>
                )}
              </td>
              <td>
                <div className="table-actions">
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
