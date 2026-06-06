import { useCallback, useEffect, useRef, useState } from 'react'
import StatCard from '../../../components/StatCard'
import Toast from '../../../components/Toast'
import { shouldSuppressError } from '../../../services/api'
import { createBooking, getBookings, updateBookingStatus } from '../../../services/bookingService'
import { createQuickCustomer, lookupCustomers } from '../../../services/customerService'
import { getRooms } from '../../../services/roomService'
import BookingFormModal from './BookingFormModal'
import BookingTable from './BookingTable'
import { BOOKING_PAGE_SIZE, emptyBookingForm } from './bookingUtils'

const emptyFilters = {
  customerName: '',
  roomId: '',
  dateFrom: '',
  dateTo: '',
}

const emptyQuickCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
}

function buildPayload(form, auth) {
  return {
    customerId: form.customerId ? Number(form.customerId) : 0,
    customerKeyword: form.customerKeyword.trim(),
    employeeId: auth?.user?.id ? Number(auth.user.id) : null,
    roomId: Number(form.roomId),
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guestCount: Number(form.guestCount || 1),
  }
}

function BookingPage({ auth }) {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [formModal, setFormModal] = useState({ open: false, form: emptyBookingForm })
  const [newCustomer, setNewCustomer] = useState(emptyQuickCustomer)
  const [customerSuggestions, setCustomerSuggestions] = useState([])
  const [customerSuggestionLoading, setCustomerSuggestionLoading] = useState(false)
  const [quickCustomerSaving, setQuickCustomerSaving] = useState(false)
  const bookingSubmitRef = useRef(false)

  const totalPages = Math.max(1, Math.ceil(total / BOOKING_PAGE_SIZE))

  const loadBookings = useCallback(async (clearToast = true) => {
    setLoading(true)
    if (clearToast) setToast(null)
    try {
      const data = await getBookings({
        ...appliedFilters,
        page: page - 1,
        size: BOOKING_PAGE_SIZE,
      })
      setBookings(data?.content || [])
      setTotal(data?.totalElements || 0)
    } catch (error) {
      if (shouldSuppressError(error)) return
      setToast({ type: 'error', message: error.message || 'Không tải được danh sách booking' })
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, page])

  const loadRooms = useCallback(async () => {
    try {
      setRooms(await getRooms())
    } catch (error) {
      if (shouldSuppressError(error)) return
      setToast({ type: 'error', message: error.message || 'Không tải được danh sách phòng' })
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => Promise.all([loadRooms(), loadBookings()]))
  }, [loadRooms, loadBookings])

  useEffect(() => {
    if (!formModal.open) return

    const keyword = formModal.form.customerKeyword.trim()
    if (formModal.form.customerId || keyword.length < 2) {
      return
    }

    let active = true
    const timer = setTimeout(() => {
      setCustomerSuggestionLoading(true)
      lookupCustomers(keyword)
        .then((customers) => {
          if (active) setCustomerSuggestions(customers)
        })
        .catch(() => {
          if (active) setCustomerSuggestions([])
        })
        .finally(() => {
          if (active) setCustomerSuggestionLoading(false)
        })
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [formModal.form.customerId, formModal.form.customerKeyword, formModal.open])

  const applyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters(filters)
    setPage(1)
  }

  const resetFilters = () => {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }

  const updateFormField = (field, value) => {
    if (field === 'customerKeyword') {
      setCustomerSuggestions([])
      if (value.trim().length < 2) setCustomerSuggestionLoading(false)
    }
    setFormModal((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: value,
        ...(field === 'customerKeyword' ? { customerId: '' } : {}),
        ...(field === 'roomId' ? { checkIn: '', checkOut: '' } : {}),
      },
    }))
  }

  const openCreateModal = () => {
    setCustomerSuggestions([])
    setCustomerSuggestionLoading(false)
    setNewCustomer(emptyQuickCustomer)
    setFormModal({ open: true, form: emptyBookingForm })
  }

  const closeCreateModal = (force = false) => {
    if (saving && !force) return
    setCustomerSuggestions([])
    setCustomerSuggestionLoading(false)
    setNewCustomer(emptyQuickCustomer)
    setFormModal({ open: false, form: emptyBookingForm })
  }

  const selectCustomer = (customer) => {
    setFormModal((current) => ({
      ...current,
      form: {
        ...current.form,
        customerId: String(customer.id),
        customerKeyword: customer.email || customer.name || '',
      },
    }))
    setCustomerSuggestions([])
  }

  const updateQuickCustomerField = (field, value) => {
    setNewCustomer((current) => ({ ...current, [field]: value }))
  }

  const createCustomerForBooking = async () => {
    setQuickCustomerSaving(true)
    setToast(null)
    try {
      const customer = await createQuickCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim(),
        address: newCustomer.address.trim(),
      })
      selectCustomer(customer)
      setNewCustomer(emptyQuickCustomer)
      setToast({ type: 'success', message: 'Đã thêm khách hàng' })
    } catch (error) {
      if (shouldSuppressError(error)) return
      setToast({ type: 'error', message: error.message || 'Không tạo được khách hàng' })
    } finally {
      setQuickCustomerSaving(false)
    }
  }

  const submitBooking = async (event) => {
    event.preventDefault()
    if (bookingSubmitRef.current) return
    bookingSubmitRef.current = true
    setSaving(true)
    setToast(null)
    try {
      await createBooking(buildPayload(formModal.form, auth))
      await loadBookings(false)
      setToast({ type: 'success', message: 'Đã thêm thành công' })
      closeCreateModal(true)
    } catch (error) {
      if (shouldSuppressError(error)) return
      setToast({ type: 'error', message: error.message || 'Không tạo được booking' })
    } finally {
      bookingSubmitRef.current = false
      setSaving(false)
    }
  }

  const changeBookingStatus = async (booking, status) => {
    if (!status || status === booking.currentStatus) return
    setSaving(true)
    setToast(null)
    try {
      await updateBookingStatus(booking.id, status)
      await loadBookings(false)
      setToast({ type: 'success', message: 'Cập nhật dữ liệu thành công' })
    } catch (error) {
      if (shouldSuppressError(error)) return
      setToast({ type: 'error', message: error.message || 'Không cập nhật được trạng thái booking' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Tổng booking" value={total} />
        <StatCard label="Đang chờ" value={bookings.filter((item) => item.currentStatus === 'PENDING').length} tone="cream" />
        <StatCard label="Đã xác nhận" value={bookings.filter((item) => item.currentStatus === 'CONFIRMED').length} tone="mint" />
      </div>

      <BookingTable
        bookings={bookings}
        filters={filters}
        loading={loading}
        onApplyFilters={applyFilters}
        onCreate={openCreateModal}
        onFilterChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
        onResetFilters={resetFilters}
        onStatusChange={changeBookingStatus}
        page={page}
        rooms={rooms}
        saving={saving}
        setPage={setPage}
        total={total}
        totalPages={totalPages}
      />

      {formModal.open && (
        <BookingFormModal
          customerSuggestionLoading={customerSuggestionLoading}
          customerSuggestions={customerSuggestions}
          form={formModal.form}
          newCustomer={newCustomer}
          onCalendarError={(message) => setToast({ type: 'error', message })}
          onClose={closeCreateModal}
          onCreateCustomer={createCustomerForBooking}
          onQuickCustomerFieldChange={updateQuickCustomerField}
          onSelectCustomer={selectCustomer}
          onSubmit={submitBooking}
          onUpdateField={updateFormField}
          quickCustomerSaving={quickCustomerSaving}
          rooms={rooms}
          saving={saving}
        />
      )}
    </section>
  )
}

export default BookingPage
