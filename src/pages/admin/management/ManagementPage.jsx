import { useMemo, useState } from 'react'
import Toast from '../../../components/Toast'
import ResourceForm from '../../../features/resources/ResourceForm'
import ResourceLookup from '../../../features/resources/ResourceLookup'
import ResultPanel from '../../../features/resources/ResultPanel'
import { resources } from '../../../features/resources/resourceConfig'
import { buildDefaultPayload, defaultForm } from '../../../features/resources/resourceUtils'
import { request } from '../../../services/api'
import { deleteCloudImage, getCloudinaryPublicId } from '../../../services/uploadService'

function getResourceImageUrls(data) {
  if (!data || typeof data !== 'object') {
    return []
  }

  return ['image', 'thumbnail', 'photo', 'Photo']
    .map((field) => data[field])
    .filter(Boolean)
}

async function deleteCloudImagesByUrls(urls) {
  const publicIds = urls.map(getCloudinaryPublicId).filter(Boolean)
  if (publicIds.length === 0) {
    return
  }

  await Promise.allSettled(publicIds.map((publicId) => deleteCloudImage(publicId)))
}

function ManagementPage({ auth, resourceKey }) {
  const resource = useMemo(
    () => resources.find((item) => item.key === resourceKey),
    [resourceKey],
  )
  const [form, setForm] = useState(() => (resource ? defaultForm(resource.fields) : {}))
  const [lookupId, setLookupId] = useState('')
  const [result, setResult] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formCommitToken, setFormCommitToken] = useState(0)
  const [bookingStatus, setBookingStatus] = useState({ bookingId: '', status: 'CONFIRMED' })
  const isAdmin = auth?.role === 'ADMIN'

  if (!resource) {
    return (
      <section className="page-stack">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Admin module</p>
            <h1>Khong tim thay module</h1>
            <p className="muted-text">Resource key "{resourceKey}" chua duoc khai bao.</p>
          </div>
        </div>
      </section>
    )
  }

  const runAction = async (successMessage, action) => {
    setLoading(true)
    setToast(null)
    try {
      const response = await action()
      setToast({ type: 'success', message: successMessage })
      setResult(response)
      return response
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong the ket noi backend' })
      return null
    } finally {
      setLoading(false)
    }
  }

  const createRecord = async (event) => {
    event.preventDefault()
    const payload = resource.buildPayload ? resource.buildPayload(form) : buildDefaultPayload(resource, form)

    const response = await runAction('Tao du lieu thanh cong', () =>
      request(resource.endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )
    if (response) {
      setFormCommitToken((current) => current + 1)
      setForm(defaultForm(resource.fields))
    }
  }

  const fetchById = async () => {
    if (!lookupId) {
      setToast({ type: 'error', message: 'Nhap ID can tra cuu' })
      return
    }

    await runAction('Da tai du lieu', () => request(`${resource.endpoint}/${lookupId}`))
  }

  const deleteById = async () => {
    if (!lookupId) {
      setToast({ type: 'error', message: 'Nhap ID can xoa' })
      return
    }

    await runAction('Da xoa du lieu', async () => {
      const current = await request(`${resource.endpoint}/${lookupId}`)
      const imageUrls = getResourceImageUrls(current.data)
      const response = await request(`${resource.endpoint}/${lookupId}`, { method: 'DELETE' })
      await deleteCloudImagesByUrls(imageUrls)
      return response
    })
  }

  const updateBookingStatus = async (event) => {
    event.preventDefault()
    if (!bookingStatus.bookingId) {
      setToast({ type: 'error', message: 'Nhap ID booking' })
      return
    }

    await runAction('Da cap nhat trang thai booking', () =>
      request(`/bookings/${bookingStatus.bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: bookingStatus.status }),
      }),
    )
  }

  const cancelBooking = async () => {
    if (!bookingStatus.bookingId) {
      setToast({ type: 'error', message: 'Nhap ID booking' })
      return
    }

    await runAction('Da huy booking', () =>
      request(`/bookings/${bookingStatus.bookingId}/cancel`, { method: 'POST' }),
    )
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin module</p>
          <h1>{resource.label}</h1>
          <p className="muted-text">{resource.description}</p>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Endpoint</span>
          <strong>{resource.endpoint}</strong>
        </div>
        <div className="stat-card mint">
          <span>Fields</span>
          <strong>{resource.fields.length}</strong>
        </div>
        <div className="stat-card cream">
          <span>Trang thai</span>
          <strong>{loading ? 'Dang xu ly' : 'San sang'}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Tao moi</p>
            <h2>{resource.label}</h2>
          </div>
        </div>
        <ResourceForm
          commitToken={formCommitToken}
          form={form}
          loading={loading}
          onReset={() => setForm(defaultForm(resource.fields))}
          onSubmit={createRecord}
          onUpdateField={(field, value) =>
            setForm((current) => ({
              ...current,
              [field]: value,
            }))
          }
          resource={resource}
        />
      </section>

      <ResourceLookup
        activeKey={resource.key}
        bookingStatus={bookingStatus}
        canDelete={isAdmin}
        loading={loading}
        lookupId={lookupId}
        onCancelBooking={cancelBooking}
        onDeleteById={deleteById}
        onFetchById={fetchById}
        onLoadEmployees={() => runAction('Da tai danh sach nhan vien', () => request('/employees'))}
        onLookupIdChange={(event) => setLookupId(event.target.value)}
        onStatusChange={(field, value) =>
          setBookingStatus((current) => ({
            ...current,
            [field]: value,
          }))
        }
        onSubmitStatus={updateBookingStatus}
      />

      <ResultPanel result={result} />
    </section>
  )
}

export default ManagementPage
