import { useMemo, useRef, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import { deleteCloudImage, getCloudinaryPublicId, uploadImage } from '../../../services/uploadService'

const emptyPricingForm = {
  enabled: false,
  id: '',
  baseDuration: 'NIGHT',
  basePrice: '',
  weekendPrice: '',
  holidayPrice: '',
  startDate: '',
  endDate: '',
  policy: '',
  status: true,
}

const emptyForm = {
  branchId: '',
  roomTypeId: '',
  name: '',
  area: '',
  thumbnail: '',
  status: 'AVAILABLE',
  amenities: {},
  roomPhotos: [],
  pricing: emptyPricingForm,
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

function getRoomPhotoUrl(roomPhoto) {
  return roomPhoto.photo || roomPhoto.Photo || ''
}

function getExistingRoomPhoto(roomPhoto) {
  const url = getRoomPhotoUrl(roomPhoto)
  return url ? { id: roomPhoto.id, url } : null
}

function revokeObjectUrl(url) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

async function deleteUploadedImage(publicId) {
  if (!publicId) {
    return
  }

  try {
    await deleteCloudImage(publicId)
  } catch {
    // The DB save flow must not be blocked by cleanup failure for a temporary upload.
  }
}

function formatRoomStatus(status) {
  const labels = {
    AVAILABLE: 'Đang trống',
    OCCUPIED: 'Đang thuê',
    NO_STATUS: 'Chưa có trang thai',
  }

  return labels[status] || status
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

function StatusBadge({ status }) {
  return (
    <span className={`room-status-badge ${status.toLowerCase()}`}>
      <AppIcon name={status === 'AVAILABLE' ? 'check' : 'calendar'} />
      {formatRoomStatus(status)}
    </span>
  )
}

function formatDateTimeInput(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

function pricingFormFrom(pricing) {
  if (!pricing) {
    return emptyPricingForm
  }

  return {
    enabled: true,
    id: pricing.id || '',
    baseDuration: pricing.baseDuration || 'NIGHT',
    basePrice: pricing.basePrice ? String(pricing.basePrice) : '',
    weekendPrice: pricing.weekendPrice ? String(pricing.weekendPrice) : '',
    holidayPrice: pricing.holidayPrice ? String(pricing.holidayPrice) : '',
    startDate: formatDateTimeInput(pricing.startDate),
    endDate: formatDateTimeInput(pricing.endDate),
    policy: pricing.policy || '',
    status: pricing.status ?? true,
  }
}

function AmenityPicker({ amenities, formAmenities, onToggle }) {
  if (amenities.length === 0) {
    return (
      <div className="empty-state compact-empty-state">
        <strong>Chưa có tiện nghi</strong>
        <span>Hay tao tiện nghi truoc khi gan cho phòng.</span>
      </div>
    )
  }

  return (
    <div className="amenity-detail-table">
      {amenities.map((amenity) => {
        const checked = Object.prototype.hasOwnProperty.call(formAmenities, amenity.id)
        return (
          <label className="amenity-detail-row" key={amenity.id}>
            <span className="amenity-detail-icon">
              <AppIcon name={amenityIconName(amenity.name)} />
            </span>
            <span>{amenity.name}</span>
            <input
              checked={checked}
              onChange={(event) => onToggle(amenity.id, event.target.checked)}
              type="checkbox"
            />
          </label>
        )
      })}
    </div>
  )
}

function RoomFormModal({ amenities, branches, mode, onClose, onSubmit, pricing, room, roomTypes, saving }) {
  const [form, setForm] = useState(() => {
    if (!room) {
      return emptyForm
    }

    return {
      branchId: room.branch?.id ? String(room.branch.id) : '',
      roomTypeId: room.roomType?.id ? String(room.roomType.id) : '',
      name: room.name || '',
      area: room.area ? String(room.area) : '',
      thumbnail: room.thumbnail || '',
      status: room.status || 'AVAILABLE',
      amenities: Object.fromEntries(
        (room.amenities || []).map((item) => [item.amenityId, String(item.quantity || 1)]),
      ),
      roomPhotos: [],
      pricing: pricingFormFrom(pricing),
    }
  })
  const existingRoomPhotos = useMemo(
    () => (room?.roomPhotos || []).map(getExistingRoomPhoto).filter(Boolean),
    [room],
  )
  const selectedRoomType = useMemo(
    () => roomTypes.find((roomType) => String(roomType.id) === String(form.roomTypeId)),
    [form.roomTypeId, roomTypes],
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [deletedExistingPhotoIds, setDeletedExistingPhotoIds] = useState([])
  const [thumbnailPreview, setThumbnailPreview] = useState(room?.thumbnail || '')
  const thumbnailUrlRef = useRef(room?.thumbnail || '')
  const thumbnailUploadRef = useRef(null)
  const newRoomPhotosRef = useRef([])

  const title = mode === 'edit' ? `Chỉnh sửa phòng ${room?.name || ''}` : 'Thêm phòng'
  const canSubmit = useMemo(
    () =>
      form.branchId &&
      form.roomTypeId &&
      form.name.trim() &&
      form.area &&
      (!form.pricing.enabled ||
        (form.pricing.baseDuration &&
          form.pricing.basePrice &&
          form.pricing.weekendPrice &&
          form.pricing.holidayPrice &&
          form.pricing.startDate)),
    [form],
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updatePricingField = (field, value) => {
    setForm((current) => ({
      ...current,
      pricing: { ...current.pricing, [field]: value },
    }))
  }

  const closeWithoutSaving = () => {
    deleteUploadedImage(thumbnailUploadRef.current?.publicId)
    newRoomPhotosRef.current.forEach((photo) => deleteUploadedImage(photo.publicId))
    onClose()
  }

  const submit = (event) => {
    event.preventDefault()
    const normalized = {
      branchId: Number(form.branchId),
      roomTypeId: Number(form.roomTypeId),
      name: form.name.trim(),
      area: Number(form.area),
      thumbnail: thumbnailUrlRef.current.trim(),
      status: form.status,
      amenities: Object.entries(form.amenities).map(([amenityId, quantity]) => ({
        amenityId: Number(amenityId),
        quantity: Number(quantity) || 1,
      })),
      roomPhotos: newRoomPhotosRef.current.map((photo) => photo.url).filter(Boolean),
      deleteRoomPhotoIds: deletedExistingPhotoIds,
      deleteCloudPublicIds: [
        ...(room?.thumbnail && room.thumbnail !== thumbnailUrlRef.current
          ? [getCloudinaryPublicId(room.thumbnail)]
          : []),
        ...deletedExistingPhotoIds
          .map((photoId) => existingRoomPhotos.find((photo) => photo.id === photoId)?.url)
          .map(getCloudinaryPublicId),
      ].filter(Boolean),
      pricing: form.pricing,
    }
    onSubmit(normalized)
  }

  const changeThumbnail = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setUploadError('')
    const previewUrl = URL.createObjectURL(file)
    setThumbnailPreview((current) => {
      revokeObjectUrl(current)
      return previewUrl
    })

    try {
      const uploaded = await uploadImage(file, 'rooms')
      await deleteUploadedImage(thumbnailUploadRef.current?.publicId)
      thumbnailUploadRef.current = uploaded.publicId ? { publicId: uploaded.publicId, url: uploaded.url } : null
      thumbnailUrlRef.current = uploaded.url
      updateField('thumbnail', uploaded.url)
      setThumbnailPreview((current) => {
        revokeObjectUrl(current)
        return uploaded.url
      })
    } catch (error) {
      setThumbnailPreview((current) => {
        revokeObjectUrl(current)
        return form.thumbnail
      })
      setUploadError(error.message || 'Không thể upload thumbnail. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const changeImage = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      return
    }

    setUploading(true)
    setUploadError('')
    const pendingPhotos = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
      url: '',
    }))

    setForm((current) => ({
      ...current,
      roomPhotos: [...current.roomPhotos, ...pendingPhotos],
    }))

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const uploaded = await uploadImage(file, 'room-photos')
          return {
            id: pendingPhotos[index].id,
            name: file.name,
            publicId: uploaded.publicId,
            url: uploaded.url,
          }
        }),
      )
      const photos = uploadedImages.filter((uploaded) => uploaded.url)
      newRoomPhotosRef.current = [...newRoomPhotosRef.current, ...photos]

      setForm((current) => ({
        ...current,
        roomPhotos: current.roomPhotos.map((photo) => {
          const uploaded = photos.find((item) => item.id === photo.id)
          if (!uploaded) {
            return photo
          }
          revokeObjectUrl(photo.previewUrl)
          return { ...photo, previewUrl: '', uploading: false, url: uploaded.url }
        }),
      }))
    } catch (error) {
      pendingPhotos.forEach((photo) => revokeObjectUrl(photo.previewUrl))
      setForm((current) => ({
        ...current,
        roomPhotos: current.roomPhotos.filter((photo) => !pendingPhotos.some((item) => item.id === photo.id)),
      }))
      setUploadError(error.message || 'Không thể upload ảnh. Vui long thu lai.')
    } finally {
      setUploading(false)
    }
  }

  const removeRoomPhoto = (photoId) => {
    const removingPhoto = newRoomPhotosRef.current.find((photo) => photo.id === photoId)
    deleteUploadedImage(removingPhoto?.publicId)
    newRoomPhotosRef.current = newRoomPhotosRef.current.filter((photo) => photo.id !== photoId)
    setForm((current) => ({
      ...current,
      roomPhotos: current.roomPhotos.filter((photo) => {
        const removing = photo.id === photoId
        if (removing) {
          revokeObjectUrl(photo.previewUrl)
        }
        return !removing
      }),
    }))
  }

  const removeExistingRoomPhoto = (photoId) => {
    setDeletedExistingPhotoIds((current) => [...current, photoId])
  }

  const removeThumbnail = () => {
    revokeObjectUrl(thumbnailPreview)
    deleteUploadedImage(thumbnailUploadRef.current?.publicId)
    thumbnailUploadRef.current = null
    thumbnailUrlRef.current = ''
    setThumbnailPreview('')
    updateField('thumbnail', '')
  }

  const toggleAmenity = (amenityId, checked) => {
    setForm((current) => {
      const nextAmenities = { ...current.amenities }
      if (checked) {
        nextAmenities[amenityId] = nextAmenities[amenityId] || '1'
      } else {
        delete nextAmenities[amenityId]
      }
      return { ...current, amenities: nextAmenities }
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="room-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Room</p>
            <h2 id="room-form-title">{title}</h2>
          </div>
          <StatusBadge status={form.status || 'NO_STATUS'} />
          <button className="icon-btn" onClick={closeWithoutSaving} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={submit}>
          {mode === 'edit' && (
            <div className="form-section-title form-wide">
              <strong>Thông tin chi tiet phòng {room?.name}</strong>
            </div>
          )}

          <label className="field">
            <span>Chi nhánh</span>
            <select onChange={(event) => updateField('branchId', event.target.value)} required value={form.branchId}>
              <option value="">Chọn chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Loại phòng</span>
            <select onChange={(event) => updateField('roomTypeId', event.target.value)} required value={form.roomTypeId}>
              <option value="">Chon loai phòng</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field form-wide">
            <span>Mô tả</span>
            <textarea disabled value={selectedRoomType?.description || 'Chưa có mô tả'} />
          </label>

          <label className="field">
            <span>Tên phòng</span>
            <input onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
          </label>

          <label className="field">
            <span>Diện tích</span>
            <input
              min="1"
              onChange={(event) => updateField('area', event.target.value)}
              required
              step="0.1"
              type="number"
              value={form.area}
            />
          </label>

          <label className="field">
            <span>Trạng thái phòng</span>
            <select onChange={(event) => updateField('status', event.target.value)} value={form.status}>
              <option value="AVAILABLE">Con trong</option>
              <option value="OCCUPIED">Đang thuê</option>
            </select>
          </label>

          <div className="form-section-title form-wide">
            <strong>Thông tin giá phòng</strong>
            <label className="inline-check">
              <input
                checked={form.pricing.enabled}
                onChange={(event) => updatePricingField('enabled', event.target.checked)}
                type="checkbox"
              />
              <span>Cập nhật bảng giá của loại phòng này</span>
            </label>
          </div>

          <label className="field">
            <span>Đơn vị tính</span>
            <input
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('baseDuration', event.target.value)}
              placeholder="NIGHT"
              value={form.pricing.baseDuration}
            />
          </label>

          <label className="field">
            <span>Giá cơ bản / qua dem</span>
            <input
              disabled={!form.pricing.enabled}
              min="0"
              onChange={(event) => updatePricingField('basePrice', event.target.value)}
              type="number"
              value={form.pricing.basePrice}
            />
          </label>

          <label className="field">
            <span>Giá cuối tuần</span>
            <input
              disabled={!form.pricing.enabled}
              min="0"
              onChange={(event) => updatePricingField('weekendPrice', event.target.value)}
              type="number"
              value={form.pricing.weekendPrice}
            />
          </label>

          <label className="field">
            <span>Giá ngày lễ</span>
            <input
              disabled={!form.pricing.enabled}
              min="0"
              onChange={(event) => updatePricingField('holidayPrice', event.target.value)}
              type="number"
              value={form.pricing.holidayPrice}
            />
          </label>

          <label className="field">
            <span>Bắt đầu ap dung</span>
            <input
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('startDate', event.target.value)}
              type="datetime-local"
              value={form.pricing.startDate}
            />
          </label>

          <label className="field">
            <span>Kết thúc</span>
            <input
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('endDate', event.target.value)}
              type="datetime-local"
              value={form.pricing.endDate}
            />
          </label>

          <label className="field form-wide">
            <span>Chính sách</span>
            <textarea
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('policy', event.target.value)}
              value={form.pricing.policy}
            />
          </label>

          <label className="inline-check form-wide">
            <input
              checked={form.pricing.status}
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('status', event.target.checked)}
              type="checkbox"
            />
            <span>Bảng giá đang áp dụng</span>
          </label>

          <label className="field form-wide">
            <span>Upload thumbnail</span>
            <input accept="image/*" disabled={uploading} onChange={changeThumbnail} type="file" />
          </label>

          {thumbnailPreview && (
            <div className="image-preview form-wide">
              <ImagePreview src={thumbnailPreview} alt="Anh thumbnail phòng" />
              <button className="danger-btn compact-btn" onClick={removeThumbnail} type="button">
                <AppIcon name="trash" />
                Xóa thumbnail
              </button>
            </div>
          )}

          <label className="field form-wide">
            <span>Upload anh phòng</span>
            <input accept="image/*" disabled={uploading} multiple onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Đang upload ảnh lên Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          {form.roomPhotos.length > 0 && (
            <div className="field form-wide">
              <div className="room-photo-preview-grid">
                {form.roomPhotos.map((photo) => (
                  <div className="room-photo-preview" key={photo.id || photo.url}>
                    <ImagePreview src={photo.previewUrl || photo.url} alt={photo.name || 'Ảnh phòng'} />
                    <button className="danger-btn compact-btn" onClick={() => removeRoomPhoto(photo.id)} type="button">
                      <AppIcon name="trash" />
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'edit' && existingRoomPhotos.length > 0 && (
            <div className="field form-wide">
              <span>Ảnh phòng hien co</span>
              <div className="room-photo-preview-grid">
                {existingRoomPhotos
                  .filter((photo) => !deletedExistingPhotoIds.includes(photo.id))
                  .map((photo) => (
                    <div className="room-photo-preview" key={photo.id || photo.url}>
                      <ImagePreview src={photo.url} alt="Ảnh phòng hien co" />
                      <button className="danger-btn compact-btn" onClick={() => removeExistingRoomPhoto(photo.id)} type="button">
                        <AppIcon name="trash" />
                        Xóa
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <section className="amenity-detail-section form-wide">
            <div className="section-head compact-section-head">
              <div>
                <p className="eyebrow">Tien nghi</p>
                <h2>Thêm hoac bo tiện nghi phòng</h2>
              </div>
            </div>
            <AmenityPicker amenities={amenities} formAmenities={form.amenities} onToggle={toggleAmenity} />
          </section>

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={closeWithoutSaving} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={!canSubmit || saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu phòng'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default RoomFormModal
