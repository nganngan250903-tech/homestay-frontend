import { useCallback, useEffect, useMemo, useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import {
  createRoom,
  deleteRoom,
  getAmenities,
  getBranches,
  getRooms,
  getRoomTypes,
  updateRoom,
} from '../../services/roomService'
import RoomFormModal from './RoomFormModal'
import RoomTable from './RoomTable'

const PAGE_SIZE = 6

function roomMatchesStatus(room, status) {
  if (status === 'ALL') {
    return true
  }

  return (room.status || room.roomStatus) === status
}

function RoomPage() {
  const [rooms, setRooms] = useState([])
  const [branches, setBranches] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, mode: 'create', room: null })

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase()
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

      return searchable.includes(keyword) && roomMatchesStatus(room, status)
    })
  }, [rooms, search, status])

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
      setRooms(roomData)
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

  const submitRoom = async (payload) => {
    setSaving(true)
    setToast(null)

    try {
      if (modal.mode === 'edit') {
        await updateRoom(modal.room.id, payload)
        setToast({ type: 'success', message: 'Da cap nhat phong' })
      } else {
        await createRoom(payload)
        setToast({ type: 'success', message: 'Da them phong moi' })
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

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Room management</p>
          <h1>Quan ly phong</h1>
          <p className="muted-text">
            Quan ly danh sach phong, chi nhanh, loai phong va hinh anh dai dien.
          </p>
        </div>
        <button className="primary-btn" onClick={openCreateModal} type="button">
          Them phong
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Tong phong" value={rooms.length} />
        <StatCard label="Chi nhanh" value={branches.length} tone="mint" />
        <StatCard label="Loai phong" value={roomTypes.length} tone="cream" />
      </div>

      <section className="panel">
        <div className="room-toolbar">
          <label className="field">
            <span>Tim kiem phong</span>
            <input
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="So phong, chi nhanh, loai phong..."
              value={search}
            />
          </label>
          <label className="field">
            <span>Filter trang thai</span>
            <select
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              value={status}
            >
              <option value="ALL">Tat ca</option>
              <option value="AVAILABLE">Co san</option>
              <option value="OCCUPIED">Dang thue</option>
            </select>
          </label>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <RoomTable rooms={pagedRooms} loading={loading} onDelete={removeRoom} onEdit={openEditModal} />
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
    </section>
  )
}

export default RoomPage
