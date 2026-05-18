import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import {
  getCustomerBookings,
  getCustomers,
  updateCustomerStatus,
} from '../../services/customerService'

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

function CustomerPage() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [bookings, setBookings] = useState([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const loadCustomers = useCallback(async (search = keyword) => {
    setLoading(true)
    setToast(null)
    try {
      setCustomers(await getCustomers(search))
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc khach hang' })
    } finally {
      setLoading(false)
    }
  }, [keyword])

  useEffect(() => {
    Promise.resolve().then(() => loadCustomers(''))
  }, [loadCustomers])

  const submitSearch = (event) => {
    event.preventDefault()
    loadCustomers(keyword)
  }

  const toggleStatus = async (customer) => {
    const nextStatus = customer.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
    const confirmed = window.confirm(
      `${nextStatus === 'LOCKED' ? 'Khoa' : 'Mo khoa'} tai khoan ${customer.name}?`,
    )
    if (!confirmed) {
      return
    }

    try {
      await updateCustomerStatus(customer.id, nextStatus)
      setToast({ type: 'success', message: 'Da cap nhat trang thai khach hang' })
      await loadCustomers(keyword)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong cap nhat duoc trang thai' })
    }
  }

  const viewHistory = async (customer) => {
    setSelectedCustomer(customer)
    setHistoryLoading(true)
    setBookings([])
    try {
      setBookings(await getCustomerBookings(customer.id))
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc lich su dat phong' })
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Customer management</p>
          <h1>Khach hang</h1>
          <p className="muted-text">Tim kiem theo ten, email, so dien thoai va quan ly trang thai tai khoan.</p>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Tong khach hang" value={customers.length} />
        <StatCard label="Dang hoat dong" value={customers.filter((item) => item.status !== 'LOCKED').length} tone="mint" />
        <StatCard label="Dang khoa" value={customers.filter((item) => item.status === 'LOCKED').length} tone="cream" />
      </div>

      <section className="panel">
        <form className="room-toolbar" onSubmit={submitSearch}>
          <label className="field">
            <span>Tim kiem</span>
            <input
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Ten, email hoac so dien thoai"
              value={keyword}
            />
          </label>
          <button className="primary-btn toolbar-button" type="submit">
            Tim kiem
          </button>
        </form>

        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <EmptyState title="Khong co khach hang" description="Khong tim thay khach hang phu hop." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khach hang</th>
                  <th>Email</th>
                  <th>So dien thoai</th>
                  <th>Trang thai</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.name}</strong>
                      <span className="cell-subtext">ID {customer.id}</span>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className={`status-pill ${customer.status === 'LOCKED' ? 'occupied' : 'available'}`}>
                        {customer.status === 'LOCKED' ? 'Dang khoa' : 'Hoat dong'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="ghost-btn compact-btn" onClick={() => viewHistory(customer)} type="button">
                          Lich su
                        </button>
                        <button className="secondary-btn compact-btn" onClick={() => toggleStatus(customer)} type="button">
                          {customer.status === 'LOCKED' ? 'Mo khoa' : 'Khoa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedCustomer && (
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Booking history</p>
              <h2>{selectedCustomer.name}</h2>
            </div>
          </div>
          {historyLoading ? (
            <LoadingSpinner label="Dang tai lich su..." />
          ) : bookings.length === 0 ? (
            <EmptyState title="Chua co booking" description="Khach hang nay chua co lich su dat phong." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Phong</th>
                    <th>Thoi gian</th>
                    <th>Trang thai</th>
                    <th>Tong tien</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>Room {booking.roomId} - {booking.roomTypeName}</td>
                      <td>
                        <span className="cell-subtext">{booking.checkIn}</span>
                        <span className="cell-subtext">{booking.checkOut}</span>
                      </td>
                      <td>{booking.currentStatus}</td>
                      <td>{formatMoney(booking.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  )
}

export default CustomerPage
