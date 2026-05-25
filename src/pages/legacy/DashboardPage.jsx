import { useMemo, useState } from 'react'
import AppIcon from '../../components/AppIcon'
import Brand from '../../components/Brand'
import Toast from '../../components/Toast'
import EmployeesTable from '../../features/employees/EmployeesTable'
import ResourceForm from '../../features/resources/ResourceForm'
import ResourceLookup from '../../features/resources/ResourceLookup'
import ResultPanel from '../../features/resources/ResultPanel'
import { resources } from '../../features/resources/resourceConfig'
import { buildDefaultPayload, defaultForm } from '../../features/resources/resourceUtils'
import { request } from '../../services/api'

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
      setToast({ type: 'error', message: error.message || 'Không thể kết nối backend' })
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

    const response = await runAction('Tạo dữ liệu thành công', () =>
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
      setToast({ type: 'error', message: 'Nhập thông tin cần tra cứu' })
      return
    }

    const response = await runAction('Đã tải dữ liệu', () =>
      request(`${activeResource.endpoint}/${id}`),
    )

    if (response) {
      setResults((current) => ({ ...current, [activeKey]: response }))
    }
  }

  const deleteById = async () => {
    const id = lookupIds[activeKey]
    if (!id) {
      setToast({ type: 'error', message: 'Nhập thông tin cần xóa' })
      return
    }

    const response = await runAction('Đã xóa dữ liệu', () =>
      request(`${activeResource.endpoint}/${id}`, { method: 'DELETE' }),
    )

    if (response) {
      setResults((current) => ({ ...current, [activeKey]: response }))
    }
  }

  const loadEmployees = async () => {
    const response = await runAction('Đã tải danh sách nhân viên', () => request('/employees'))
    if (response?.data) {
      setEmployees(response.data)
      setResults((current) => ({ ...current, employees: response }))
    }
  }

  const updateBookingStatus = async (event) => {
    event.preventDefault()
    if (!statusForm.bookingId) {
      setToast({ type: 'error', message: 'Nhập booking cần thao tác' })
      return
    }

    const response = await runAction('Đã cập nhật trạng thái booking', () =>
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
      setToast({ type: 'error', message: 'Nhập booking cần thao tác' })
      return
    }

    const response = await runAction('Đã hủy booking', () =>
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
            aria-label={sidebarOpen ? 'Thu gọn sidebar' : 'Mở sidebar'}
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
            title={sidebarOpen ? 'Thu gọn sidebar' : 'Mở sidebar'}
            type="button"
          >
            <AppIcon name={sidebarOpen ? 'chevronLeft' : 'chevronRight'} />
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
          <AppIcon name={sidebarOpen ? 'close' : 'menu'} />
          {sidebarOpen ? 'Đóng menu' : 'Mở menu'}
        </button>

        <header className="topbar">
          <div>
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
            <button className="cancel-btn logout-btn" onClick={onLogout} type="button">
              <AppIcon name="logout" />
              Đăng xuất
            </button>
          </div>
        </header>

        <Toast message={toast?.message} type={toast?.type} />

        <section className="stats-grid" aria-label="Tổng quan">
          <div className="metric">
            <span>Endpoint đang chọn</span>
            <strong>{activeResource.endpoint}</strong>
          </div>
          <div className="metric">
            <span>Resource API</span>
            <strong>{resources.length}</strong>
          </div>
          <div className="metric">
            <span>Nhân viên da tai</span>
            <strong>{employees.length}</strong>
          </div>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{activeResource.label}</h2>
              </div>
              {loading && <span className="loading">Đang xử lý</span>}
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

