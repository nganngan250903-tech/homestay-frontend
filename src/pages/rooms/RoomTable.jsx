import EmptyState from '../../components/EmptyState'

function getRoomStatus(room) {
  return room.status || room.roomStatus || 'NO_STATUS'
}

function formatStatus(status) {
  const labels = {
    AVAILABLE: 'Còn trống',
    OCCUPIED: 'Đang thuê',
    NO_STATUS: 'Chưa có trạng thái',
  }

  return labels[status] || status
}

function RoomTable({ rooms, loading, onEdit, onDelete }) {
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
            <th> Số phòng</th>
            <th>Chi nhánh</th>
            <th>Loại phòng</th>
            <th>Diện tích</th>
            <th>Trạng thái</th>
            <th>Tiện nghi</th>
            <th>Hình ảnh</th>
            <th>Thao tác</th>
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
                  <span className="muted-text">Chưa có ảnh</span>
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
