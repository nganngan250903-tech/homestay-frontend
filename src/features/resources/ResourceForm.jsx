import { useEffect, useRef, useState } from 'react'
import AppIcon from '../../components/AppIcon'
import { deleteCloudImage, uploadImage } from '../../services/uploadService'

const imageFieldNames = new Set(['image', 'thumbnail', 'photo'])
const uploadFolders = {
  branches: 'branches',
  customers: 'customers',
  employees: 'employees',
  roomPhotos: 'room-photos',
  rooms: 'rooms',
  roomTypes: 'room-types',
}

async function deleteUploadedImage(publicId) {
  if (!publicId) return
  try {
    await deleteCloudImage(publicId)
  } catch {
    // Temporary upload cleanup should not block the form.
  }
}

function ResourceForm({ commitToken, form, loading, onReset, onSubmit, onUpdateField, resource }) {
  const [uploadingField, setUploadingField] = useState('')
  const [uploadError, setUploadError] = useState('')
  const tempUploadsRef = useRef({})

  useEffect(() => {
    tempUploadsRef.current = {}
  }, [commitToken])

  useEffect(() => () => {
    Object.values(tempUploadsRef.current).forEach((upload) => deleteUploadedImage(upload.publicId))
    tempUploadsRef.current = {}
  }, [])

  const changeImageField = async (field, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingField(field.name)
    setUploadError('')
    try {
      const uploaded = await uploadImage(file, uploadFolders[resource.key] || 'rooms')
      await deleteUploadedImage(tempUploadsRef.current[field.name]?.publicId)
      tempUploadsRef.current[field.name] = uploaded.publicId ? { publicId: uploaded.publicId, url: uploaded.url } : null
      onUpdateField(field.name, uploaded.url)
    } catch (error) {
      setUploadError(error.message || 'Không thể upload ảnh.')
    } finally {
      setUploadingField('')
    }
  }

  const resetForm = () => {
    Object.values(tempUploadsRef.current).forEach((upload) => deleteUploadedImage(upload.publicId))
    tempUploadsRef.current = {}
    setUploadError('')
    onReset()
  }

  return (
    <form className="resource-form" onSubmit={onSubmit}>
      {resource.fields.map((field) => {
        const isImageField = imageFieldNames.has(field.name)
        return (
          <label className={field.type === 'checkbox' ? 'check-field' : 'field'} key={field.name}>
            <span>{field.label.replace(' URL', '')}</span>
            {field.type === 'checkbox' ? (
              <input
                checked={Boolean(form[field.name])}
                onChange={(event) => onUpdateField(field.name, event.target.checked)}
                type="checkbox"
              />
            ) : isImageField ? (
              <>
                <input
                  accept="image/*"
                  disabled={loading || Boolean(uploadingField)}
                  onChange={(event) => changeImageField(field, event)}
                  required={field.required && !form[field.name]}
                  type="file"
                />
                {uploadingField === field.name && <small className="helper-text">Đang upload ảnh...</small>}
                {form[field.name] && <small className="helper-text">Đã upload ảnh</small>}
              </>
            ) : (
              <input
                onChange={(event) => onUpdateField(field.name, event.target.value)}
                placeholder={field.placeholder || ''}
                required={field.required}
                type={field.type || 'text'}
                value={form[field.name]}
              />
            )}
          </label>
        )
      })}

      {uploadError && <small className="error-text">{uploadError}</small>}

      <div className="form-actions">
        <button className="save-btn" disabled={loading || Boolean(uploadingField)} type="submit">
          <AppIcon name="save" />
          Tạo dữ liệu
        </button>
        <button className="cancel-btn" type="button" onClick={resetForm}>
          <AppIcon name="reset" />
          Làm mới form
        </button>
      </div>
    </form>
  )
}

export default ResourceForm
