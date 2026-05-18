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
    }
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const title = mode === 'edit' ? 'Chinh sua phong' : 'Them phong'
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
    }
    onSubmit(normalized)
  }

  const changeImage = async (event) => {
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
      setUploadError(error.message || 'Khong upload duoc anh')
    } finally {
      setUploading(false)
    }
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
            <span>Loai phong</span>
            <select
              onChange={(event) => updateField('roomTypeId', event.target.value)}
              required
              value={form.roomTypeId}
            >
              <option value="">Chon loai phong</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>So phong</span>
            <input
              min="1"
              onChange={(event) => updateField('number', event.target.value)}
              required
              type="number"
              value={form.number}
            />
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

          <label className="field form-wide">
            <span>Thumbnail URL</span>
            <input
              onChange={(event) => updateField('thumbnail', event.target.value)}
              placeholder="https://..."
              value={form.thumbnail}
            />
          </label>

          <label className="field form-wide">
            <span>Upload anh phong</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Dang upload anh len Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          {form.thumbnail && (
            <div className="image-preview form-wide">
              <img src={form.thumbnail} alt="Anh phong da upload" />
              <span>URL nay se duoc luu vao Room.thumbnail</span>
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
