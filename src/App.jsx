import { useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const AUTH_STORAGE_KEY = 'homestay_auth'

const bookingStatuses = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW',
]

const resources = [
  {
    key: 'bookings',
    label: 'Dat phong',
    endpoint: '/bookings',
    description: 'Tao booking, tinh tien theo bang gia va cap nhat trang thai.',
    fields: [
      { name: 'customerId', label: 'ID khach hang', type: 'number', required: true },
      { name: 'employeeId', label: 'ID nhan vien', type: 'number' },
      { name: 'roomId', label: 'ID phong', type: 'number', required: true },
      { name: 'checkIn', label: 'Check-in', type: 'datetime-local', required: true },
      { name: 'checkOut', label: 'Check-out', type: 'datetime-local', required: true },
      { name: 'guestCount', label: 'So khach', type: 'number', required: true },
    ],
    buildPayload: (data) => ({
      customerId: toNumber(data.customerId),
      employeeId: optionalNumber(data.employeeId),
      roomId: toNumber(data.roomId),
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestCount: toNumber(data.guestCount),
    }),
  },
  {
    key: 'customers',
    label: 'Khach hang',
    endpoint: '/customers',
    description: 'Thong tin lien he va tai khoan khach hang.',
    fields: profileFields(true),
  },
  {
    key: 'employees',
    label: 'Nhan vien',
    endpoint: '/employees',
    description: 'Nhan su van hanh homestay, co lien ket vai tro.',
    fields: [
      { name: 'name', label: 'Ho ten', required: true },
      { name: 'salary', label: 'Luong', type: 'number' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Mat khau', type: 'password', required: true },
      { name: 'phone', label: 'So dien thoai', required: true },
      { name: 'address', label: 'Dia chi' },
      { name: 'image', label: 'Anh dai dien URL' },
      { name: 'roleId', label: 'ID vai tro', type: 'number' },
    ],
    buildPayload: (data) => ({
      name: data.name,
      salary: optionalNumber(data.salary),
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: data.address,
      image: data.image,
      role: nestedId(data.roleId),
    }),
  },
  {
    key: 'branches',
    label: 'Chi nhanh',
    endpoint: '/branches',
    description: 'Co so homestay, dia chi, hotline va anh dai dien.',
    fields: [
      { name: 'name', label: 'Ten chi nhanh', required: true },
      { name: 'address', label: 'Dia chi', required: true },
      { name: 'phone', label: 'So dien thoai', required: true },
      { name: 'image', label: 'Anh URL' },
    ],
  },
  {
    key: 'roomTypes',
    label: 'Loai phong',
    endpoint: '/roomTypes',
    description: 'Loai phong, suc chua va mo ta.',
    fields: [
      { name: 'name', label: 'Ten loai phong', required: true },
      { name: 'description', label: 'Mo ta' },
      { name: 'maxGuest', label: 'So khach toi da', type: 'number', required: true },
      { name: 'image', label: 'Anh URL' },
    ],
    buildPayload: (data) => ({
      name: data.name,
      description: data.description,
      maxGuest: toNumber(data.maxGuest),
      image: data.image,
    }),
  },
  {
    key: 'rooms',
    label: 'Phong',
    endpoint: '/rooms',
    description: 'Phong thuc te gan voi chi nhanh va loai phong.',
    fields: [
      { name: 'branchId', label: 'ID chi nhanh', type: 'number', required: true },
      { name: 'roomTypeId', label: 'ID loai phong', type: 'number', required: true },
      { name: 'number', label: 'So phong', type: 'number', required: true },
      { name: 'area', label: 'Dien tich', type: 'number', required: true },
      { name: 'thumbnail', label: 'Anh phong URL' },
    ],
    buildPayload: (data) => ({
      branch: nestedId(data.branchId),
      roomType: nestedId(data.roomTypeId),
      number: toNumber(data.number),
      area: Number(data.area || 0),
      thumbnail: data.thumbnail,
    }),
  },
  {
    key: 'roomPricings',
    label: 'Bang gia',
    endpoint: '/roomPricings',
    description: 'Gia ngay thuong, cuoi tuan, ngay le theo loai phong.',
    fields: [
      { name: 'roomTypeId', label: 'ID loai phong', type: 'number', required: true },
      { name: 'baseDuration', label: 'Don vi tinh', placeholder: 'NIGHT', required: true },
      { name: 'basePrice', label: 'Gia co ban', type: 'number', required: true },
      { name: 'weekendPrice', label: 'Gia cuoi tuan', type: 'number', required: true },
      { name: 'holidayPrice', label: 'Gia ngay le', type: 'number', required: true },
      { name: 'startDate', label: 'Bat dau', type: 'datetime-local', required: true },
      { name: 'endDate', label: 'Ket thuc', type: 'datetime-local' },
      { name: 'policy', label: 'Chinh sach' },
      { name: 'status', label: 'Dang ap dung', type: 'checkbox' },
    ],
    buildPayload: (data) => ({
      roomType: nestedId(data.roomTypeId),
      baseDuration: data.baseDuration,
      basePrice: optionalNumber(data.basePrice),
      weekendPrice: optionalNumber(data.weekendPrice),
      holidayPrice: optionalNumber(data.holidayPrice),
      startDate: data.startDate,
      endDate: data.endDate || null,
      policy: data.policy,
      status: Boolean(data.status),
    }),
  },
  {
    key: 'categories',
    label: 'Nhom tien ich',
    endpoint: '/categories',
    description: 'Nhom phan loai tien ich.',
    fields: [
      { name: 'name', label: 'Ten nhom', required: true },
      { name: 'description', label: 'Mo ta' },
    ],
  },
  {
    key: 'amenities',
    label: 'Tien ich',
    endpoint: '/amenities',
    description: 'Tien ich gan voi nhom tien ich.',
    fields: [
      { name: 'categoryId', label: 'ID nhom tien ich', type: 'number' },
      { name: 'name', label: 'Ten tien ich', required: true },
    ],
    buildPayload: (data) => ({
      category: nestedId(data.categoryId),
      name: data.name,
    }),
  },
  {
    key: 'roles',
    label: 'Vai tro',
    endpoint: '/roles',
    description: 'Vai tro nhan vien.',
    fields: [
      { name: 'name', label: 'Ten vai tro', required: true },
      { name: 'description', label: 'Mo ta' },
    ],
  },
  {
    key: 'roomPhotos',
    label: 'Anh phong',
    endpoint: '/roomPhotos',
    description: 'Anh bo sung cho phong.',
    fields: [
      { name: 'roomId', label: 'ID phong', type: 'number', required: true },
      { name: 'photo', label: 'Anh URL', required: true },
    ],
    buildPayload: (data) => ({
      room: nestedId(data.roomId),
      photo: data.photo,
    }),
  },
]

function profileFields(includePassword) {
  return [
    { name: 'email', label: 'Email', type: 'email', required: true },
    includePassword && { name: 'password', label: 'Mat khau', type: 'password', required: true },
    { name: 'name', label: 'Ho ten', required: true },
    { name: 'phone', label: 'So dien thoai', required: true },
    { name: 'address', label: 'Dia chi' },
    { name: 'image', label: 'Anh dai dien URL' },
  ].filter(Boolean)
}

function toNumber(value) {
  return Number(value || 0)
}

function optionalNumber(value) {
  return value === '' || value === undefined ? null : Number(value)
}

function nestedId(value) {
  const id = optionalNumber(value)
  return id ? { id } : null
}

function defaultForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? true : ''
    return acc
  }, {})
}

