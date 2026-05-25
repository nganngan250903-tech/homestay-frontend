import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import StatCard from '../../../components/StatCard'
import Toast from '../../../components/Toast'
import {
  createRoomType,
  deleteRoomType,
  getRoomTypes,
  updateRoomType,
} from '../../../services/roomService'
import { deleteCloudImage, getCloudinaryPublicId, uploadImage } from '../../../services/uploadService'

const emptyForm = { name: '', description: '', maxGuest: '', image: '' }
const PAGE_SIZE = 6

async function deleteCloudImageByUrl(url) {
  const publicId = getCloudinaryPublicId(url)
  if (!publicId) return
  await deleteCloudImage(publicId)
}

async function deleteUploadedImage(publicId) {
  if (!publicId) return
  try {
    await deleteCloudImage(publicId)
  } catch {
    // Temporary upload cleanup should not block closing the modal.
  }
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || 'Chưa có'}</strong>
    </div>
  )
}

function RoomTypeImage({ image, name }) {
  const [failed, setFailed] = useState(false)

  if (!image) {
    return <DetailItem label="Ảnh loại phòng" value="Chưa có" />
  }

  if (failed) {
    return (
      <div className="image-error-box form-wide">
        <strong>Không tải được ảnh</strong>
        <span>{image}</span>
      </div>
    )
  }

  return (
    <div className="detail-image form-wide">
      <span className="detail-section-label">Ảnh loại phòng</span>
      <img src={image} alt={name || 'Loại phòng'} onError={() => setFailed(true)} />
    </div>
  )
}

function ImagePreview({ alt, src }) {
  const [failedSrc, setFailedSrc] = useState('')
  const failed = failedSrc === src

  if (failed) {
    return (
      <div className="image-error-box">
        <strong>Không tải được ảnh</strong>
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
            <h2 id="room-type-detail-title">Thông tin chi tiết loại phòng</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="detail-list">
          <DetailItem label="Tên loại phòng" value={roomType.name} />
          <DetailItem label="Số khách tối đa" value={roomType.maxGuest} />
          <DetailItem label="Mô tả" value={roomType.description} />
          <RoomTypeImage image={roomType.image} name={roomType.name} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
          <button className="blue-btn" onClick={() => onEdit(roomType)} type="button">
            <AppIcon name="edit" />
            Chỉnh sửa
          </button>
        </div>
      </section>
    </div>
  )
}

function RoomTypeFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const uploadedImageRef = useRef(null)

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const uploaded = await uploadImage(file, 'room-types')
      await deleteUploadedImage(uploadedImageRef.current?.publicId)
      uploadedImageRef.current = uploaded.publicId ? { publicId: uploaded.publicId, url: uploaded.url } : null
      onUpdateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Không thể upload ảnh loại phòng. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const closeWithoutSaving = () => {
    deleteUploadedImage(uploadedImageRef.current?.publicId)
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="room-type-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="room-type-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={closeWithoutSaving} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="form-section-title form-wide">
            <strong>Thông tin loại phòng</strong>
          </div>

          <label className="field">
            <span>Tên loại phòng</span>
            <input
              onChange={(event) => onUpdateField('name', event.target.value)}
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Số khách tối đa</span>
            <input
              min="1"
              onChange={(event) => onUpdateField('maxGuest', event.target.value)}
              required
              type="number"
              value={form.maxGuest}
            />
          </label>

          <label className="field form-wide">
            <span>Mô tả</span>
            <textarea onChange={(event) => onUpdateField('description', event.target.value)} value={form.description} />
          </label>

          <label className="field form-wide">
            <span>Ảnh loại phòng</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Đang upload ảnh lên Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          {form.image && (
            <div className="image-preview form-wide">
              <ImagePreview src={form.image} alt={form.name || 'Loại phòng'} />
            </div>
          )}

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={closeWithoutSaving} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu loại phòng'}
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
      setToast({ type: 'error', message: error.message || 'Không tải được loại phòng' })
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
        if (modal.roomType.image && modal.roomType.image !== payload.image) {
          await Promise.allSettled([deleteCloudImageByUrl(modal.roomType.image)])
        }
        setToast({ type: 'success', message: 'Đã cập nhật loại phòng' })
      } else {
        await createRoomType(payload)
        setToast({ type: 'success', message: 'Đã thêm loại phòng' })
      }
      closeModal()
      await loadRoomTypes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không lưu được loại phòng' })
    } finally {
      setSaving(false)
    }
  }

  const removeRoomType = async (roomType) => {
    const confirmed = window.confirm(`Xóa loại phòng ${roomType.name}?`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setToast(null)
    try {
      await deleteRoomType(roomType.id)
      if (roomType.image) {
        await Promise.allSettled([deleteCloudImageByUrl(roomType.image)])
      }
      setToast({ type: 'success', message: 'Đã xóa loại phòng' })
      await loadRoomTypes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không xóa được loại phòng' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Loại phòng</h1>
          <p className="muted-text">Quản lý tên, mô tả, số khách tối đa và ảnh loại phòng.</p>
        </div>
        <button className="blue-btn" onClick={openCreateModal} type="button">
          <AppIcon name="plus" />
          Thêm loại phòng
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Số loại phòng" value={roomTypes.length} />
        <StatCard
          label="Sức chứa lớn nhất"
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
            <h2>Danh sách loại phòng</h2>
          </div>
        </div>

        <form className="room-toolbar" onSubmit={applySearch}>
          <label className="field">
            <span>Tìm kiếm loại phòng</span>
            <input
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tên, mô tả hoặc số khách"
              value={searchInput}
            />
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
        ) : filteredRoomTypes.length === 0 ? (
          <EmptyState title="Không có loại phòng" description="Không tìm thấy loại phòng phù hợp." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại phòng</th>
                  <th>Số khách</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
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
                        </div>
                      </div>
                    </td>
                    <td>{roomType.maxGuest}</td>
                    <td>{roomType.description || 'Chưa có'}</td>
                    <td>
                      <div className="table-actions">
                        <button className="view-btn compact-btn" onClick={() => openDetailModal(roomType)} type="button">
                          <AppIcon name="eye" />
                          Xem
                        </button>
                        <button className="edit-btn compact-btn" onClick={() => openEditModal(roomType)} type="button">
                          <AppIcon name="edit" />
                          Sửa
                        </button>
                        <button
                          className="danger-btn compact-btn"
                          disabled={saving}
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

        <div className="pagination-bar">
          <span>
            Hiển thị {pagedRoomTypes.length} / {filteredRoomTypes.length} loại phòng
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

