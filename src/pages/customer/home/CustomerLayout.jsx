import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getCustomerBookings, getCustomer } from '../../../services/customerService'
import {
  CustomerBookingHistoryModal,
  CustomerPasswordModal,
  CustomerProfileModal,
} from './CustomerAccountModals'
import CustomerFooter from './CustomerFooter'
import HomeHeader from './HomeHeader'
import { emptyCustomerForm } from './homeConstants'

function CustomerLayout({ auth, children, onLogout }) {
  const location = useLocation()
  const [customer, setCustomer] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountModal, setAccountModal] = useState('')
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

  const currentCustomer = customer || { ...emptyCustomerForm, ...authUser, id: customerId }

  return (
    <main className="customer-home">
      <HomeHeader
        currentCustomer={currentCustomer}
        isCustomer={isCustomer}
        menuOpen={menuOpen}
        onHistoryOpen={openHistory}
        onLogout={onLogout}
        onMenuToggle={() => setMenuOpen((current) => !current)}
        onOpenModal={openModal}
      />

      <div className="customer-page-content">{children}</div>
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
        <CustomerBookingHistoryModal bookings={bookings} loading={bookingLoading} onClose={() => setAccountModal('')} />
      )}
    </main>
  )
}

export default CustomerLayout
