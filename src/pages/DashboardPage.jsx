import { useMemo, useState } from 'react'
import Brand from '../components/Brand'
import Toast from '../components/Toast'
import EmployeesTable from '../features/employees/EmployeesTable'
import ResourceForm from '../features/resources/ResourceForm'
import ResourceLookup from '../features/resources/ResourceLookup'
import ResultPanel from '../features/resources/ResultPanel'
import { resources } from '../features/resources/resourceConfig'
import { buildDefaultPayload, defaultForm } from '../features/resources/resourceUtils'
import { request } from '../services/api'

function DashboardPage({ auth, onLogout }) {
  const [activeKey, setActiveKey] = useState('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [forms, setForms] = useState(() =>
    Object.fromEntries(resources.map((resource) => [resource.key, defaultForm(resource.fields)])),
  )
  const [lookupIds, setLookupIds] = useState({})
  const [results, setResults] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const [statusForm, setStatusForm] = useState({ bookingId: '', status: 'CONFIRMED' })

  const activeResource = useMemo(
    () => resources.find((resource) => resource.key === activeKey),
    [activeKey],
  )
  const activeResult = results[activeKey]

  const setField = (resourceKey, field, value) => {
    setForms((current) => ({
      ...current,
      [resourceKey]: {
        ...current[resourceKey],
        [field]: value,
      },
    }))
  }

  const runAction = async (successMessage, action) => {
    setLoading(true)
    setToast(null)
    try {
      const response = await action()
      setToast({ type: 'success', message: successMessage })
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
    const resource = activeResource
    const data = forms[resource.key]
    const payload = resource.buildPayload
      ? resource.buildPayload(data)
      : buildDefaultPayload(resource, data)

    const response = await runAction('Tao du lieu thanh cong', () =>
      request(resource.endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )

    if (response) {
      setResults((current) => ({ ...current, [resource.key]: response }))
    }
  }

  const fetchById = async () => {
    const id = lookupIds[activeKey]
    if (!id) {
      setToast({ type: 'error', message: 'Nhap ID can tra cuu' })
      return
    }

    const response = await runAction('Da tai du lieu', () =>
      request(`${activeResource.endpoint}/${id}`),
    )

    if (response) {
      setResults((current) => ({ ...current, [activeKey]: response }))
    }
  }

  const deleteById = async () => {
    const id = lookupIds[activeKey]
    if (!id) {
      setToast({ type: 'error', message: 'Nhap ID can xoa' })
      return
    }

    const response = await runAction('Da xoa du lieu', () =>
      request(`${activeResource.endpoint}/${id}`, { method: 'DELETE' }),
    )

    if (response) {
      setResults((current) => ({ ...current, [activeKey]: response }))
    }
  }

  const loadEmployees = async () => {
    const response = await runAction('Da tai danh sach nhan vien', () => request('/employees'))
    if (response?.data) {
      setEmployees(response.data)
      setResults((current) => ({ ...current, employees: response }))
    }
  }

  const updateBookingStatus = async (event) => {
    event.preventDefault()
    if (!statusForm.bookingId) {
      setToast({ type: 'error', message: 'Nhap ID booking' })
      return
    }

    const response = await runAction('Da cap nhat trang thai booking', () =>
      request(`/bookings/${statusForm.bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusForm.status }),
      }),
    )

    if (response) {
      setResults((current) => ({ ...current, bookings: response }))
    }
  }

  const cancelBooking = async () => {
    if (!statusForm.bookingId) {
      setToast({ type: 'error', message: 'Nhap ID booking' })
      return
    }

    const response = await runAction('Da huy booking', () =>
      request(`/bookings/${statusForm.bookingId}/cancel`, { method: 'POST' }),
    )

    if (response) {
      setResults((current) => ({ ...current, bookings: response }))
    }
  }

  return (
    <main className={sidebarOpen ? 'app-shell' : 'app-shell sidebar-collapsed'}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <Brand />
          <button
            aria-label={sidebarOpen ? 'Thu gon sidebar' : 'Mo sidebar'}
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
            title={sidebarOpen ? 'Thu gon sidebar' : 'Mo sidebar'}
            type="button"
          >
            <span>{sidebarOpen ? '<' : '>'}</span>
          </button>
        </div>

        <nav className="nav-list" aria-label="Chuc nang">
          {resources.map((resource) => (
            <button
              className={resource.key === activeKey ? 'nav-item active' : 'nav-item'}
              data-initial={resource.label.charAt(0)}
              key={resource.key}
              type="button"
              onClick={() => setActiveKey(resource.key)}
            >
              <span>{resource.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setSidebarOpen((current) => !current)}
          type="button"
        >
          {sidebarOpen ? 'Dong menu' : 'Mo menu'}
        </button>

        <header className="topbar">
          <div>
            <p className="eyebrow">Spring Boot API</p>
            <h1>{activeResource.label}</h1>
            <p className="subtitle">{activeResource.description}</p>
          </div>
          <div className="connection">
            <div className="connection-info">
              <span className="dot"></span>
              <div>
                <strong>{auth.user?.name || auth.user?.email}</strong>
                <small>
                  {auth.userType} / {auth.user?.role}
                </small>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout} type="button">
              Dang xuat
            </button>
          </div>
        </header>

        <Toast message={toast?.message} type={toast?.type} />

        <section className="stats-grid" aria-label="Tong quan">
          <div className="metric">
            <span>Endpoint dang chon</span>
            <strong>{activeResource.endpoint}</strong>
          </div>
          <div className="metric">
            <span>Resource API</span>
            <strong>{resources.length}</strong>
          </div>
          <div className="metric">
            <span>Nhan vien da tai</span>
            <strong>{employees.length}</strong>
          </div>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Tao moi</p>
                <h2>{activeResource.label}</h2>
              </div>
              {loading && <span className="loading">Dang xu ly</span>}
            </div>

            <ResourceForm
              form={forms[activeKey]}
              loading={loading}
              resource={activeResource}
              onReset={() =>
                setForms((current) => ({
                  ...current,
                  [activeKey]: defaultForm(activeResource.fields),
                }))
              }
              onSubmit={createRecord}
              onUpdateField={(field, value) => setField(activeKey, field, value)}
            />
          </section>

          <ResourceLookup
            activeKey={activeKey}
            bookingStatus={statusForm}
            loading={loading}
            lookupId={lookupIds[activeKey]}
            onCancelBooking={cancelBooking}
            onDeleteById={deleteById}
            onFetchById={fetchById}
            onLoadEmployees={loadEmployees}
            onLookupIdChange={(event) =>
              setLookupIds((current) => ({ ...current, [activeKey]: event.target.value }))
            }
            onStatusChange={(field, value) =>
              setStatusForm((current) => ({ ...current, [field]: value }))
            }
            onSubmitStatus={updateBookingStatus}
          />
        </div>

        <ResultPanel result={activeResult} />
        <EmployeesTable employees={employees} />
      </section>
    </main>
  )
}

export default DashboardPage
