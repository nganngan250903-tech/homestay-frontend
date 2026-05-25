import { useCallback, useEffect, useState } from 'react'
import Toast from '../../../components/Toast'
import { confirmDemoPayment, createVnPayPaymentUrl, getBookings } from '../../../services/bookingService'
import { getPayments } from '../../../services/paymentService'
import PaymentTable from './PaymentTable'
import PendingPaymentList from './PendingPaymentList'
import { emptyPaymentFilters, PAYMENT_PAGE_SIZE } from './paymentUtils'

function isPayableBooking(booking) {
  const total = Number(booking.totalAmount || 0)
  const paid = Number(booking.paidAmount || 0)
  return ['PENDING', 'CONFIRMED'].includes(booking.currentStatus) && total > paid
}

function PaymentPage() {
  const [payments, setPayments] = useState([])
  const [payableBookings, setPayableBookings] = useState([])
  const [filters, setFilters] = useState(emptyPaymentFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyPaymentFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const totalPages = Math.max(1, Math.ceil(total / PAYMENT_PAGE_SIZE))

  const loadPayments = useCallback(async (clearToast = true) => {
    setLoading(true)
    if (clearToast) setToast(null)
    try {
      const data = await getPayments({
        ...appliedFilters,
        provider: 'VNPAY',
        page: page - 1,
        size: PAYMENT_PAGE_SIZE,
      })
      setPayments(data?.content || [])
      setTotal(data?.totalElements || 0)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được danh sách thanh toán' })
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, page])

  const loadPayableBookings = useCallback(async () => {
    setLoadingBookings(true)
    try {
      const data = await getBookings({ page: 0, size: 100 })
      setPayableBookings((data?.content || []).filter(isPayableBooking))
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được booking cần thanh toán' })
    } finally {
      setLoadingBookings(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => Promise.all([loadPayments(), loadPayableBookings()]))
  }, [loadPayments, loadPayableBookings])

  const applyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters(filters)
    setPage(1)
  }

  const resetFilters = () => {
    setFilters(emptyPaymentFilters)
    setAppliedFilters(emptyPaymentFilters)
    setPage(1)
  }

  const createPayment = async (booking) => {
    setSaving(true)
    setToast(null)
    try {
      const payment = await createVnPayPaymentUrl(booking.id)
      if (payment?.demoMode) {
        await confirmDemoPayment(booking.id)
        setToast({ type: 'success', message: 'Đã ghi nhận thanh toán demo' })
      } else if (payment?.paymentUrl) {
        window.open(payment.paymentUrl, '_blank', 'noopener,noreferrer')
        setToast({ type: 'success', message: 'Đã tạo link thanh toán VNPay' })
      } else {
        setToast({ type: 'success', message: 'Đã tạo yêu cầu thanh toán' })
      }
      await Promise.all([loadPayments(false), loadPayableBookings()])
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tạo được thanh toán' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />

      <PendingPaymentList
        bookings={payableBookings}
        loading={loadingBookings}
        onCreatePayment={createPayment}
        saving={saving}
      />

      <PaymentTable
        filters={filters}
        loading={loading}
        onApplyFilters={applyFilters}
        onFilterChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
        onResetFilters={resetFilters}
        page={page}
        payments={payments}
        setPage={setPage}
        total={total}
        totalPages={totalPages}
      />
    </section>
  )
}

export default PaymentPage