function buildDefaultPayload(resource, data) {
  return resource.fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'number' ? optionalNumber(data[field.name]) : data[field.name]
    return acc
  }, {})
}

async function request(path, options = {}) {
  const auth = readStoredAuth()
  const token = auth?.token
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok || (body?.status && body.status >= 400)) {
    throw new Error(body?.message || `HTTP ${response.status}`)
  }

  return body
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function App() {
  const [auth, setAuth] = useState(readStoredAuth)
  const [activeKey, setActiveKey] = useState('bookings')
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

  const saveAuth = (loginData) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loginData))
    setAuth(loginData)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }

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

  if (!auth) {
    return <AuthPage onLogin={saveAuth} />
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <p>Homestay Manager</p>
            <small>Quan ly van hanh</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Chuc nang">
          {resources.map((resource) => (
            <button
              className={resource.key === activeKey ? 'nav-item active' : 'nav-item'}
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
              <small>{auth.userType} / {auth.user?.role}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} type="button">
            Dang xuat
          </button>
        </div>
        </header>

        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

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

            <form className="resource-form" onSubmit={createRecord}>
              {activeResource.fields.map((field) => (
                <label className={field.type === 'checkbox' ? 'check-field' : 'field'} key={field.name}>
                  <span>{field.label}</span>
                  {field.type === 'checkbox' ? (
                    <input
                      checked={Boolean(forms[activeKey][field.name])}
                      onChange={(event) => setField(activeKey, field.name, event.target.checked)}
                      type="checkbox"
                    />
                  ) : (
                    <input
                      onChange={(event) => setField(activeKey, field.name, event.target.value)}
                      placeholder={field.placeholder || ''}
                      required={field.required}
                      type={field.type || 'text'}
                      value={forms[activeKey][field.name]}
                    />
                  )}
                </label>
              ))}

              <div className="form-actions">
                <button className="primary-btn" disabled={loading} type="submit">
                  Tao du lieu
                </button>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() =>
                    setForms((current) => ({
                      ...current,
                      [activeKey]: defaultForm(activeResource.fields),
                    }))
                  }
                >
                  Lam moi form
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Tra cuu</p>
                <h2>Lay hoac xoa theo ID</h2>
              </div>
            </div>

            <div className="lookup-row">
              <label className="field compact">
                <span>ID</span>
                <input
                  min="1"
                  onChange={(event) =>
                    setLookupIds((current) => ({ ...current, [activeKey]: event.target.value }))
                  }
                  type="number"
                  value={lookupIds[activeKey] || ''}
                />
              </label>
              <button className="secondary-btn" disabled={loading} onClick={fetchById} type="button">
                Lay du lieu
              </button>
              <button className="danger-btn" disabled={loading} onClick={deleteById} type="button">
                Xoa
              </button>
            </div>

            {activeKey === 'employees' && (
              <button className="wide-btn" disabled={loading} onClick={loadEmployees} type="button">
                Tai danh sach nhan vien
              </button>
            )}

            {activeKey === 'bookings' && (
              <form className="status-box" onSubmit={updateBookingStatus}>
                <h3>Cap nhat booking</h3>
                <div className="lookup-row">
                  <label className="field compact">
                    <span>ID booking</span>
                    <input
                      min="1"
                      onChange={(event) =>
                        setStatusForm((current) => ({ ...current, bookingId: event.target.value }))
                      }
                      type="number"
                      value={statusForm.bookingId}
                    />
                  </label>
                  <label className="field compact">
                    <span>Trang thai</span>
                    <select
                      onChange={(event) =>
                        setStatusForm((current) => ({ ...current, status: event.target.value }))
                      }
                      value={statusForm.status}
                    >
                      {bookingStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-actions">
                  <button className="primary-btn" disabled={loading} type="submit">
                    Cap nhat
                  </button>
                  <button className="danger-btn" disabled={loading} onClick={cancelBooking} type="button">
                    Huy booking
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <section className="panel result-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Ket qua API</p>
              <h2>Response gan nhat</h2>
            </div>
          </div>
          {activeResult ? (
            <pre>{JSON.stringify(activeResult, null, 2)}</pre>
          ) : (
            <div className="empty-state">
              Chua co du lieu. Hay tao moi hoac tra cuu mot ban ghi tu backend.
            </div>
          )}
        </section>

        {employees.length > 0 && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Nhan su</p>
                <h2>Danh sach nhan vien</h2>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ho ten</th>
                    <th>Email</th>
                    <th>Dien thoai</th>
                    <th>Vai tro</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.role?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const submitLogin = async (event) => {
    event.preventDefault()
    await submitAuth('/auth/login', loginForm, 'Dang nhap thanh cong')
  }

  const submitRegister = async (event) => {
    event.preventDefault()
    await submitAuth('/auth/customer/register', registerForm, 'Dang ky thanh cong')
  }

  const submitAuth = async (path, payload, successMessage) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await request(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      onLogin(response.data)
      setMessage({ type: 'success', text: successMessage })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Khong the dang nhap' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand auth-brand">
            <span className="brand-mark">H</span>
            <div>
              <p>Homestay Manager</p>
              <small>Dang nhap bang JWT</small>
            </div>
          </div>
          <h1>Quan ly dat phong, phong va nhan su trong mot man hinh.</h1>
          <p>
            Employee va customer dang nhap chung qua email/password. Customer co the dang ky
            tai khoan moi, token duoc luu trong localStorage.
          </p>
          <div className="auth-facts">
            <span>POST /auth/login</span>
            <span>24h access token</span>
            <span>Role tu employee.roles</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="mode-switch">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
              type="button"
            >
              Dang nhap
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
              type="button"
            >
              Dang ky customer
            </button>
          </div>

          {message && <div className={`toast ${message.type}`}>{message.text}</div>}

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={submitLogin}>
              <label className="field">
                <span>Email</span>
                <input
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  type="email"
                  value={loginForm.email}
                />
              </label>
              <label className="field">
                <span>Mat khau</span>
                <input
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                  type="password"
                  value={loginForm.password}
                />
              </label>
              <button className="primary-btn" disabled={loading} type="submit">
                Dang nhap
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={submitRegister}>
              <label className="field">
                <span>Ho ten</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  value={registerForm.name}
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  type="email"
                  value={registerForm.email}
                />
              </label>
              <label className="field">
                <span>Mat khau</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                  type="password"
                  value={registerForm.password}
                />
              </label>
              <label className="field">
                <span>So dien thoai</span>
                <input
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  required
                  value={registerForm.phone}
                />
              </label>
              <button className="primary-btn" disabled={loading} type="submit">
                Tao tai khoan customer
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
