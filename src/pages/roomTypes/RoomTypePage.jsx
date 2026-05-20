import { useCallback, useEffect, useMemo, useState } from 'react'
import AppIcon from '../../components/AppIcon'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import {
  createRoomType,
  deleteRoomType,
  getRoomTypes,
  updateRoomType,
} from '../../services/roomService'
import { uploadImage } from '../../services/uploadService'

const emptyForm = { name: '', description: '', maxGuest: '', image: '' }
const PAGE_SIZE = 6

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || 'Chua co'}</strong>
    </div>
  )
}

function RoomTypeImage({ image, name }) {
  const [failed, setFailed] = useState(false)

  if (!image) {
    return <DetailItem label="Anh loai phong" value="Chua co" />
  }

  if (failed) {
    return (
      <div className="image-error-box form-wide">
        <strong>Khong tai duoc anh</strong>
        <span>{image}</span>
      </div>
    )
  }

  return (
    <div className="detail-image form-wide">
      <span className="detail-section-label">Anh loai phong</span>
      <img src={image} alt={name || 'Loai phong'} onError={() => setFailed(true)} />
    </div>
  )
}

function ImagePreview({ alt, src }) {
  const [failedSrc, setFailedSrc] = useState('')
  const failed = failedSrc === src

  if (failed) {
    return (
      <div className="image-error-box">
        <strong>Khong tai duoc anh</strong>
        <span>{src}</span>
      </div>
    )
  }

  return <img src={src} alt={alt} onError={() => setFailedSrc(src)} />
}

function RoomTypeDetailModal({ onClose, onEdit, roomType }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="room-type-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Room type</p>
            <h2 id="room-type-detail-title">Thong tin chi tiet loai phong</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="detail-list">
          <DetailItem label="Ten loai phong" value={roomType.name} />
          <DetailItem label="So khach toi da" value={roomType.maxGuest} />
          <DetailItem label="Mo ta" value={roomType.description} />
          <RoomTypeImage image={roomType.image} name={roomType.name} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="blue-btn" onClick={() => onEdit(roomType)} type="button">
            <AppIcon name="edit" />
            Chinh sua
          </button>
        </div>
      </section>
    </div>
  )
}

function RoomTypeFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chinh sua loai phong' : 'Them loai phong'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const uploaded = await uploadImage(file, 'room-types')
      onUpdateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Khong the upload anh loai phong. Vui long thu lai.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="room-type-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Room type</p>
            <h2 id="room-type-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="form-section-title form-wide">
            <strong>Thong tin loai phong</strong>
          </div>

          <label className="field">
            <span>Ten loai phong</span>
            <input
              onChange={(event) => onUpdateField('name', event.target.value)}
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>So khach toi da</span>
            <input
              min="1"
              onChange={(event) => onUpdateField('maxGuest', event.target.value)}
              required
              type="number"
              value={form.maxGuest}
            />
          </label>

          <label className="field form-wide">
            <span>Mo ta</span>
            <textarea onChange={(event) => onUpdateField('description', event.target.value)} value={form.description} />
          </label>

          <label className="field form-wide">
            <span>Anh loai phong</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Dang upload anh len Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          {form.image && (
            <div className="image-preview form-wide">
              <ImagePreview src={form.image} alt={form.name || 'Loai phong'} />
            </div>
          )}

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu loai phong'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function roomTypeFormFrom(roomType) {
  return {
    name: roomType.name || '',
    description: roomType.description || '',
    maxGuest: roomType.maxGuest ? String(roomType.maxGuest) : '',
    image: roomType.image || '',
  }
}

