import { useMemo, useState } from 'react'
import { uploadImage } from '../../services/uploadService'

const emptyForm = {
  branchId: '',
  roomTypeId: '',
  number: '',
  area: '',
  thumbnail: '',
  status: 'AVAILABLE',
  amenities: {},
  roomPhotos: [],
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

function getRoomPhotoUrl(roomPhoto) {
  return roomPhoto.photo || roomPhoto.Photo || ''
}

function RoomFormModal({ amenities, branches, mode, onClose, onSubmit, room, roomTypes, saving }) {
  const [form, setForm] = useState(() => {
    if (!room) {
      return emptyForm
    }

    return {
      branchId: room.branch?.id ? String(room.branch.id) : '',
      roomTypeId: room.roomType?.id ? String(room.roomType.id) : '',
      number: room.number ? String(room.number) : '',
      area: room.area ? String(room.area) : '',
      thumbnail: room.thumbnail || '',
      status: room.status || 'AVAILABLE',
      amenities: Object.fromEntries(
        (room.amenities || []).map((item) => [item.amenityId, String(item.quantity || 1)]),
      ),
      roomPhotos: [],
    }
  })
  const existingRoomPhotos = useMemo(
    () => (room?.roomPhotos || []).map(getRoomPhotoUrl).filter(Boolean),
    [room],
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const title = mode === 'edit' ? 'Chỉnh sửa phòng' : 'Thêm phòng'
  const canSubmit = useMemo(
    () => form.branchId && form.roomTypeId && form.number && form.area,
    [form],
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    const normalized = {
      branchId: Number(form.branchId),
      roomTypeId: Number(form.roomTypeId),
      number: Number(form.number),
      area: Number(form.area),
      thumbnail: form.thumbnail.trim(),
      status: form.status,
      amenities: Object.entries(form.amenities).map(([amenityId, quantity]) => ({
        amenityId: Number(amenityId),
        quantity: Number(quantity) || 1,
      })),
      roomPhotos: form.roomPhotos.map((photo) => photo.url),
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

    try {
      const uploaded = await uploadImage(file, 'rooms')
      updateField('thumbnail', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Khong the upload thumbnail. Vui long thu lai.')
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

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          url: (await uploadImage(file, 'room-photos')).url,
        })),
      )
      const photos = uploadedImages.filter((uploaded) => uploaded.url)

      setForm((current) => ({
        ...current,
        roomPhotos: [...current.roomPhotos, ...photos],
      }))
    } catch (error) {
      setUploadError(error.message || 'Không thể upload ảnh. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const removeRoomPhoto = (photoUrl) => {
    setForm((current) => ({
      ...current,
      roomPhotos: current.roomPhotos.filter((photo) => photo.url !== photoUrl),
    }))
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
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-form-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Room</p>
            <h2 id="room-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            x
          </button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label className="field">
            <span>Chi nhanh</span>
            <select
              onChange={(event) => updateField('branchId', event.target.value)}
              required
              value={form.branchId}
            >
              <option value="">Chon chi nhanh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Loại phòng</span>
            <select
              onChange={(event) => updateField('roomTypeId', event.target.value)}
              required
              value={form.roomTypeId}
            >
              <option value="">Chọn loại phòng</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Số phòng</span>
            <input
              min="1"
              onChange={(event) => updateField('number', event.target.value)}
              required
              type="number"
              value={form.number}
            />
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
              <option value="AVAILABLE">Còn trống</option>
              <option value="OCCUPIED">Đang thuê</option>
            </select>
          </label>

          <label className="field form-wide">
            <span>Thumbnail URL</span>
            <input
              onChange={(event) => updateField('thumbnail', event.target.value)}
              placeholder="https://..."
              value={form.thumbnail}
            />
          </label>

          <label className="field form-wide">
            <span>Upload thumbnail</span>
            <input accept="image/*" disabled={uploading} onChange={changeThumbnail} type="file" />
          </label>

          {form.thumbnail && (
            <div className="image-preview form-wide">
              <ImagePreview src={form.thumbnail} alt="Anh thumbnail phong" />
            </div>
          )}

          <label className="field form-wide">
            <span>Upload ảnh phòng</span>
            <input accept="image/*" disabled={uploading} multiple onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Đang upload ảnh lên Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>
 
          {form.roomPhotos.length > 0 && (
            <div className="field form-wide">
              <div className="room-photo-preview-grid">
                {form.roomPhotos.map((photo) => (
                  <div className="room-photo-preview" key={photo.url}>
                    <ImagePreview src={photo.url} alt={photo.name || 'Anh phong'} />
                    <button className="danger-btn compact-btn" onClick={() => removeRoomPhoto(photo.url)} type="button">
                      Xoa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'edit' && existingRoomPhotos.length > 0 && (
            <div className="field form-wide">
              <span>Anh phong hien co</span>
              <div className="room-photo-preview-grid">
                {existingRoomPhotos.map((photoUrl) => (
                  <div className="room-photo-preview" key={photoUrl}>
                    <ImagePreview src={photoUrl} alt="Anh phong hien co" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="field form-wide">
            <span>Tien nghi phong</span>
            <div className="amenity-grid">
              {amenities.map((amenity) => {
                const checked = Object.prototype.hasOwnProperty.call(form.amenities, amenity.id)
                return (
                  <label className="amenity-option" key={amenity.id}>
                    <input
                      checked={checked}
                      onChange={(event) => toggleAmenity(amenity.id, event.target.checked)}
                      type="checkbox"
                    />
                    <span>{amenity.name}</span>
                    <input
                      disabled={!checked}
                      min="1"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          amenities: {
                            ...current.amenities,
                            [amenity.id]: event.target.value,
                          },
                        }))
                      }
                      type="number"
                      value={form.amenities[amenity.id] || '1'}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="modal-actions form-wide">
            <button className="secondary-btn" onClick={onClose} type="button">
              Huy
            </button>
            <button className="primary-btn" disabled={!canSubmit || saving || uploading} type="submit">
              {saving ? 'Dang luu...' : 'Luu phong'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default RoomFormModal
