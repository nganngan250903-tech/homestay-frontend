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
import RoomTypePage from '../pages/roomTypes/RoomTypePage'
import RoomPage from '../pages/rooms/RoomPage'

function getDefaultPath(auth) {
  if (!auth) {
    return '/login'
  }

  return auth.role === 'ADMIN' ? '/admin' : '/home'
}

function RequireAuth({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RequireAdmin({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (auth.role !== 'ADMIN') {
    return <Navigate to="/home" replace />
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
          <RequireAdmin auth={auth}>
            <AdminLayout auth={auth} onLogout={onLogout} />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="bookings" element={<ManagementPage resourceKey="bookings" />} />
        <Route path="payments" element={<PlaceholderPage title="Thanh toan" endpoint="/payments" />} />
        <Route path="rooms" element={<RoomPage />} />
        <Route path="room-types" element={<RoomTypePage />} />
        <Route path="room-pricings" element={<ManagementPage resourceKey="roomPricings" />} />
        <Route path="room-photos" element={<ManagementPage resourceKey="roomPhotos" />} />
        <Route path="branches" element={<ManagementPage resourceKey="branches" />} />
        <Route path="categories" element={<AmenityPage />} />
        <Route path="amenities" element={<AmenityPage />} />
        <Route path="customers" element={<CustomerPage />} />
        <Route path="employees" element={<EmployeePage />} />
        <Route path="roles" element={<ManagementPage resourceKey="roles" />} />
      </Route>
      <Route path="*" element={<Navigate to={getDefaultPath(auth)} replace />} />
    </Routes>
  )
}

export default AppRoutes
