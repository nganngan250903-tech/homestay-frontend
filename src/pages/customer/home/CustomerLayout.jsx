import { cloneElement, isValidElement, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getCustomerBookings, getCustomer } from '../../../services/customerService'
import { cancelBooking } from '../../../services/bookingService'
import {
  CustomerBookingHistoryModal,
  CustomerPasswordModal,
  CustomerProfileModal,
} from './CustomerAccountModals'
import CustomerAuthModal from './CustomerAuthModal'
import CustomerFooter from './CustomerFooter'
import HomeHeader from './HomeHeader'
import { emptyCustomerForm } from './homeConstants'

function CustomerLayout({ auth, children, onLogin, onLogout }) {
  const location = useLocation()
  const [customer, setCustomer] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountModal, setAccountModal] = useState('')
  const [authModal, setAuthModal] = useState('')
  const [bookings, setBookings] = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const authRole = String(auth?.role || auth?.userType || '').toUpperCase()
  const authUser = useMemo(() => auth?.user || auth?.customer || auth || {}, [auth])
  const isCustomer = authRole === 'CUSTOMER'
  const customerId = authUser?.id || auth?.id

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  useEffect(() => {
    if (!isCustomer || !customerId) {
      return
    }

    getCustomer(customerId)
      .then(setCustomer)
      .catch(() => setCustomer({ ...emptyCustomerForm, ...authUser, id: customerId }))
  }, [authUser, customerId, isCustomer])

  const openModal = (modalName) => {
    setAccountModal(modalName)
    setMenuOpen(false)
  }

  const openHistory = async () => {
    if (!customerId) return
    openModal('history')
    setBookingLoading(true)
    try {
      setBookings(await getCustomerBookings(customerId))
    } catch {
      setBookings([])
    } finally {
      setBookingLoading(false)
    }
  }

  const handleBookingCreated = (booking) => {
    setBookings((current) => [booking, ...current.filter((item) => item.id !== booking.id)])
  }

  const handleBookingCancelled = async (bookingId) => {
    const updated = await cancelBooking(bookingId)
    setBookings((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    return updated
  }

  const currentCustomer = customer || { ...emptyCustomerForm, ...authUser, id: customerId }
  const content = isValidElement(children)
    ? cloneElement(children, {
        bookingCustomer: currentCustomer,
        isCustomer,
        onBookingCreated: handleBookingCreated,
        onRequireCustomerAuth: () => setAuthModal('login'),
      })
    : children

  return (
    <main className="customer-home">
      <HomeHeader
        currentCustomer={currentCustomer}
        isCustomer={isCustomer}
        menuOpen={menuOpen}
        onAuthOpen={setAuthModal}
        onHistoryOpen={openHistory}
        onLogout={onLogout}
        onMenuToggle={() => setMenuOpen((current) => !current)}
        onOpenModal={openModal}
      />

      <div className="customer-page-content">{content}</div>
      <CustomerFooter />

      {accountModal === 'profile' && (
        <CustomerProfileModal
          customer={currentCustomer}
          onClose={() => setAccountModal('')}
          onSaved={setCustomer}
        />
      )}
      {accountModal === 'password' && (
        <CustomerPasswordModal customer={currentCustomer} onClose={() => setAccountModal('')} />
      )}
      {accountModal === 'history' && (
        <CustomerBookingHistoryModal
          bookings={bookings}
          loading={bookingLoading}
          onBookingCancelled={handleBookingCancelled}
          onClose={() => setAccountModal('')}
        />
      )}
      {authModal && (
        <CustomerAuthModal initialMode={authModal} onClose={() => setAuthModal('')} onLogin={onLogin} />
      )}
    </main>
  )
}

export default CustomerLayout
