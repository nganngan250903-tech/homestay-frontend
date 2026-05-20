import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import AppIcon from '../components/AppIcon'
import Brand from '../components/Brand'
import EmployeeAvatar from '../pages/admin/employees/EmployeeAvatar'
import { getEmployee } from '../services/employeeService'

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard', end: true, roles: ['ADMIN'] },
  { label: 'Đặt phòng', path: '/admin/bookings', icon: 'calendar', roles: ['ADMIN', 'EMPLOYEE'] },
  { label: 'Thanh toan', path: '/admin/payments', icon: 'wallet', roles: ['ADMIN', 'EMPLOYEE'] },
  { label: 'Phòng', path: '/admin/rooms', icon: 'bed', roles: ['ADMIN', 'EMPLOYEE'] },
  { label: 'Tien nghi', path: '/admin/amenities', icon: 'sparkles', roles: ['ADMIN'] },
  { label: 'Khách hàng', path: '/admin/customers', icon: 'users', roles: ['ADMIN', 'EMPLOYEE'] },
  { label: 'Nhân viên', path: '/admin/employees', icon: 'badge', roles: ['ADMIN'] },
  { label: 'Ho so', path: '/admin/profile', icon: 'profile', roles: ['ADMIN', 'EMPLOYEE'] },
]

const iconPaths = {
  dashboard: (
    <>
      <path d="M4 5h6v6H4z" />
      <path d="M14 5h6v4h-6z" />
      <path d="M14 13h6v6h-6z" />
      <path d="M4 15h6v4H4z" />
    </>
  ),
  calendar: (
    <>
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <path d="M4 8h16" />
      <path d="M5 5h14v15H5z" />
      <path d="M8 12h3" />
      <path d="M13 12h3" />
      <path d="M8 16h3" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7h15a2 2 0 0 1 2 2v9H4z" />
      <path d="M4 7l12-3v3" />
      <path d="M16 13h5" />
      <path d="M17.5 13h.1" />
    </>
  ),
  bed: (
    <>
      <path d="M4 11V5" />
      <path d="M20 19v-6a2 2 0 0 0-2-2H4v8" />
      <path d="M4 15h16" />
      <path d="M7 8h4v3H7z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8z" />
      <path d="M18 15l.7 1.8 1.8.7-1.8.7L18 21l-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  users: (
    <>
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M17 11a3 3 0 1 0-1.8-5.4" />
      <path d="M17 15a5 5 0 0 1 4 4" />
    </>
  ),
  badge: (
    <>
      <path d="M8 3h8l2 4-6 14L6 7z" />
      <path d="M9 7h6" />
      <path d="M10 12h4" />
    </>
  ),
  profile: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </>
  ),
}

function SidebarIcon({ name }) {
  return (
    <svg aria-hidden="true" className="nav-svg" fill="none" viewBox="0 0 24 24">
      {iconPaths[name]}
    </svg>
  )
}

function AdminLayout({ auth, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const userId = auth?.user?.id
  const userType = auth?.userType
  const role = auth?.role || 'EMPLOYEE'
  const adminName = profile?.name || auth?.user?.name || auth?.user?.email || 'ADMIN'
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(role))

  const loadProfile = useCallback(async () => {
    if (!userId || userType !== 'EMPLOYEE') return
    try {
      setProfile(await getEmployee(userId))
    } catch {
      setProfile(null)
    }
  }, [userId, userType])

  useEffect(() => {
    Promise.resolve().then(loadProfile)
  }, [loadProfile])

  const logout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={sidebarOpen ? 'admin-shell sidebar-open' : 'admin-shell'}>
      <aside className="admin-sidebar">
        <div className="sidebar-head">
          <Brand />
          <button
            className="icon-btn mobile-only"
            onClick={() => setSidebarOpen(false)}
            type="button"
            aria-label="Đóng menu"
          >
            <AppIcon name="close" />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {visibleMenuItems.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
              end={item.end}
              key={item.path}
              onClick={() => setSidebarOpen(false)}
              to={item.path}
            >
              <span className="nav-icon">
                <SidebarIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button className="admin-nav-link logout-link" onClick={logout} type="button">
            <span className="nav-icon">
              <SidebarIcon name="logout" />
            </span>
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>

      <section className="admin-workspace">
        <header className="admin-header">
          <button
            className="icon-btn mobile-only"
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Mo menu"
          >
            <AppIcon name="menu" />
          </button>
          <Brand subtitle="Admin dashboard" />
          <button className="admin-profile profile-trigger" onClick={() => navigate('/admin/profile')} type="button">
            <EmployeeAvatar employee={profile || auth?.user} />
            <div>
              <strong>{adminName}</strong>
            </div>
          </button>
        </header>

        <main className="admin-content">
          <Outlet context={{ profile, reloadProfile: loadProfile }} />
        </main>
      </section>
    </div>
  )
}

export default AdminLayout
