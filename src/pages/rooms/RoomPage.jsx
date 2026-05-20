import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import AppIcon from '../../components/AppIcon'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import {
  createRoom,
  createRoomPhoto,
  createRoomPricing,
  createRoomType,
  deleteRoom,
  deleteRoomType,
  getAmenities,
  getBookingsByRoom,
  getBranches,
  getRoomPhotos,
  getRoomPricings,
  getRooms,
  getRoomTypes,
  updateRoom,
  updateRoomPricing,
  updateRoomType,
} from '../../services/roomService'
import { uploadImage } from '../../services/uploadService'
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

function formatDate(value) {
  if (!value) {
    return 'Chua co'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
  }).format(new Date(value))
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

function StatusBadge({ status }) {
  return (
    <span className={`room-status-badge ${status.toLowerCase()}`}>
      <AppIcon name={status === 'AVAILABLE' ? 'check' : 'calendar'} />
      {formatRoomStatus(status)}
    </span>
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

function getRoomPricing(room, roomPricings) {
  const roomTypeId = room.roomType?.id
  if (!roomTypeId) {
    return null
  }

  return roomPricings
    .filter((pricing) => pricing.roomType?.id === roomTypeId)
    .sort((first, second) => {
      const firstActive = first.status ? 1 : 0
      const secondActive = second.status ? 1 : 0
      if (firstActive !== secondActive) {
        return secondActive - firstActive
      }

      return new Date(second.startDate || 0) - new Date(first.startDate || 0)
    })[0] || null
}

function RoomImages({ room }) {
  const latestPhotos = (room.roomPhotos || [])
    .slice()
    .sort((first, second) => (second.id || 0) - (first.id || 0))
    .slice(0, 5)

  return (
    <>
      {room.thumbnail ? (
        <div className="detail-image form-wide">
          <span className="detail-section-label">Anh thumbnail</span>
          <DetailImage src={room.thumbnail} alt={`Phong ${room.number}`} />
        </div>
      ) : (
        <DetailItem label="Anh thumbnail" value="Chua co" />
      )}
      {latestPhotos.length > 0 ? (
        <div className="form-wide">
          <span className="detail-section-label">Anh phong</span>
          <div className="room-photo-strip">
            {latestPhotos.map((roomPhoto) => {
              const photoUrl = getRoomPhotoUrl(roomPhoto)
              return (
                <div className="room-photo-preview" key={roomPhoto.id || photoUrl}>
                  <DetailImage src={photoUrl} alt={`Anh phong ${room.number}`} />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <DetailItem label="Anh phong" value="Chua co" />
      )}
    </>
  )
}

function RoomInfoGrid({ pricing, room }) {
  return (
    <div className="detail-list">
      <DetailItem label="Chi nhanh" value={room.branch?.name} />
      <DetailItem label="Mo ta" value={room.roomType?.description} />
      <DetailItem label="Loai phong" value={room.roomType?.name} />
      <DetailItem label="Dien tich" value={room.area ? `${room.area} m2` : ''} />
      <DetailItem label="Gia co ban / qua dem" value={formatMoney(pricing?.basePrice)} />
      <DetailItem label="Gia cuoi tuan" value={formatMoney(pricing?.weekendPrice)} />
      <DetailItem label="Gia ngay le" value={formatMoney(pricing?.holidayPrice)} />
      <DetailItem label="Bat dau ap dung" value={formatDate(pricing?.startDate)} />
      <DetailItem label="Ket thuc" value={formatDate(pricing?.endDate)} />
      <RoomImages room={room} />
    </div>
  )
}

function amenityIconName(name = '') {
  const value = name.toLowerCase()
  if (value.includes('wifi')) return 'wifi'
  if (value.includes('dieu hoa') || value.includes('may lanh')) return 'snowflake'
  if (value.includes('tv') || value.includes('tivi')) return 'tv'
  if (value.includes('xe') || value.includes('parking')) return 'car'
  if (value.includes('bep') || value.includes('an')) return 'utensils'
  if (value.includes('tam') || value.includes('bath')) return 'bath'
  if (value.includes('cafe') || value.includes('coffee')) return 'coffee'
  return 'sparkles'
}

function AmenityTable({ amenities, editing, form, onToggle, roomAmenities }) {
  const selectedIds = new Set((roomAmenities || []).map((amenity) => amenity.amenityId))
  const visibleAmenities = editing
    ? amenities
    : amenities.length > 0
      ? amenities.filter((amenity) => selectedIds.has(amenity.id))
      : (roomAmenities || []).map((amenity) => ({
          id: amenity.amenityId,
          name: amenity.amenityName,
        }))

  if (visibleAmenities.length === 0) {
    return <EmptyState title="Chua co tien nghi" description="Phong nay chua duoc gan tien nghi." />
  }

  return (
    <div className="amenity-detail-table">
      {visibleAmenities.map((amenity) => {
        const checked = editing
          ? Object.prototype.hasOwnProperty.call(form, amenity.id)
          : selectedIds.has(amenity.id)

        return (
          <label className="amenity-detail-row" key={amenity.id}>
            <span className="amenity-detail-icon">
              <AppIcon name={amenityIconName(amenity.name)} />
            </span>
            <span>{amenity.name}</span>
            {editing && (
              <input
                checked={checked}
                onChange={(event) => onToggle(amenity.id, event.target.checked)}
                type="checkbox"
              />
            )}
          </label>
        )
      })}
    </div>
  )
}

function RoomDetailModal({
  amenities,
  booking,
  loadingBooking,
  onClose,
  onEdit,
  onSaveAmenities,
  pricing,
  room,
  savingAmenities,
}) {
  const status = getRoomStatus(room)
  const isOccupied = status === 'OCCUPIED'
  const [editingAmenities, setEditingAmenities] = useState(false)
  const [amenityForm, setAmenityForm] = useState(() =>
    Object.fromEntries((room.amenities || []).map((item) => [item.amenityId, String(item.quantity || 1)])),
  )

  const toggleAmenity = (amenityId, checked) => {
    setAmenityForm((current) => {
      const next = { ...current }
      if (checked) {
        next[amenityId] = next[amenityId] || '1'
      } else {
        delete next[amenityId]
      }
      return next
    })
  }

  const saveAmenities = async () => {
    await onSaveAmenities(room, amenityForm)
    setEditingAmenities(false)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="room-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">{isOccupied ? 'Booking detail' : 'Room detail'}</p>
            <h2 id="room-detail-title">Thong tin chi tiet phong so {room.number}</h2>
          </div>
          <StatusBadge status={status} />
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        {isOccupied ? (
          loadingBooking ? (
            <LoadingSpinner />
          ) : booking ? (
            <>
              <RoomInfoGrid pricing={pricing} room={room} />
              <div className="detail-list detail-list-spaced">
                <DetailItem label="Ma booking" value={`#${booking.id}`} />
                <DetailItem label="Khach hang" value={booking.customerName} />
                <DetailItem label="Trang thai booking" value={booking.currentStatus} />
                <DetailItem label="Check-in" value={formatDateTime(booking.checkIn)} />
                <DetailItem label="Check-out" value={formatDateTime(booking.checkOut)} />
                <DetailItem label="So khach" value={booking.guestCount} />
                <DetailItem label="Tong tien" value={formatMoney(booking.totalAmount)} />
                <DetailItem label="Da thanh toan" value={formatMoney(booking.paidAmount)} />
                <DetailItem label="Nhan vien" value={booking.employeeId ? `#${booking.employeeId}` : 'Chua gan'} />
              </div>
            </>
          ) : (
            <EmptyState
              title={`Chua tim thay booking cua phong #${room.number}`}
              description="Backend khong tra ve booking dang gan voi phong nay."
            />
          )
        ) : (
          <RoomInfoGrid pricing={pricing} room={room} />
        )}

        <section className="amenity-detail-section">
          <div className="section-head compact-section-head">
            <div>
              <p className="eyebrow">Tien nghi</p>
              <h2>Tien nghi trong phong</h2>
            </div>
            {editingAmenities ? (
              <div className="table-actions">
                <button className="cancel-btn compact-btn" onClick={() => setEditingAmenities(false)} type="button">
                  <AppIcon name="close" />
                  Huy
                </button>
                <button className="save-btn compact-btn" disabled={savingAmenities} onClick={saveAmenities} type="button">
                  <AppIcon name="save" />
                  {savingAmenities ? 'Dang luu...' : 'Luu'}
                </button>
              </div>
            ) : (
              <button className="blue-btn compact-btn" onClick={() => setEditingAmenities(true)} type="button">
                <AppIcon name="edit" />
                Chinh sua tien nghi
              </button>
            )}
          </div>
          <AmenityTable
            amenities={amenities}
            editing={editingAmenities}
            form={amenityForm}
            onToggle={toggleAmenity}
            roomAmenities={room.amenities}
          />
        </section>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="blue-btn" onClick={onEdit} type="button">
            <AppIcon name="edit" />
            Chinh sua
          </button>
        </div>
      </section>
    </div>
  )
}

function RoomTypeModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const readOnly = mode === 'view'
  const title = mode === 'view' ? 'Chi tiet loai phong' : mode === 'edit' ? 'Sua loai phong' : 'Them loai phong'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'room-types')
      onUpdateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Khong the upload anh loai phong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-type-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Room type</p>
            <h2 id="room-type-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
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
          {!readOnly && (
            <label className="field form-wide">
              <span>Anh loai phong</span>
              <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
              {uploading && <small className="helper-text">Dang upload anh...</small>}
              {uploadError && <small className="error-text">{uploadError}</small>}
            </label>
          )}
          {form.image && (
            <div className="detail-image form-wide">
              <img src={form.image} alt={form.name || 'Loai phong'} />
            </div>
          )}
          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              {readOnly ? 'Dong' : 'Huy'}
            </button>
            {!readOnly && (
              <button className="save-btn" disabled={saving || uploading} type="submit">
                <AppIcon name="save" />
                {saving ? 'Dang luu...' : 'Luu loai phong'}
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

function RoomPage({ auth }) {
  const [rooms, setRooms] = useState([])
  const [branches, setBranches] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [roomPricings, setRoomPricings] = useState([])
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingRoomType, setSavingRoomType] = useState(false)
  const [savingAmenities, setSavingAmenities] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(false)
  const [toast, setToast] = useState(null)
  const isAdmin = auth?.role === 'ADMIN'
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
      const [roomData, branchData, roomTypeData, amenityData, pricingData] = await Promise.all([
        getRooms(),
        getBranches(),
        getRoomTypes(),
        getAmenities(),
        getRoomPricings(),
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
      setRoomPricings(pricingData)
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

  const openEditFromDetail = () => {
    const room = detailModal.room
    closeDetailModal()
    if (room) {
      openEditModal(room)
    }
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
    const { pricing, roomPhotos = [], ...roomPayload } = payload

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

      if (pricing?.enabled) {
        const selectedRoomTypeId = Number(roomPayload.roomTypeId)
        const pricingPayload = {
          roomType: { id: selectedRoomTypeId },
          baseDuration: pricing.baseDuration,
          basePrice: Number(pricing.basePrice),
          weekendPrice: Number(pricing.weekendPrice),
          holidayPrice: Number(pricing.holidayPrice),
          startDate: pricing.startDate,
          endDate: pricing.endDate || null,
          policy: pricing.policy,
          status: pricing.status,
        }
        const currentPricing = pricing.id
          ? pricing
          : getRoomPricing({ roomType: { id: selectedRoomTypeId } }, roomPricings)

        if (currentPricing?.id) {
          await updateRoomPricing(currentPricing.id, pricingPayload)
        } else {
          await createRoomPricing(pricingPayload)
        }
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

  const toggleRoomStatus = async (room) => {
    setSaving(true)
    setToast(null)
    const nextStatus = getRoomStatus(room) === 'OCCUPIED' ? 'AVAILABLE' : 'OCCUPIED'
    try {
      await updateRoom(room.id, { status: nextStatus })
      setToast({ type: 'success', message: 'Cap nhat du lieu thanh cong' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong cap nhat duoc trang thai phong' })
    } finally {
      setSaving(false)
    }
  }

  const saveRoomAmenities = async (room, amenityForm) => {
    setSavingAmenities(true)
    setToast(null)

    const amenitiesPayload = Object.entries(amenityForm).map(([amenityId, quantity]) => ({
      amenityId: Number(amenityId),
      quantity: Number(quantity) || 1,
    }))

    const payload = {
      branchId: room.branch?.id,
      roomTypeId: room.roomType?.id,
      number: room.number,
      area: room.area,
      thumbnail: room.thumbnail || '',
      status: getRoomStatus(room),
      amenities: amenitiesPayload,
    }

    try {
      await updateRoom(room.id, payload)
      const nextAmenities = amenitiesPayload.map((item) => {
        const amenity = amenities.find((current) => current.id === item.amenityId)
        return {
          ...item,
          amenityName: amenity?.name || `Tien nghi #${item.amenityId}`,
        }
      })
      const nextRoom = { ...room, amenities: nextAmenities }
      setDetailModal((current) => ({ ...current, room: nextRoom }))
      setToast({ type: 'success', message: 'Da cap nhat tien nghi phong' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc tien nghi phong' })
    } finally {
      setSavingAmenities(false)
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
      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="So luong phong" value={rooms.length} />
        <StatCard label="Chi nhanh" value={branches.length} tone="mint" />
        <StatCard label="Loai phong" value={roomTypes.length} tone="cream" />
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">DANH SACH PHONG</p>
            <h2>Danh sach phong</h2>
          </div>
          {isAdmin && (
            <div className="table-actions">
              <button className="blue-btn" onClick={openCreateModal} type="button">
                <AppIcon name="plus" />
                Them phong
              </button>
            </div>
          )}
        </div>

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
            <button className="blue-btn" type="submit">
              <AppIcon name="search" />
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
            onDelete={isAdmin ? removeRoom : null}
            onEdit={isAdmin ? openEditModal : null}
            onStatusChange={toggleRoomStatus}
            onView={openDetailModal}
          />
        )}

        <div className="pagination-bar">
          <span>
            Hien thi {pagedRooms.length} / {filteredRooms.length} phong
          </span>
          <div className="pagination-actions">
            <button
              className="cancel-btn compact-btn"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              <AppIcon name="chevronLeft" />
              Truoc
            </button>
            <strong>
              {page} / {totalPages}
            </strong>
            <button
              className="cancel-btn compact-btn"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              <AppIcon name="chevronRight" />
              Sau
            </button>
          </div>
        </div>
      </section>

      {isAdmin && <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">QUAN LY LOAI PHONG</p>
            <h2>Danh sach loai phong</h2>
          </div>
          <button className="blue-btn" onClick={openCreateRoomType} type="button">
            <AppIcon name="plus" />
            Them loai phong
          </button>
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
                        <button className="view-btn compact-btn" onClick={() => openViewRoomType(roomType)} type="button">
                          <AppIcon name="eye" />
                          Xem
                        </button>
                        <button className="edit-btn compact-btn" onClick={() => openEditRoomType(roomType)} type="button">
                          <AppIcon name="edit" />
                          Sua
                        </button>
                        <button
                          className="danger-btn compact-btn"
                          disabled={savingRoomType}
                          onClick={() => removeRoomType(roomType)}
                          type="button"
                        >
                          <AppIcon name="trash" />
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
      </section>}

      {modal.open && (
        <RoomFormModal
          branches={branches}
          amenities={amenities}
          mode={modal.mode}
          onClose={closeModal}
          onSubmit={submitRoom}
          pricing={getRoomPricing(modal.room || { roomType: null }, roomPricings)}
          room={modal.room}
          roomTypes={roomTypes}
          saving={saving}
        />
      )}

      {detailModal.open && detailModal.room && (
        <RoomDetailModal
          amenities={amenities}
          booking={detailModal.booking}
          loadingBooking={loadingBooking}
          onClose={closeDetailModal}
          onEdit={openEditFromDetail}
          onSaveAmenities={saveRoomAmenities}
          pricing={getRoomPricing(detailModal.room, roomPricings)}
          room={detailModal.room}
          savingAmenities={savingAmenities}
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
