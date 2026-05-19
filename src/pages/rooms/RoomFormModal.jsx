import { useMemo, useState } from 'react'
import AppIcon from '../../components/AppIcon'
import { uploadImage } from '../../services/uploadService'

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
  number: '',
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

function formatRoomStatus(status) {
  const labels = {
    AVAILABLE: 'Dang trong',
    OCCUPIED: 'Dang thue',
    NO_STATUS: 'Chua co trang thai',
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
        <strong>Chua co tien nghi</strong>
        <span>Hay tao tien nghi truoc khi gan cho phong.</span>
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
      number: room.number ? String(room.number) : '',
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
    () => (room?.roomPhotos || []).map(getRoomPhotoUrl).filter(Boolean),
    [room],
  )
  const selectedRoomType = useMemo(
    () => roomTypes.find((roomType) => String(roomType.id) === String(form.roomTypeId)),
    [form.roomTypeId, roomTypes],
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const title = mode === 'edit' ? `Chinh sua phong so ${room?.number || ''}` : 'Them phong'
  const canSubmit = useMemo(
    () =>
      form.branchId &&
      form.roomTypeId &&
      form.number &&
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
      setUploadError(error.message || 'Khong the upload anh. Vui long thu lai.')
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
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="room-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Room</p>
            <h2 id="room-form-title">{title}</h2>
          </div>
          <StatusBadge status={form.status || 'NO_STATUS'} />
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={submit}>
          {mode === 'edit' && (
            <div className="form-section-title form-wide">
              <strong>Thong tin chi tiet phong so {room?.number}</strong>
            </div>
          )}

          <label className="field">
            <span>Chi nhanh</span>
            <select onChange={(event) => updateField('branchId', event.target.value)} required value={form.branchId}>
              <option value="">Chon chi nhanh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Loai phong</span>
            <select onChange={(event) => updateField('roomTypeId', event.target.value)} required value={form.roomTypeId}>
              <option value="">Chon loai phong</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field form-wide">
            <span>Mo ta</span>
            <textarea disabled value={selectedRoomType?.description || 'Chua co mo ta'} />
          </label>

          <label className="field">
            <span>So phong</span>
            <input min="1" onChange={(event) => updateField('number', event.target.value)} required type="number" value={form.number} />
          </label>

          <label className="field">
            <span>Dien tich</span>
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
            <span>Trang thai phong</span>
            <select onChange={(event) => updateField('status', event.target.value)} value={form.status}>
              <option value="AVAILABLE">Con trong</option>
              <option value="OCCUPIED">Dang thue</option>
            </select>
          </label>

          <div className="form-section-title form-wide">
            <strong>Thong tin gia phong</strong>
            <label className="inline-check">
              <input
                checked={form.pricing.enabled}
                onChange={(event) => updatePricingField('enabled', event.target.checked)}
                type="checkbox"
              />
              <span>Cap nhat bang gia cua loai phong nay</span>
            </label>
          </div>

          <label className="field">
            <span>Don vi tinh</span>
            <input
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('baseDuration', event.target.value)}
              placeholder="NIGHT"
              value={form.pricing.baseDuration}
            />
          </label>

          <label className="field">
            <span>Gia co ban / qua dem</span>
            <input
              disabled={!form.pricing.enabled}
              min="0"
              onChange={(event) => updatePricingField('basePrice', event.target.value)}
              type="number"
              value={form.pricing.basePrice}
            />
          </label>

          <label className="field">
            <span>Gia cuoi tuan</span>
            <input
              disabled={!form.pricing.enabled}
              min="0"
              onChange={(event) => updatePricingField('weekendPrice', event.target.value)}
              type="number"
              value={form.pricing.weekendPrice}
            />
          </label>

          <label className="field">
            <span>Gia ngay le</span>
            <input
              disabled={!form.pricing.enabled}
              min="0"
              onChange={(event) => updatePricingField('holidayPrice', event.target.value)}
              type="number"
              value={form.pricing.holidayPrice}
            />
          </label>

          <label className="field">
            <span>Bat dau ap dung</span>
            <input
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('startDate', event.target.value)}
              type="datetime-local"
              value={form.pricing.startDate}
            />
          </label>

          <label className="field">
            <span>Ket thuc</span>
            <input
              disabled={!form.pricing.enabled}
              onChange={(event) => updatePricingField('endDate', event.target.value)}
              type="datetime-local"
              value={form.pricing.endDate}
            />
          </label>

          <label className="field form-wide">
            <span>Chinh sach</span>
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
            <span>Bang gia dang ap dung</span>
          </label>

          <label className="field form-wide">
            <span>Thumbnail URL</span>
            <input onChange={(event) => updateField('thumbnail', event.target.value)} placeholder="https://..." value={form.thumbnail} />
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
            <span>Upload anh phong</span>
            <input accept="image/*" disabled={uploading} multiple onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Dang upload anh len Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          {form.roomPhotos.length > 0 && (
            <div className="field form-wide">
              <div className="room-photo-preview-grid">
                {form.roomPhotos.map((photo) => (
                  <div className="room-photo-preview" key={photo.url}>
                    <ImagePreview src={photo.url} alt={photo.name || 'Anh phong'} />
                    <button className="danger-btn compact-btn" onClick={() => removeRoomPhoto(photo.url)} type="button">
                      <AppIcon name="trash" />
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

          <section className="amenity-detail-section form-wide">
            <div className="section-head compact-section-head">
              <div>
                <p className="eyebrow">Tien nghi</p>
                <h2>Them hoac bo tien nghi phong</h2>
              </div>
            </div>
            <AmenityPicker amenities={amenities} formAmenities={form.amenities} onToggle={toggleAmenity} />
          </section>

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={!canSubmit || saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu phong'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default RoomFormModal
