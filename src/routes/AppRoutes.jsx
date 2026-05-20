import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import PlaceholderPage from '../pages/admin/PlaceholderPage'
import AmenityPage from '../pages/admin/amenities/AmenityPage'
import CustomerPage from '../pages/admin/customers/CustomerPage'
import DashboardHomePage from '../pages/admin/dashboard/DashboardHomePage'
import EmployeePage from '../pages/admin/employees/EmployeePage'
import ManagementPage from '../pages/admin/management/ManagementPage'
import ProfilePage from '../pages/admin/profile/ProfilePage'
import RoomTypePage from '../pages/admin/roomTypes/RoomTypePage'
import RoomPage from '../pages/admin/rooms/RoomPage'
import LoginPage from '../pages/customer/auth/LoginPage'
import CustomerLayout from '../pages/customer/home/CustomerLayout'
import HomePage from '../pages/customer/home/HomePage'
import PaymentPage from '../pages/customer/payment/PaymentPage'
import PaymentResultPage from '../pages/customer/payment/PaymentResultPage'
import {
  AmenityInfoPage,
  BookingPage,
  OfferInfoPage,
  RulesFaqPage,
  ServiceInfoPage,
} from '../pages/customer/home/customerPages/CustomerInfoPages'

function getDefaultPath(auth) {
  if (!auth) {
    return '/home'
  }

  return ['ADMIN', 'EMPLOYEE'].includes(auth.role) ? '/admin' : '/home'
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
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/login"
        element={auth ? <Navigate to={getDefaultPath(auth)} replace /> : <LoginPage onLogin={onLogin} />}
      />
      <Route
        path="/home"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/bookingRoom"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <BookingPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/amenities"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <AmenityInfoPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/services"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <ServiceInfoPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/offers"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <OfferInfoPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/rulesFaq"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <RulesFaqPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/payment/:bookingId"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <PaymentPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home/payment-result"
        element={
          <CustomerLayout auth={auth} onLogin={onLogin} onLogout={onLogout}>
            <PaymentResultPage />
          </CustomerLayout>
        }
      />
      <Route path="/home/dat-phong" element={<Navigate to="/home/bookingRoom" replace />} />
      <Route path="/home/tien-nghi" element={<Navigate to="/home/amenities" replace />} />
      <Route path="/home/dich-vu" element={<Navigate to="/home/services" replace />} />
      <Route path="/home/uu-dai" element={<Navigate to="/home/offers" replace />} />
      <Route path="/home/quy-tac-faq" element={<Navigate to="/home/rulesFaq" replace />} />
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
