import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import {
  createRoom,
  createRoomPhoto,
  createRoomType,
  deleteRoom,
  deleteRoomType,
  getAmenities,
  getBookingsByRoom,
  getBranches,
  getRoomPhotos,
  getRooms,
  getRoomTypes,
  updateRoom,
  updateRoomType,
} from '../../services/roomService'
import RoomFormModal from './RoomFormModal'
import RoomTable from './RoomTable'

const PAGE_SIZE = 6
const emptyRoomTypeForm = { name: '', description: '', maxGuest: '', image: '' }

function getRoomStatus(room) {
  return room.status || room.roomStatus || 'NO_STATUS'
}

function roomMatchesStatus(room, status) {
  if (status === 'ALL') {
    return true
  }

  return getRoomStatus(room) === status
}

function formatRoomStatus(status) {
  const labels = {
    AVAILABLE: 'Dang trong',
    OCCUPIED: 'Dang thue',
    NO_STATUS: 'Chua co trang thai',
  }

  return labels[status] || status
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chua co'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatDateTime(value) {
  if (!value) {
    return 'Chua co'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || 'Chua co'}</strong>
    </div>
  )
}

function getRoomPhotoUrl(roomPhoto) {
  return roomPhoto.photo || roomPhoto.Photo || ''
}

function DetailImage({ alt, src }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="image-error-box">
        <strong>Khong tai duoc anh</strong>
        <span>{src}</span>
      </div>
    )
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} />
}

