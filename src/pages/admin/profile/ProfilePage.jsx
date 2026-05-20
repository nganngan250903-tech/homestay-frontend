import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'
import LoadingSpinner from '../../../components/LoadingSpinner'
import Toast from '../../../components/Toast'
import { changeEmployeePassword, getEmployee, updateEmployee } from '../../../services/employeeService'
import { deleteCloudImage, getCloudinaryPublicId, uploadImage } from '../../../services/uploadService'
import EmployeeAvatar from '../employees/EmployeeAvatar'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  image: '',
  salary: '',
}

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

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
    // Temporary upload cleanup should not block cancelling edits.
  }
}

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function profileFormFrom(employee) {
  return {
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    image: employee?.image || '',
    salary: employee?.salary ?? '',
  }
}

function ProfileField({ label, value }) {
  return (
    <div className="profile-info-row">
      <span>{label}</span>
      <strong>{value || 'Chua co'}</strong>
    </div>
  )
}

function ProfilePage({ auth }) {
  const outlet = useOutletContext()
  const [profile, setProfile] = useState(outlet?.profile || null)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [toast, setToast] = useState(null)
  const uploadedImageRef = useRef(null)
  const userId = auth?.user?.id

  const loadProfile = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setToast(null)
    try {
      const data = await getEmployee(userId)
      setProfile(data)
      setForm(profileFormFrom(data))
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc ho so' })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (outlet?.profile) {
      Promise.resolve().then(() => {
        setProfile(outlet.profile)
        setForm(profileFormFrom(outlet.profile))
        setLoading(false)
      })
      return
    }
    Promise.resolve().then(loadProfile)
  }, [loadProfile, outlet?.profile])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const changeImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, 'employees')
      await deleteUploadedImage(uploadedImageRef.current?.publicId)
      uploadedImageRef.current = uploaded.publicId ? { publicId: uploaded.publicId, url: uploaded.url } : null
      updateField('image', uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Khong the upload anh dai dien')
    } finally {
      setUploading(false)
    }
  }

  const cancelEdit = () => {
    deleteUploadedImage(uploadedImageRef.current?.publicId)
    uploadedImageRef.current = null
    setForm(profileFormFrom(profile))
    setEditing(false)
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address,
        image: form.image,
      }
      if (canEditSalary) {
        payload.salary = form.salary === '' ? null : Number(form.salary)
      }
      const updated = await updateEmployee(profile.id, payload)
      if (profile.image && profile.image !== payload.image) {
        await Promise.allSettled([deleteCloudImageByUrl(profile.image)])
      }
      uploadedImageRef.current = null
      setProfile(updated)
      setForm(profileFormFrom(updated))
      setEditing(false)
      await outlet?.reloadProfile?.()
      setToast({ type: 'success', message: 'Cap nhat du lieu thanh cong' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong cap nhat duoc ho so' })
    } finally {
      setSaving(false)
    }
  }

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  const closePasswordModal = () => {
    if (!saving) {
      setPasswordModalOpen(false)
      setPasswordForm(emptyPasswordForm)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: 'error', message: 'Mat khau moi va xac nhan mat khau khong trung khop' })
      return
    }

    setSaving(true)
    setToast(null)
    try {
      await changeEmployeePassword(profile.id, passwordForm)
      closePasswordModal()
      setToast({ type: 'success', message: 'Doi mat khau thanh cong' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong doi duoc mat khau' })
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = profile?.role?.description || profile?.role?.name || auth?.role || 'ADMIN'
  const salaryLabel = profile?.salary == null ? 'Chua co' : moneyFormatter.format(Number(profile.salary))
  const canEditSalary = auth?.role === 'ADMIN'

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />

      <div className="page-heading">
        <div>
          <p className="eyebrow">Tai khoan</p>
          <h1>Ho so cua toi</h1>
          <p className="muted-text">Quan ly thong tin ca nhan va thong tin vai tro dang dang nhap.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <section className="profile-card">
          <div className="profile-avatar-block">
            <EmployeeAvatar employee={editing ? { ...profile, image: form.image, name: form.name, email: form.email } : profile} size="large" />
            <h2>{profile?.name || auth?.user?.name || 'Admin'}</h2>
            <span className="status-pill available">Dang hoat dong</span>
          </div>

          <div className="profile-content">
            {!editing ? (
              <>
                <div className="profile-info-list">
                  <ProfileField label="Email" value={profile?.email || auth?.user?.email} />
                  <ProfileField label="So dien thoai" value={profile?.phone} />
                  <ProfileField label="Dia chi" value={profile?.address} />
                  <ProfileField label="Vai tro" value={roleLabel} />
                  <ProfileField label="Luong" value={salaryLabel} />
                </div>

                <div className="profile-actions">
                  <button className="blue-btn" onClick={() => setEditing(true)} type="button">
                    <AppIcon name="edit" />
                    Chinh sua thong tin
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      if (auth?.role === 'ADMIN') {
                        setToast({ type: 'error', message: 'Tai khoan ADMIN khong duoc doi mat khau tai day' })
                        return
                      }
                      setPasswordModalOpen(true)
                    }}
                    type="button"
                  >
                    <AppIcon name="lock" />
                    Doi mat khau
                  </button>
                </div>
              </>
            ) : (
              <form className="profile-form" onSubmit={submitProfile}>
                <label className="field">
                  <span>Ho ten</span>
                  <input onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} />
                </label>
                <label className="field">
                  <span>So dien thoai</span>
                  <input onChange={(event) => updateField('phone', event.target.value)} required value={form.phone} />
                </label>
                <label className="field">
                  <span>Dia chi</span>
                  <input onChange={(event) => updateField('address', event.target.value)} value={form.address} />
                </label>
                {canEditSalary ? (
                  <label className="field">
                    <span>Luong</span>
                    <input min="0" onChange={(event) => updateField('salary', event.target.value)} type="number" value={form.salary} />
                  </label>
                ) : (
                  <div className="profile-readonly-field">
                    <span>Luong</span>
                    <strong>{salaryLabel}</strong>
                  </div>
                )}
                <label className="field">
                  <span>Anh dai dien</span>
                  <input accept="image/*" disabled={uploading} onChange={changeImage} type="file" />
                  {uploading && <small className="helper-text">Dang upload anh...</small>}
                  {uploadError && <small className="error-text">{uploadError}</small>}
                </label>

                <div className="profile-actions">
                  <button className="cancel-btn" disabled={saving} onClick={cancelEdit} type="button">
                    <AppIcon name="close" />
                    Huy
                  </button>
                  <button className="save-btn" disabled={saving || uploading} type="submit">
                    <AppIcon name="save" />
                    {saving ? 'Dang luu...' : 'Luu thay doi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      {passwordModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-modal password-modal" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
            <div className="modal-head detail-modal-head">
              <div>
                <p className="eyebrow">Bao mat</p>
                <h2 id="password-modal-title">Doi mat khau</h2>
              </div>
              <button className="icon-btn" disabled={saving} onClick={closePasswordModal} type="button" aria-label="Dong modal">
                <AppIcon name="close" />
              </button>
            </div>

            <form className="profile-form password-form" onSubmit={submitPassword}>
              <label className="field">
                <span>Mat khau hien tai</span>
                <input
                  autoComplete="current-password"
                  onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
                  required
                  type="password"
                  value={passwordForm.currentPassword}
                />
              </label>
              <label className="field">
                <span>Mat khau moi</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => updatePasswordField('newPassword', event.target.value)}
                  required
                  type="password"
                  value={passwordForm.newPassword}
                />
              </label>
              <label className="field">
                <span>Xac nhan mat khau</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
                  required
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </label>

              <div className="modal-actions form-wide">
                <button className="cancel-btn" disabled={saving} onClick={closePasswordModal} type="button">
                  <AppIcon name="close" />
                  Huy
                </button>
                <button className="save-btn" disabled={saving} type="submit">
                  <AppIcon name="save" />
                  {saving ? 'Dang luu...' : 'Xac nhan doi'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default ProfilePage
