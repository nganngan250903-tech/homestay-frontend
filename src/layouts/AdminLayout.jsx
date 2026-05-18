import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: 'D', end: true },
  { label: 'Dat phong', path: '/admin/bookings', icon: 'B' },
  { label: 'Thanh toan', path: '/admin/payments', icon: 'P' },
  { label: 'Phong', path: '/admin/rooms', icon: 'R' },
  { label: 'Tien nghi', path: '/admin/amenities', icon: 'A' },
  { label: 'Khach hang', path: '/admin/customers', icon: 'C' },
  { label: 'Nhan vien', path: '/admin/employees', icon: 'E' },
  { label: 'Thong ke', path: '/admin/reports', icon: 'S' },
]

function AdminLayout({ auth, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const adminName = auth?.user?.name || auth?.user?.email || 'ADMIN'

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
            aria-label="Dong menu"
          >
            x
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {menuItems.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
              end={item.end}
              key={item.path}
              onClick={() => setSidebarOpen(false)}
              to={item.path}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button className="admin-nav-link logout-link" onClick={logout} type="button">
            <span className="nav-icon">L</span>
            <span>Dang xuat</span>
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
            =
          </button>
          <Brand subtitle="Admin dashboard" />
          <div className="admin-profile">
            <span className="avatar">A</span>
            <div>
              <strong>{adminName}</strong>
              <small>ADMIN</small>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </section>
    </div>
  )
}

export default AdminLayout