function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ search: '' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, mode: 'create', roomType: null, form: emptyForm })
  const [detailModal, setDetailModal] = useState({ open: false, roomType: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const filteredRoomTypes = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    return roomTypes.filter((roomType) => {
      const searchable = [roomType.name, roomType.description, roomType.maxGuest]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return searchable.includes(keyword)
    })
  }, [roomTypes, filters])

  const totalPages = Math.max(1, Math.ceil(filteredRoomTypes.length / PAGE_SIZE))
  const pagedRoomTypes = filteredRoomTypes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadRoomTypes = useCallback(async () => {
    setLoading(true)
    setToast(null)
    try {
      setRoomTypes(await getRoomTypes())
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc loai phong' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadRoomTypes)
  }, [loadRoomTypes])

  const updateField = (field, value) => {
    setModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const openCreateModal = () => {
    setModal({ open: true, mode: 'create', roomType: null, form: emptyForm })
  }

  const openEditModal = (roomType) => {
    setDetailModal({ open: false, roomType: null })
    setModal({ open: true, mode: 'edit', roomType, form: roomTypeFormFrom(roomType) })
  }

  const closeModal = () => {
    setModal({ open: false, mode: 'create', roomType: null, form: emptyForm })
  }

  const openDetailModal = (roomType) => {
    setDetailModal({ open: true, roomType })
  }

  const closeDetailModal = () => {
    setDetailModal({ open: false, roomType: null })
  }

  const applySearch = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput })
    setPage(1)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)
    const payload = { ...modal.form, maxGuest: Number(modal.form.maxGuest) }

    try {
      if (modal.mode === 'edit') {
        await updateRoomType(modal.roomType.id, payload)
        setToast({ type: 'success', message: 'Da cap nhat loai phong' })
      } else {
        await createRoomType(payload)
        setToast({ type: 'success', message: 'Da them loai phong' })
      }
      closeModal()
      await loadRoomTypes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc loai phong' })
    } finally {
      setSaving(false)
    }
  }

  const removeRoomType = async (roomType) => {
    const confirmed = window.confirm(`Xoa loai phong ${roomType.name}?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setToast(null)
    try {
      await deleteRoomType(roomType.id)
      setToast({ type: 'success', message: 'Da xoa loai phong' })
      await loadRoomTypes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong xoa duoc loai phong' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">QUAN LY LOAI PHONG</p>
          <h1>Loai phong</h1>
          <p className="muted-text">Quan ly ten, mo ta, so khach toi da va anh loai phong.</p>
        </div>
        <button className="blue-btn" onClick={openCreateModal} type="button">
          <AppIcon name="plus" />
          Them loai phong
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="So loai phong" value={roomTypes.length} />
        <StatCard
          label="Suc chua lon nhat"
          value={roomTypes.length ? Math.max(...roomTypes.map((item) => item.maxGuest || 0)) : 0}
          tone="mint"
        />
        <StatCard
          label="Co anh dai dien"
          value={roomTypes.filter((item) => item.image).length}
          tone="cream"
        />
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">DANH SACH LOAI PHONG</p>
            <h2>Danh sach loai phong</h2>
          </div>
        </div>

        <form className="room-toolbar" onSubmit={applySearch}>
          <label className="field">
            <span>Tim kiem loai phong</span>
            <input
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Ten, mo ta hoac so khach"
              value={searchInput}
            />
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
        ) : filteredRoomTypes.length === 0 ? (
          <EmptyState title="Khong co loai phong" description="Khong tim thay loai phong phu hop." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loai phong</th>
                  <th>So khach</th>
                  <th>Mo ta</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {pagedRoomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>
                      <div className="room-type-cell">
                        {roomType.image ? (
                          <img className="room-thumb" src={roomType.image} alt={roomType.name} />
                        ) : (
                          <span className="room-type-placeholder">
                            <AppIcon name="sparkles" />
                          </span>
                        )}
                        <div>
                          <strong>{roomType.name}</strong>
                          <span className="cell-subtext">ID {roomType.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{roomType.maxGuest}</td>
                    <td>{roomType.description || 'Chua co'}</td>
                    <td>
                      <div className="table-actions">
                        <button className="view-btn compact-btn" onClick={() => openDetailModal(roomType)} type="button">
                          <AppIcon name="eye" />
                          Xem
                        </button>
                        <button className="edit-btn compact-btn" onClick={() => openEditModal(roomType)} type="button">
                          <AppIcon name="edit" />
                          Sua
                        </button>
                        <button
                          className="danger-btn compact-btn"
                          disabled={saving}
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

        <div className="pagination-bar">
          <span>
            Hien thi {pagedRoomTypes.length} / {filteredRoomTypes.length} loai phong
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

      {detailModal.open && detailModal.roomType && (
        <RoomTypeDetailModal
          onClose={closeDetailModal}
          onEdit={openEditModal}
          roomType={detailModal.roomType}
        />
      )}

      {modal.open && (
        <RoomTypeFormModal
          form={modal.form}
          mode={modal.mode}
          onClose={closeModal}
          onSubmit={submit}
          onUpdateField={updateField}
          saving={saving}
        />
      )}
    </section>
  )
}

export default RoomTypePage
