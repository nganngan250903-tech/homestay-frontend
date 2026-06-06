import { useCallback, useEffect, useMemo, useState } from 'react'
import StatCard from '../../../components/StatCard'
import Toast from '../../../components/Toast'
import {
  createCustomer,
  deleteCustomer,
  getCustomerBookings,
  getCustomers,
  updateCustomer,
  updateCustomerStatus,
} from '../../../services/customerService'
import CustomerConfirmModal from './CustomerConfirmModal'
import CustomerDetailModal from './CustomerDetailModal'
import CustomerFormModal from './CustomerFormModal'
import CustomerHistoryModal from './CustomerHistoryModal'
import CustomerTable from './CustomerTable'
import { PAGE_SIZE, customerFormFrom, emptyCustomerForm } from './customerUtils'
import { deleteCloudImage, getCloudinaryPublicId } from '../../../services/uploadService'

async function deleteCloudImageByUrl(url) {
  const publicId = getCloudinaryPublicId(url)
  if (!publicId) return
  await deleteCloudImage(publicId)
}

function CustomerPage({ auth }) {
  const [customers, setCustomers] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ search: '' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, mode: 'create', customer: null, form: emptyCustomerForm })
  const [detailModal, setDetailModal] = useState({ open: false, customer: null })
  const [historyModal, setHistoryModal] = useState({ open: false, customer: null, bookings: [] })
  const [confirm, setConfirm] = useState({ open: false, action: '', customer: null, nextStatus: '', message: '', label: '' })
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const isAdmin = auth?.role === 'ADMIN'

  const filteredCustomers = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    return customers.filter((customer) => {
      const searchable = [customer.name, customer.email, customer.phone, customer.address, customer.status].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(keyword)
    })
  }, [customers, filters.search])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE))
  const pagedCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadCustomers = useCallback(async (clearToast = true) => {
    setLoading(true)
    if (clearToast) setToast(null)
    try {
      setCustomers(await getCustomers(''))
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được khách hàng' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadCustomers)
  }, [loadCustomers])

  const submitSearch = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput })
    setPage(1)
  }

  const openCreateModal = () => {
    setModal({ open: true, mode: 'create', customer: null, form: emptyCustomerForm })
  }

  const openEditModal = (customer) => {
    setDetailModal({ open: false, customer: null })
    setModal({ open: true, mode: 'edit', customer, form: customerFormFrom(customer) })
  }

  const closeModal = () => {
    setModal({ open: false, mode: 'create', customer: null, form: emptyCustomerForm })
  }

  const updateField = (field, value) => {
    setModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const submitCustomer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)

    try {
      if (modal.mode === 'edit') {
        await updateCustomer(modal.customer.id, modal.form)
        if (modal.customer.image && modal.customer.image !== modal.form.image) {
          await Promise.allSettled([deleteCloudImageByUrl(modal.customer.image)])
        }
        await loadCustomers(false)
        setToast({ type: 'success', message: 'Cập nhật dữ liệu thành công' })
      } else {
        await createCustomer(modal.form)
        await loadCustomers(false)
        setToast({ type: 'success', message: 'Đã thêm thành công' })
      }
      closeModal()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không lưu được khách hàng' })
    } finally {
      setSaving(false)
    }
  }

  const requestStatusChange = (customer) => {
    const nextStatus = customer.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
    setConfirm({
      open: true,
      action: 'status',
      customer,
      nextStatus,
      label: nextStatus === 'LOCKED' ? 'Khóa' : 'Mở khóa',
      message: `Bạn chắc chắn muốn ${nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} khách hàng này`,
    })
  }

  const requestDelete = (customer) => {
    setConfirm({
      open: true,
      action: 'delete',
      customer,
      nextStatus: '',
      label: 'Xóa',
      message: 'Bạn chắc chắn muốn xóa khách hàng này? Tài khoản sẽ được khóa và lịch sử vẫn được giữ lại.',
    })
  }

  const closeConfirm = () => {
    if (!saving) {
      setConfirm({ open: false, action: '', customer: null, nextStatus: '', message: '', label: '' })
    }
  }

  const confirmAction = async () => {
    setSaving(true)
    setToast(null)
    try {
      if (confirm.action === 'status') {
        await updateCustomerStatus(confirm.customer.id, confirm.nextStatus)
        await loadCustomers(false)
        setToast({ type: 'success', message: 'Cập nhật dữ liệu thành công' })
      }

      if (confirm.action === 'delete') {
        await deleteCustomer(confirm.customer.id)
        await loadCustomers(false)
        setToast({ type: 'delete', message: 'Đã xóa thành công' })
      }
      closeConfirm()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thực hiện được thao tác' })
    } finally {
      setSaving(false)
    }
  }

  const viewHistory = async (customer) => {
    setHistoryModal({ open: true, customer, bookings: [] })
    setHistoryLoading(true)
    try {
      const bookings = await getCustomerBookings(customer.id)
      setHistoryModal({ open: true, customer, bookings })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được lịch sử đặt phòng' })
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Tổng khách hàng" value={customers.length} />
        <StatCard label="Đang hoạt động" value={customers.filter((item) => item.status !== 'LOCKED').length} tone="mint" />
        <StatCard label="Đang khóa" value={customers.filter((item) => item.status === 'LOCKED').length} tone="cream" />
      </div>

      <CustomerTable
        customers={pagedCustomers}
        loading={loading}
        onApplySearch={submitSearch}
        onCreate={isAdmin ? openCreateModal : null}
        onDelete={isAdmin ? requestDelete : null}
        onEdit={isAdmin ? openEditModal : null}
        onHistory={isAdmin ? viewHistory : null}
        onSearchInputChange={setSearchInput}
        onStatusChange={isAdmin ? requestStatusChange : null}
        onView={(customer) => setDetailModal({ open: true, customer })}
        page={page}
        searchInput={searchInput}
        setPage={setPage}
        total={filteredCustomers.length}
        totalPages={totalPages}
        saving={saving}
      />

      {detailModal.open && detailModal.customer && (
        <CustomerDetailModal
          customer={detailModal.customer}
          onClose={() => setDetailModal({ open: false, customer: null })}
          onEdit={isAdmin ? openEditModal : null}
        />
      )}

      {modal.open && (
        <CustomerFormModal
          form={modal.form}
          mode={modal.mode}
          onClose={closeModal}
          onSubmit={submitCustomer}
          onUpdateField={updateField}
          saving={saving}
        />
      )}

      {historyModal.open && historyModal.customer && (
        <CustomerHistoryModal
          bookings={historyModal.bookings}
          customer={historyModal.customer}
          loading={historyLoading}
          onClose={() => setHistoryModal({ open: false, customer: null, bookings: [] })}
        />
      )}

      {confirm.open && confirm.customer && (
        <CustomerConfirmModal confirm={confirm} onCancel={closeConfirm} onConfirm={confirmAction} saving={saving} />
      )}
    </section>
  )
}

export default CustomerPage
