import { useState } from 'react'
import AppIcon from '../../components/AppIcon'
import { uploadImage } from '../../services/uploadService'
import EmployeeAvatar from './EmployeeAvatar'
import { getRoleLabel } from './employeeUtils'

function EmployeeFormModal({ form, mode, onClose, onSubmit, onUpdateField, roles, saving }) {
  const title = mode === 'edit' ? 'Chinh sua nhan vien' : 'Them nhan vien'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'employees')
      onUpdateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Khong the upload anh dai dien.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Nhan vien</p>
            <h2 id="employee-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="customer-avatar-editor form-wide">
            <EmployeeAvatar employee={{ name: form.name, email: form.email, image: form.image }} size="large" />
          </div>

          <label className="field">
            <span>Ho ten</span>
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
              <span>Mat khau tam</span>
              <input onChange={(event) => onUpdateField('password', event.target.value)} required type="password" value={form.password} />
            </label>
          )}
          <label className="field">
            <span>So dien thoai</span>
            <input onChange={(event) => onUpdateField('phone', event.target.value)} required value={form.phone} />
          </label>
          <label className="field">
            <span>Luong</span>
            <input min="0" onChange={(event) => onUpdateField('salary', event.target.value)} type="number" value={form.salary} />
          </label>
          <label className="field form-wide">
            <span>Vai tro</span>
            <select onChange={(event) => onUpdateField('roleId', event.target.value)} required value={form.roleId}>
              <option value="">Chon vai tro</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
          </label>
          <label className="field form-wide">
            <span>Dia chi</span>
            <textarea onChange={(event) => onUpdateField('address', event.target.value)} value={form.address} />
          </label>
          <label className="field form-wide">
            <span>Anh dai dien</span>
            <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
            {uploading && <small className="helper-text">Dang upload anh...</small>}
            {uploadError && <small className="error-text">{uploadError}</small>}
          </label>

          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={saving || uploading} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu nhan vien'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default EmployeeFormModal
