import { useRef, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import { deleteCloudImage, uploadImage } from '../../../services/uploadService'
import CustomerAvatar from './CustomerAvatar'

async function deleteUploadedImage(publicId) {
  if (!publicId) return
  try {
    await deleteCloudImage(publicId)
  } catch {
    // Temporary upload cleanup should not block closing the modal.
  }
}

function CustomerFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const uploadedImageRef = useRef(null)

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'customers')
      await deleteUploadedImage(uploadedImageRef.current?.publicId)
      uploadedImageRef.current = uploaded.publicId ? { publicId: uploaded.publicId, url: uploaded.url } : null
      onUpdateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Không thể upload ảnh đại diện.')
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
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Khách hàng</p>
            <h2 id="customer-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={closeWithoutSaving} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="customer-avatar-editor form-wide">
            <CustomerAvatar customer={{ name: form.name, email: form.email, image: form.image }} size="large" />
          </div>

          <label className="field">
            <span>Họ tên</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Email</span>
            <input onChange={(event) => onUpdateField('email', event.target.value)} required type="email" value={form.email} />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input onChange={(event) => onUpdateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field form-wide">
            <span>Địa chỉ</span>
            <textarea onChange={(event) => onUpdateField('address', event.target.value)} value={form.address} />
          </label>
          <label className="field form-wide">
            <span>Ảnh đại diện</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Đang upload ảnh lên Cloudinary...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={closeWithoutSaving} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu khách hàng'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CustomerFormModal
