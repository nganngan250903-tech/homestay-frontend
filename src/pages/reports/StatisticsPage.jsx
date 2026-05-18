import { useCallback, useEffect, useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import { getStatisticsOverview } from '../../services/statisticsService'

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

function RevenueList({ title, data }) {
  const rows = Object.entries(data || {}).slice(-8).reverse()
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="report-list">
        {rows.length === 0 ? (
          <span className="muted-text">Chua co du lieu</span>
        ) : (
          rows.map(([label, value]) => (
            <div className="report-row" key={label}>
              <span>{label}</span>
              <strong>{formatMoney(value)}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function StatisticsPage() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setToast(null)
    try {
      setOverview(await getStatisticsOverview())
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc thong ke' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadOverview)
  }, [loadOverview])

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Thong ke</h1>
          <p className="muted-text">Doanh thu ngay/thang/nam va tong quan phong, khach hang, booking.</p>
        </div>
        <button className="secondary-btn" onClick={loadOverview} type="button">
          Tai lai
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      {loading ? (
        <LoadingSpinner />
      ) : overview && (
        <>
          <div className="stats-grid">
            <StatCard label="Doanh thu hom nay" value={formatMoney(overview.revenueToday)} />
            <StatCard label="Doanh thu thang nay" value={formatMoney(overview.revenueThisMonth)} tone="mint" />
            <StatCard label="Doanh thu nam nay" value={formatMoney(overview.revenueThisYear)} tone="cream" />
          </div>

          <div className="stats-grid">
            <StatCard label="Tong phong" value={overview.totalRooms} />
            <StatCard label="Phong con trong" value={overview.availableRooms} tone="mint" />
            <StatCard label="Phong dang thue" value={overview.occupiedRooms} tone="cream" />
          </div>

          <div className="stats-grid">
            <StatCard label="Khach hang" value={overview.totalCustomers} />
            <StatCard label="Khach hoat dong" value={overview.activeCustomers} tone="mint" />
            <StatCard label="Booking" value={overview.totalBookings} tone="cream" />
          </div>

          <div className="content-grid reports-grid">
            <RevenueList title="Doanh thu theo ngay" data={overview.dailyRevenue} />
            <RevenueList title="Doanh thu theo thang" data={overview.monthlyRevenue} />
            <RevenueList title="Doanh thu theo nam" data={overview.yearlyRevenue} />
            <section className="panel">
              <h2>Booking theo trang thai</h2>
              <div className="report-list">
                {Object.entries(overview.bookingsByStatus || {}).map(([status, count]) => (
                  <div className="report-row" key={status}>
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}

export default StatisticsPage
