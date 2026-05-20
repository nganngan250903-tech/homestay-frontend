import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import DashboardHomePage from '../pages/DashboardHomePage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import AmenityPage from '../pages/amenities/AmenityPage'
import CustomerPage from '../pages/customers/CustomerPage'
import EmployeePage from '../pages/employees/EmployeePage'
import PlaceholderPage from '../pages/PlaceholderPage'
import ManagementPage from '../pages/management/ManagementPage'
import ProfilePage from '../pages/profile/ProfilePage'
import RoomTypePage from '../pages/roomTypes/RoomTypePage'
import RoomPage from '../pages/rooms/RoomPage'

function getDefaultPath(auth) {
  if (!auth) {
    return '/login'
  }

  return ['ADMIN', 'EMPLOYEE'].includes(auth.role) ? '/admin' : '/home'
}

function RequireAuth({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RequireStaff({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (!['ADMIN', 'EMPLOYEE'].includes(auth.role)) {
    return <Navigate to="/home" replace />
  }

  return children
}

function RequireRole({ auth, roles, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(auth.role)) {
    return <Navigate to={getDefaultPath(auth)} replace />
  }

  return children
}

function AppRoutes({ auth, onLogin, onLogout }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to={getDefaultPath(auth)} replace /> : <LoginPage onLogin={onLogin} />}
      />
      <Route
        path="/home"
        element={
          <RequireAuth auth={auth}>
            <HomePage auth={auth} onLogout={onLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireStaff auth={auth}>
            <AdminLayout auth={auth} onLogout={onLogout} />
          </RequireStaff>
        }
      >
        <Route index element={auth?.role === 'ADMIN' ? <DashboardHomePage /> : <Navigate to="/admin/bookings" replace />} />
        <Route path="bookings" element={<ManagementPage auth={auth} resourceKey="bookings" />} />
        <Route path="payments" element={<PlaceholderPage title="Thanh toan" endpoint="/payments" />} />
        <Route path="rooms" element={<RoomPage auth={auth} />} />
        <Route path="room-types" element={<RequireRole auth={auth} roles={['ADMIN']}><RoomTypePage /></RequireRole>} />
        <Route path="room-pricings" element={<RequireRole auth={auth} roles={['ADMIN']}><ManagementPage auth={auth} resourceKey="roomPricings" /></RequireRole>} />
        <Route path="room-photos" element={<RequireRole auth={auth} roles={['ADMIN']}><ManagementPage auth={auth} resourceKey="roomPhotos" /></RequireRole>} />
        <Route path="branches" element={<RequireRole auth={auth} roles={['ADMIN']}><ManagementPage auth={auth} resourceKey="branches" /></RequireRole>} />
        <Route path="categories" element={<RequireRole auth={auth} roles={['ADMIN']}><AmenityPage /></RequireRole>} />
        <Route path="amenities" element={<RequireRole auth={auth} roles={['ADMIN']}><AmenityPage /></RequireRole>} />
        <Route path="customers" element={<CustomerPage auth={auth} />} />
        <Route path="employees" element={<RequireRole auth={auth} roles={['ADMIN']}><EmployeePage /></RequireRole>} />
        <Route path="profile" element={<ProfilePage auth={auth} />} />
        <Route path="roles" element={<RequireRole auth={auth} roles={['ADMIN']}><ManagementPage auth={auth} resourceKey="roles" /></RequireRole>} />
      </Route>
      <Route path="*" element={<Navigate to={getDefaultPath(auth)} replace />} />
    </Routes>
  )
}

export default AppRoutes