function RoomDetailModal({ booking, loadingBooking, onClose, room }) {
  const status = getRoomStatus(room)
  const isOccupied = status === 'OCCUPIED'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-detail-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">{isOccupied ? 'Booking detail' : 'Room detail'}</p>
            <h2 id="room-detail-title">Phong #{room.number}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            x
          </button>
        </div>

        {isOccupied ? (
          loadingBooking ? (
            <LoadingSpinner />
          ) : booking ? (
            <div className="detail-grid">
              <DetailItem label="Ma booking" value={`#${booking.id}`} />
              <DetailItem label="Khach hang" value={booking.customerName} />
              <DetailItem label="Trang thai booking" value={booking.currentStatus} />
              <DetailItem label="Loai phong" value={booking.roomTypeName || room.roomType?.name} />
              <DetailItem label="Check-in" value={formatDateTime(booking.checkIn)} />
              <DetailItem label="Check-out" value={formatDateTime(booking.checkOut)} />
              <DetailItem label="So khach" value={booking.guestCount} />
              <DetailItem label="Tong tien" value={formatMoney(booking.totalAmount)} />
              <DetailItem label="Da thanh toan" value={formatMoney(booking.paidAmount)} />
              <DetailItem label="Nhan vien" value={booking.employeeId ? `#${booking.employeeId}` : 'Chua gan'} />
            </div>
          ) : (
            <EmptyState
              title={`Chua tim thay booking cua phong #${room.number}`}
              description="Backend khong tra ve booking dang gan voi phong nay."
            />
          )
        ) : (
          <div className="detail-grid">
            <DetailItem label="So phong" value={`#${room.number}`} />
            <DetailItem label="Chi nhanh" value={room.branch?.name} />
            <DetailItem label="Loai phong" value={room.roomType?.name} />
            <DetailItem label="Dien tich" value={room.area ? `${room.area} m2` : ''} />
            <DetailItem label="Trang thai" value={formatRoomStatus(status)} />
            <DetailItem
              label="Tien nghi"
              value={(room.amenities || []).map((amenity) => amenity.amenityName).join(', ')}
            />
            {room.thumbnail && (
              <div className="detail-image form-wide">
                <span className="detail-section-label">Anh thumbnail</span>
                <DetailImage src={room.thumbnail} alt={`Phong ${room.number}`} />
              </div>
            )}
            {room.roomPhotos?.length > 0 && (
              <div className="form-wide">
                <span className="detail-section-label">Anh phong</span>
                <div className="room-photo-preview-grid">
                  {room.roomPhotos.map((roomPhoto) => {
                    const photoUrl = getRoomPhotoUrl(roomPhoto)
                    return (
                      <div className="room-photo-preview" key={roomPhoto.id || photoUrl}>
                        <DetailImage src={photoUrl} alt={`Anh phong ${room.number}`} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function RoomTypeModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const readOnly = mode === 'view'
  const title = mode === 'view' ? 'Chi tiet loai phong' : mode === 'edit' ? 'Sua loai phong' : 'Them loai phong'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-type-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Room type</p>
            <h2 id="room-type-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            x
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field">
            <span>Ten loai phong</span>
            <input
              disabled={readOnly}
              onChange={(event) => onUpdateField('name', event.target.value)}
              required
              value={form.name}
            />
          </label>
          <label className="field">
            <span>So khach toi da</span>
            <input
              disabled={readOnly}
              min="1"
              onChange={(event) => onUpdateField('maxGuest', event.target.value)}
              required
              type="number"
              value={form.maxGuest}
            />
          </label>
          <label className="field form-wide">
            <span>Mo ta</span>
            <input
              disabled={readOnly}
              onChange={(event) => onUpdateField('description', event.target.value)}
              value={form.description}
            />
          </label>
          <label className="field form-wide">
            <span>Image URL</span>
            <input
              disabled={readOnly}
              onChange={(event) => onUpdateField('image', event.target.value)}
              value={form.image}
            />
          </label>
          {form.image && (
            <div className="detail-image form-wide">
              <img src={form.image} alt={form.name || 'Loai phong'} />
            </div>
          )}
          <div className="modal-actions form-wide">
            <button className="secondary-btn" onClick={onClose} type="button">
              {readOnly ? 'Dong' : 'Huy'}
            </button>
            {!readOnly && (
              <button className="primary-btn" disabled={saving} type="submit">
                {saving ? 'Dang luu...' : 'Luu loai phong'}
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

function RoomPage() {
  const [rooms, setRooms] = useState([])
  const [branches, setBranches] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingRoomType, setSavingRoomType] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [statusInput, setStatusInput] = useState('ALL')
  const [filters, setFilters] = useState({ search: '', status: 'ALL' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, mode: 'create', room: null })
  const [detailModal, setDetailModal] = useState({ open: false, room: null, booking: null })
  const [roomTypeModal, setRoomTypeModal] = useState({
    open: false,
    mode: 'create',
    roomType: null,
    form: emptyRoomTypeForm,
  })

  const filteredRooms = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    return rooms.filter((room) => {
      const searchable = [
        room.number,
        room.branch?.name,
        room.roomType?.name,
        room.area,
        room.status,
        ...(room.amenities || []).map((amenity) => amenity.amenityName),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(keyword) && roomMatchesStatus(room, filters.status)
    })
  }, [rooms, filters])

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE))
  const pagedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadData = useCallback(async () => {
    setLoading(true)
    setToast(null)

    try {
      const [roomData, branchData, roomTypeData, amenityData] = await Promise.all([
        getRooms(),
        getBranches(),
        getRoomTypes(),
        getAmenities(),
      ])
      let photoData = []
      try {
        photoData = await getRoomPhotos()
      } catch {
        photoData = []
      }
      const roomsWithPhotos = roomData.map((room) => ({
        ...room,
        roomPhotos: photoData.filter((roomPhoto) => roomPhoto.room?.id === room.id),
      }))
      setRooms(roomsWithPhotos)
      setBranches(branchData)
      setRoomTypes(roomTypeData)
      setAmenities(amenityData)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc danh sach phong' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadData)
  }, [loadData])

  const openCreateModal = () => {
    setModal({ open: true, mode: 'create', room: null })
  }

  const openEditModal = (room) => {
    setModal({ open: true, mode: 'edit', room })
  }

  const closeModal = () => {
    setModal({ open: false, mode: 'create', room: null })
  }

  const openDetailModal = async (room) => {
    setDetailModal({ open: true, room, booking: null })

    if (getRoomStatus(room) !== 'OCCUPIED') {
      return
    }

    setLoadingBooking(true)
    try {
      const bookings = await getBookingsByRoom(room.id)
      const activeBooking =
        bookings.find((booking) => booking.currentStatus === 'CHECKED_IN') ||
        bookings.find((booking) => booking.currentStatus === 'CONFIRMED') ||
        bookings[0] ||
        null
      setDetailModal({ open: true, room, booking: activeBooking })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc chi tiet booking' })
    } finally {
      setLoadingBooking(false)
    }
  }

  const closeDetailModal = () => {
    setDetailModal({ open: false, room: null, booking: null })
  }

  const applySearch = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput, status: statusInput })
    setPage(1)
  }

  const submitRoom = async (payload) => {
    setSaving(true)
    setToast(null)
    const { roomPhotos = [], ...roomPayload } = payload

    try {
      let roomId = modal.room?.id
      if (modal.mode === 'edit') {
        await updateRoom(modal.room.id, roomPayload)
        setToast({ type: 'success', message: 'Da cap nhat phong' })
      } else {
        roomId = await createRoom(roomPayload)
        setToast({ type: 'success', message: 'Da them phong moi' })
      }

      if (roomId && roomPhotos.length > 0) {
        await Promise.all(roomPhotos.map((photo) => createRoomPhoto(roomId, photo)))
      }

      closeModal()
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc phong' })
    } finally {
      setSaving(false)
    }
  }

  const removeRoom = async (room) => {
    const confirmed = window.confirm(`Xoa phong #${room.number}?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setToast(null)

    try {
      await deleteRoom(room.id)
      setToast({ type: 'success', message: 'Da xoa phong' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong xoa duoc phong' })
    } finally {
      setSaving(false)
    }
  }

  const roomTypeFormFrom = (roomType) => ({
    name: roomType.name || '',
    description: roomType.description || '',
    maxGuest: roomType.maxGuest ? String(roomType.maxGuest) : '',
    image: roomType.image || '',
  })

  const openCreateRoomType = () => {
    setRoomTypeModal({ open: true, mode: 'create', roomType: null, form: emptyRoomTypeForm })
  }

  const openViewRoomType = (roomType) => {
    setRoomTypeModal({ open: true, mode: 'view', roomType, form: roomTypeFormFrom(roomType) })
  }

  const openEditRoomType = (roomType) => {
    setRoomTypeModal({ open: true, mode: 'edit', roomType, form: roomTypeFormFrom(roomType) })
  }

  const closeRoomTypeModal = () => {
    setRoomTypeModal({ open: false, mode: 'create', roomType: null, form: emptyRoomTypeForm })
  }

  const updateRoomTypeField = (field, value) => {
    setRoomTypeModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const submitRoomType = async (event) => {
    event.preventDefault()
    setSavingRoomType(true)
    setToast(null)

    const payload = {
      ...roomTypeModal.form,
      maxGuest: Number(roomTypeModal.form.maxGuest),
    }

    try {
      if (roomTypeModal.mode === 'edit') {
        await updateRoomType(roomTypeModal.roomType.id, payload)
        setToast({ type: 'success', message: 'Da cap nhat loai phong' })
      } else {
        await createRoomType(payload)
        setToast({ type: 'success', message: 'Da them loai phong' })
      }
      closeRoomTypeModal()
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc loai phong' })
    } finally {
      setSavingRoomType(false)
    }
  }

  const removeRoomType = async (roomType) => {
    const confirmed = window.confirm(`Xoa loai phong ${roomType.name}?`)
    if (!confirmed) {
      return
    }

    setSavingRoomType(true)
    setToast(null)

    try {
      await deleteRoomType(roomType.id)
      setToast({ type: 'success', message: 'Da xoa loai phong' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong xoa duoc loai phong' })
    } finally {
      setSavingRoomType(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">QUAN LY PHONG</p>
          <h1>Phong</h1>
        </div>
        <button className="primary-btn" onClick={openCreateModal} type="button">
          Them phong
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="So luong phong" value={rooms.length} />
        <StatCard label="Chi nhanh" value={branches.length} tone="mint" />
        <StatCard label="Loai phong" value={roomTypes.length} tone="cream" />
      </div>

      <section className="panel">
        <form className="room-toolbar" onSubmit={applySearch}>
          <label className="field">
            <span>Tim kiem phong</span>
            <input onChange={(event) => setSearchInput(event.target.value)} placeholder="So phong..." value={searchInput} />
          </label>
          <label className="field">
            <span>Trang thai</span>
            <select onChange={(event) => setStatusInput(event.target.value)} value={statusInput}>
              <option value="ALL">Tat ca</option>
              <option value="AVAILABLE">Dang trong</option>
              <option value="OCCUPIED">Dang thue</option>
            </select>
          </label>
          <div className="room-toolbar-action">
            <button className="primary-btn" type="submit">
              Tim kiem
            </button>
          </div>
        </form>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <RoomTable
            rooms={pagedRooms}
            loading={loading}
            onDelete={removeRoom}
            onEdit={openEditModal}
            onView={openDetailModal}
          />
        )}

        <div className="pagination-bar">
          <span>
            Hien thi {pagedRooms.length} / {filteredRooms.length} phong
          </span>
          <div className="pagination-actions">
            <button
              className="secondary-btn compact-btn"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Truoc
            </button>
            <strong>
              {page} / {totalPages}
            </strong>
            <button
              className="secondary-btn compact-btn"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              Sau
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">QUAN LY LOAI PHONG</p>
            <h2>Danh sach loai phong</h2>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : roomTypes.length === 0 ? (
          <EmptyState title="Chua co loai phong" description="Hay them loai phong dau tien." />
        ) : (
          <div className="table-wrap">
            <table className="data-table room-type-table">
              <thead>
                <tr>
                  <th>Loai phong</th>
                  <th>So khach</th>
                  <th>Mo ta</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>
                      <strong>{roomType.name}</strong>
                    </td>
                    <td>{roomType.maxGuest}</td>
                    <td>{roomType.description || 'Chua co'}</td>
                    <td>
                      <div className="table-actions">
                        <button className="secondary-btn compact-btn" onClick={() => openViewRoomType(roomType)} type="button">
                          Xem
                        </button>
                        <button className="ghost-btn compact-btn" onClick={() => openEditRoomType(roomType)} type="button">
                          Sua
                        </button>
                        <button
                          className="danger-btn compact-btn"
                          disabled={savingRoomType}
                          onClick={() => removeRoomType(roomType)}
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
        )}

        <div className="panel-footer">
          <button className="primary-btn" onClick={openCreateRoomType} type="button">
            Them loai phong
          </button>
        </div>
      </section>

      {modal.open && (
        <RoomFormModal
          branches={branches}
          amenities={amenities}
          mode={modal.mode}
          onClose={closeModal}
          onSubmit={submitRoom}
          room={modal.room}
          roomTypes={roomTypes}
          saving={saving}
        />
      )}

      {detailModal.open && detailModal.room && (
        <RoomDetailModal
          booking={detailModal.booking}
          loadingBooking={loadingBooking}
          onClose={closeDetailModal}
          room={detailModal.room}
        />
      )}

      {roomTypeModal.open && (
        <RoomTypeModal
          form={roomTypeModal.form}
          mode={roomTypeModal.mode}
          onClose={closeRoomTypeModal}
          onSubmit={submitRoomType}
          onUpdateField={updateRoomTypeField}
          saving={savingRoomType}
        />
      )}
    </section>
  )
}

export default RoomPage
