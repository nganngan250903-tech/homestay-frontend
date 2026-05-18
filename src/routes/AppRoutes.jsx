import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import DashboardHomePage from '../pages/DashboardHomePage'
import LoginPage from '../pages/LoginPage'
import CustomerPage from '../pages/customers/CustomerPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import ManagementPage from '../pages/management/ManagementPage'
import StatisticsPage from '../pages/reports/StatisticsPage'
import RoomTypePage from '../pages/roomTypes/RoomTypePage'
import RoomPage from '../pages/rooms/RoomPage'

function RequireAdmin({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (auth.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes({ auth, onLogin, onLogout }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to="/admin" replace /> : <LoginPage onLogin={onLogin} />}
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
        <Route path="categories" element={<ManagementPage resourceKey="categories" />} />
        <Route path="amenities" element={<ManagementPage resourceKey="amenities" />} />
        <Route path="customers" element={<CustomerPage />} />
        <Route path="employees" element={<ManagementPage resourceKey="employees" />} />
        <Route path="roles" element={<ManagementPage resourceKey="roles" />} />
        <Route path="reports" element={<StatisticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={auth ? '/admin' : '/login'} replace />} />
    </Routes>
  )
}

export default AppRoutes
