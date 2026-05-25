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
    AVAILABLE: 'Trống',
    WAITING_CHECKIN: 'Chờ nhận phòng',
    OCCUPIED: 'Đang ở',
    CLEANING: 'Cần dọn phòng',
    MAINTENANCE: 'Bảo trì',
    NO_STATUS: 'Chưa có trang thai',
  }

  return labels[status] || status
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa có'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatDate(value) {
  if (!value) {
    return 'Chưa có'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
  }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value) {
    return 'Chưa có'
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
      <strong>{value || 'Chưa có'}</strong>
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
        <strong>Không tải được ảnh</strong>
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
          <DetailImage src={room.thumbnail} alt={`Phòng ${room.number}`} />
        </div>
      ) : (
        <DetailItem label="Anh thumbnail" value="Chưa có" />
      )}
      {latestPhotos.length > 0 ? (
        <div className="form-wide">
          <span className="detail-section-label">Ảnh phòng</span>
          <div className="room-photo-strip">
            {latestPhotos.map((roomPhoto) => {
              const photoUrl = getRoomPhotoUrl(roomPhoto)
              return (
                <div className="room-photo-preview" key={roomPhoto.id || photoUrl}>
                  <DetailImage src={photoUrl} alt={`Ảnh phòng ${room.number}`} />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <DetailItem label="Ảnh phòng" value="Chưa có" />
      )}
    </>
  )
}

function RoomInfoGrid({ pricing, room }) {
  return (
    <div className="detail-list">
      <DetailItem label="Chi nhánh" value={room.branch?.name} />
      <DetailItem label="Mô tả" value={room.roomType?.description} />
      <DetailItem label="Loại phòng" value={room.roomType?.name} />
      <DetailItem label="Diện tích" value={room.area ? `${room.area} m2` : ''} />
      <DetailItem label="Giá cơ bản / qua đêm" value={formatMoney(pricing?.basePrice)} />
      <DetailItem label="Giá cuối tuần" value={formatMoney(pricing?.weekendPrice)} />
      <DetailItem label="Giá ngày lễ" value={formatMoney(pricing?.holidayPrice)} />
      <DetailItem label="Bắt đầu áp dụng" value={formatDate(pricing?.startDate)} />
      <DetailItem label="Kết thúc" value={formatDate(pricing?.endDate)} />
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
    return <EmptyState title="Chưa có tiện nghi" description="Phòng này chưa được gắn tiện nghi." />
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
  const showsBooking = status === 'OCCUPIED' || status === 'WAITING_CHECKIN'
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
            <h2 id="room-detail-title">Thông tin chi tiết phòng so {room.number}</h2>
          </div>
          <StatusBadge status={status} />
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        {showsBooking ? (
          loadingBooking ? (
            <LoadingSpinner />
          ) : booking ? (
            <>
              <RoomInfoGrid pricing={pricing} room={room} />
              <div className="detail-list detail-list-spaced">                <DetailItem label="Khách hàng" value={booking.customerName} />
                <DetailItem label="Trạng thái booking" value={booking.currentStatus} />
                <DetailItem label="Check-in" value={formatDateTime(booking.checkIn)} />
                <DetailItem label="Check-out" value={formatDateTime(booking.checkOut)} />
                <DetailItem label="Số khách" value={booking.guestCount} />
                <DetailItem label="Tong tien" value={formatMoney(booking.totalAmount)} />
                <DetailItem label="Đã thanh toán" value={formatMoney(booking.paidAmount)} />
                <DetailItem label="Nhân viên" value={booking.employeeName || 'Chưa gắn'} />
              </div>
            </>
          ) : (
            <EmptyState
              title={`Chưa tìm thấy booking của phòng ${room.name || room.number}`}
              description="Backend không trả về booking đang gắn với phòng này."
            />
          )
        ) : (
          <RoomInfoGrid pricing={pricing} room={room} />
        )}

        <section className="amenity-detail-section">
          <div className="section-head compact-section-head">
            <div>
              <h2>Tiện nghi trong phòng</h2>
            </div>
            {editingAmenities ? (
              <div className="table-actions">
                <button className="cancel-btn compact-btn" onClick={() => setEditingAmenities(false)} type="button">
                  <AppIcon name="close" />
                  Hủy
                </button>
                <button className="save-btn compact-btn" disabled={savingAmenities} onClick={saveAmenities} type="button">
                  <AppIcon name="save" />
                  {savingAmenities ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            ) : (
              <button className="blue-btn compact-btn" onClick={() => setEditingAmenities(true)} type="button">
                <AppIcon name="edit" />
                Chỉnh sửa tiện nghi
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
            Đóng
          </button>
          <button className="blue-btn" onClick={onEdit} type="button">
            <AppIcon name="edit" />
            Chỉnh sửa
          </button>
        </div>
      </section>
    </div>
  )
}

function RoomTypeModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const readOnly = mode === 'view'
  const title = mode === 'view' ? 'Chi tiết loại phòng' : mode === 'edit' ? 'Sửa loại phòng' : 'Thêm loại phòng'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-type-title">
        <div className="modal-head">
          <div>
            <h2 id="room-type-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field">
            <span>Tên loại phòng</span>
            <input
              disabled={readOnly}
              onChange={(event) => onUpdateField('name', event.target.value)}
              required
              value={form.name}
            />
          </label>
          <label className="field">
            <span>Số khách tối đa</span>
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
            <span>Mô tả</span>
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
              <img src={form.image} alt={form.name || 'Loại phòng'} />
            </div>
          )}
          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              {readOnly ? 'Đóng' : 'Hủy'}
            </button>
            {!readOnly && (
              <button className="save-btn" disabled={saving} type="submit">
                <AppIcon name="save" />
                {saving ? 'Đang lưu...' : 'Lưu loại phòng'}
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
  const [roomPricings, setRoomPricings] = useState([])
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingRoomType, setSavingRoomType] = useState(false)
  const [savingAmenities, setSavingAmenities] = useState(false)
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
      setToast({ type: 'error', message: error.message || 'Không tải được danh sách phòng' })
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

    if (!['OCCUPIED', 'WAITING_CHECKIN'].includes(getRoomStatus(room))) {
      return
    }

    setLoadingBooking(true)
    try {
      const bookings = await getBookingsByRoom(room.id)
      const activeBooking =
        bookings.find((booking) => booking.currentStatus === 'CONFIRMED' && booking.actualCheckInAt && !booking.actualCheckOutAt) ||
        bookings.find((booking) => booking.currentStatus === 'CONFIRMED') ||
        bookings[0] ||
        null
      setDetailModal({ open: true, room, booking: activeBooking })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được chi tiết booking' })
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
        setToast({ type: 'success', message: 'Đã cập nhật phòng' })
      } else {
        roomId = await createRoom(roomPayload)
        setToast({ type: 'success', message: 'Đã thêm phòng mới' })
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
      setToast({ type: 'error', message: error.message || 'Không lưu được phòng' })
    } finally {
      setSaving(false)
    }
  }

  const removeRoom = async (room) => {
    const confirmed = window.confirm(`Xóa phòng ${room.name || room.number}?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setToast(null)

    try {
      await deleteRoom(room.id)
      setToast({ type: 'success', message: 'Đã xóa phòng' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không xóa được phòng' })
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
          amenityName: amenity?.name || 'Tiện nghi',
        }
      })
      const nextRoom = { ...room, amenities: nextAmenities }
      setDetailModal((current) => ({ ...current, room: nextRoom }))
      setToast({ type: 'success', message: 'Đã cập nhật tiện nghi phòng' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không lưu được tiện nghi phòng' })
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
        setToast({ type: 'success', message: 'Đã cập nhật loại phòng' })
      } else {
        await createRoomType(payload)
        setToast({ type: 'success', message: 'Đã thêm loại phòng' })
      }
      closeRoomTypeModal()
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không lưu được loại phòng' })
    } finally {
      setSavingRoomType(false)
    }
  }

  const removeRoomType = async (roomType) => {
    const confirmed = window.confirm(`Xóa loại phòng ${roomType.name}?`)
    if (!confirmed) {
      return
    }

    setSavingRoomType(true)
    setToast(null)

    try {
      await deleteRoomType(roomType.id)
      setToast({ type: 'success', message: 'Đã xóa loại phòng' })
      await loadData()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không xóa được loại phòng' })
    } finally {
      setSavingRoomType(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        
        <button className="blue-btn" onClick={openCreateModal} type="button">
          <AppIcon name="plus" />
          Thêm phòng
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Số lượng phòng" value={rooms.length} />
        <StatCard label="Chi nhánh" value={branches.length} tone="mint" />
        <StatCard label="Loại phòng" value={roomTypes.length} tone="cream" />
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            
          </div>
        </div>

        <form className="room-toolbar" onSubmit={applySearch}>
          <label className="field">
            <span>Tìm kiếm phòng</span>
            <input onChange={(event) => setSearchInput(event.target.value)} placeholder="Số phòng..." value={searchInput} />
          </label>
          <label className="field">
            <span>Trạng thái</span>
            <select onChange={(event) => setStatusInput(event.target.value)} value={statusInput}>
              <option value="ALL">Tat ca</option>
              <option value="AVAILABLE">Trống</option>
              <option value="WAITING_CHECKIN">Chờ nhận phòng</option>
              <option value="OCCUPIED">Đang ở</option>
              <option value="CLEANING">Cần dọn phòng</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </label>
          <div className="room-toolbar-action">
            <button className="blue-btn" type="submit">
              <AppIcon name="search" />
              Tìm kiếm
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
            Hiển thị {pagedRooms.length} / {filteredRooms.length} phòng
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

      <section className="panel">
        <div className="section-head">
          <div>
            <h2>Danh sách loại phòng</h2>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : roomTypes.length === 0 ? (
          <EmptyState title="Chưa có loại phòng" description="Hãy thêm loại phòng đầu tiên." />
        ) : (
          <div className="table-wrap">
            <table className="data-table room-type-table">
              <thead>
                <tr>
                  <th>Loại phòng</th>
                  <th>Số khách</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>
                      <strong>{roomType.name}</strong>
                    </td>
                    <td>{roomType.maxGuest}</td>
                    <td>{roomType.description || 'Chưa có'}</td>
                    <td>
                      <div className="table-actions">
                        <button className="view-btn compact-btn" onClick={() => openViewRoomType(roomType)} type="button">
                          <AppIcon name="eye" />
                          Xem
                        </button>
                        <button className="edit-btn compact-btn" onClick={() => openEditRoomType(roomType)} type="button">
                          <AppIcon name="edit" />
                          Sửa
                        </button>
                        <button
                          className="danger-btn compact-btn"
                          disabled={savingRoomType}
                          onClick={() => removeRoomType(roomType)}
                          type="button"
                        >
                          <AppIcon name="trash" />
                          Xóa
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
          <button className="blue-btn" onClick={openCreateRoomType} type="button">
            <AppIcon name="plus" />
            Thêm loại phòng
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
