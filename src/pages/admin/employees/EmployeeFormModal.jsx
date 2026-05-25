import { useRef, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import { deleteCloudImage, uploadImage } from '../../../services/uploadService'
import EmployeeAvatar from './EmployeeAvatar'
import { getRoleLabel } from './employeeUtils'

async function deleteUploadedImage(publicId) {
  if (!publicId) return
  try {
    await deleteCloudImage(publicId)
  } catch {
    // Temporary upload cleanup should not block closing the modal.
  }
}

function EmployeeFormModal({ form, mode, onClose, onSubmit, onUpdateField, roles, saving }) {
  const title = mode === 'edit' ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const uploadedImageRef = useRef(null)

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'employees')
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
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="employee-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={closeWithoutSaving} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="customer-avatar-editor form-wide">
            <EmployeeAvatar employee={{ name: form.name, email: form.email, image: form.image }} size="large" />
          </div>

          <label className="field">
            <span>Họ tên</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Username</span>
            <input onChange={(event) => onUpdateField('username', event.target.value)} required value={form.username} />
          </label>
          <label className="field">
            <span>Email</span>
            <input onChange={(event) => onUpdateField('email', event.target.value)} required type="email" value={form.email} />
          </label>
          {mode === 'create' && (
            <label className="field">
              <span>Mật khẩu tam</span>
              <input onChange={(event) => onUpdateField('password', event.target.value)} required type="password" value={form.password} />
            </label>
          )}
          <label className="field">
            <span>Số điện thoại</span>
            <input onChange={(event) => onUpdateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field">
            <span>Lương</span>
            <input min="0" onChange={(event) => onUpdateField('salary', event.target.value)} type="number" value={form.salary} />
          </label>
          <label className="field form-wide">
            <span>Vai trò</span>
            <select onChange={(event) => onUpdateField('roleId', event.target.value)} required value={form.roleId}>
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
          </label>
          <label className="field form-wide">
            <span>Địa chỉ</span>
            <textarea onChange={(event) => onUpdateField('address', event.target.value)} value={form.address} />
          </label>
          <label className="field form-wide">
            <span>Ảnh đại diện</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Đang upload ảnh...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={closeWithoutSaving} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu nhân viên'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default EmployeeFormModal
