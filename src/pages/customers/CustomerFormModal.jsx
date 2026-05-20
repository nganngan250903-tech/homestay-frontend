import { useState } from 'react'
import AppIcon from '../../components/AppIcon'
import { uploadImage } from '../../services/uploadService'
import CustomerAvatar from './CustomerAvatar'

function CustomerFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chinh sua khach hang' : 'Them khach hang'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'customers')
      onUpdateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Khong the upload anh dai dien.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Khach hang</p>
            <h2 id="customer-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="customer-avatar-editor form-wide">
            <CustomerAvatar customer={{ name: form.name, email: form.email, image: form.image }} size="large" />
          </div>

          <label className="field">
            <span>Ho ten</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Email</span>
            <input onChange={(event) => onUpdateField('email', event.target.value)} required type="email" value={form.email} />
          </label>
          <label className="field">
            <span>So dien thoai</span>
            <input onChange={(event) => onUpdateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field form-wide">
            <span>Dia chi</span>
            <textarea onChange={(event) => onUpdateField('address', event.target.value)} value={form.address} />
          </label>
          <label className="field form-wide">
            <span>Anh dai dien</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Dang upload anh len Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu khach hang'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CustomerFormModal
