import { useCallback, useEffect, useMemo, useState } from 'react'
import LoadingSpinner from '../../../components/LoadingSpinner'
import StatCard from '../../../components/StatCard'
import Toast from '../../../components/Toast'
import { getStatisticsOverview } from '../../../services/statisticsService'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

const bookingLabels = {
  PENDING: 'Cho thanh toan',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đang ở',
  CHECKED_OUT: 'Da tra phòng',
  CANCELLED: 'Da huy',
  NO_SHOW: 'Không đến',
  UNKNOWN: 'Không rõ',
}

function toDateInput(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(value, days) {
  const date = new Date(`${value}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

function eachDay(start, end) {
  const days = []
  const cursor = new Date(`${start}T00:00:00`)
  const last = new Date(`${end}T00:00:00`)

  while (cursor <= last && days.length < 7) {
    days.push(toDateInput(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function formatCurrency(value) {
  return moneyFormatter.format(Number(value || 0))
}

function sumValues(map = {}) {
  return Object.values(map).reduce((total, value) => total + Number(value || 0), 0)
}

function BarChart({ data, emptyText }) {
  const max = Math.max(...data.map((item) => item.value), 0)

  if (!data.length || max === 0) {
    return <div className="empty-chart">{emptyText}</div>
  }

  return (
    <div className="bar-chart">
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}></div>
          </div>
          <strong>{formatCurrency(item.value)}</strong>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ title, total, segments, note }) {
  let cursor = 0
  const gradient = segments.length && total > 0
    ? segments.map((segment) => {
        const start = cursor
        cursor += (segment.value / total) * 100
        return `${segment.color} ${start}% ${cursor}%`
      }).join(', ')
    : '#e5edf3 0% 100%'

  return (
    <article className="dashboard-card donut-card">
      <div className="dashboard-card-head">
        <h2>{title}</h2>
        <span>{numberFormatter.format(total)}</span>
      </div>
      <div className="donut-layout">
        <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
          <span>{numberFormatter.format(total)}</span>
        </div>
        <div className="chart-legend">
          {segments.map((segment) => (
            <div className="legend-item" key={segment.label}>
              <i style={{ background: segment.color }}></i>
              <span>{segment.label}</span>
              <strong>{numberFormatter.format(segment.value)}</strong>
            </div>
          ))}
        </div>
      </div>
      {note && <p className="chart-note">{note}</p>}
    </article>
  )
}

function DashboardHomePage() {
  const today = useMemo(() => new Date(), [])
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [dailyRange, setDailyRange] = useState({
    start: addDays(toDateInput(today), -6),
    end: toDateInput(today),
  })
  const [monthYear, setMonthYear] = useState(String(today.getFullYear()))
  const [yearEnd, setYearEnd] = useState(String(today.getFullYear()))

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setToast(null)
    try {
      setOverview(await getStatisticsOverview())
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được dữ liệu dashboard' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadOverview)
  }, [loadOverview])

  const dailyData = useMemo(() => {
    if (!overview) return []
    return eachDay(dailyRange.start, dailyRange.end).map((date) => ({
      label: date.slice(5),
      value: Number(overview.dailyRevenue?.[date] || 0),
    }))
  }, [overview, dailyRange])

  const monthlyData = useMemo(() => {
    if (!overview) return []
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, '0')
      const key = `${monthYear}-${month}`
      return {
        label: `T${index + 1}`,
        value: Number(overview.monthlyRevenue?.[key] || 0),
      }
    })
  }, [overview, monthYear])

  const yearlyData = useMemo(() => {
    if (!overview) return []
    const end = Number(yearEnd) || today.getFullYear()
    return Array.from({ length: 5 }, (_, index) => {
      const year = String(end - 4 + index)
      return {
        label: year,
        value: Number(overview.yearlyRevenue?.[year] || 0),
      }
    })
  }, [overview, yearEnd, today])

  const changeDailyStart = (value) => {
    const nextEnd = dailyRange.end < value ? value : dailyRange.end
    const days = eachDay(value, nextEnd)
    setDailyRange({ start: value, end: days.at(-1) || value })
  }

  const changeDailyEnd = (value) => {
    const end = value < dailyRange.start ? dailyRange.start : value
    const maxEnd = addDays(dailyRange.start, 6)
    setDailyRange({ start: dailyRange.start, end: end > maxEnd ? maxEnd : end })
  }

  const totalRevenue = overview ? sumValues(overview.yearlyRevenue) : 0
  const roomSegments = overview ? [
    { label: 'Phòng trong', value: Number(overview.availableRooms || 0), color: '#22c55e' },
    { label: 'Đang hoạt động', value: Number(overview.occupiedRooms || 0), color: '#38bdf8' },
  ] : []
  const customerSegments = overview ? [
    { label: 'Đang hoạt động', value: Number(overview.activeCustomers || 0), color: '#22c55e' },
    { label: 'Đang khóa', value: Number(overview.lockedCustomers || 0), color: '#f59e0b' },
  ] : []
  const bookingSegments = overview
    ? Object.entries(overview.currentMonthBookingsByStatus || {}).map(([status, value], index) => ({
        label: bookingLabels[status] || status,
        value: Number(value || 0),
        color: ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'][index % 6],
      }))
    : []

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="muted-text">Tong quan doanh thu, phòng, khách hàng va booking cua LimDimHomestay.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : overview ? (
        <>
          <div className="stats-grid dashboard-stats">
            <StatCard label="Doanh thu tong" value={formatCurrency(totalRevenue)} />
            <StatCard label="Hom nay" value={formatCurrency(overview.revenueToday)} tone="mint" />
            <StatCard label="Thang nay" value={formatCurrency(overview.revenueThisMonth)} tone="cream" />
            <StatCard label="Nam nay" value={formatCurrency(overview.revenueThisYear)} />
          </div>

          <section className="dashboard-grid">
            <article className="dashboard-card wide-card">
              <div className="dashboard-card-head">
                <div>
                  <h2>Doanh thu theo ngày</h2>
                  <p>Khoảng lọc tối đa 7 ngày</p>
                </div>
                <div className="dashboard-filters">
                  <label>
                    <span>Từ ngày</span>
                    <input onChange={(event) => changeDailyStart(event.target.value)} type="date" value={dailyRange.start} />
                  </label>
                  <label>
                    <span>Đến ngày</span>
                    <input
                      max={addDays(dailyRange.start, 6)}
                      min={dailyRange.start}
                      onChange={(event) => changeDailyEnd(event.target.value)}
                      type="date"
                      value={dailyRange.end}
                    />
                  </label>
                </div>
              </div>
              <BarChart data={dailyData} emptyText="Chưa có doanh thu trong khoảng ngày này." />
            </article>

            <article className="dashboard-card wide-card">
              <div className="dashboard-card-head">
                <div>
                  <h2>Doanh thu theo thang</h2>
                  <p>Loc theo nam</p>
                </div>
                <label className="compact-filter">
                  <span>Nam</span>
                  <input min="2000" onChange={(event) => setMonthYear(event.target.value)} type="number" value={monthYear} />
                </label>
              </div>
              <BarChart data={monthlyData} emptyText="Chưa có doanh thu trong nam da chon." />
            </article>

            <article className="dashboard-card wide-card">
              <div className="dashboard-card-head">
                <div>
                  <h2>Doanh thu theo nam</h2>
                  <p>Hiển thị 5 nam ket thuc tai nam da chon</p>
                </div>
                <label className="compact-filter">
                  <span>Den nam</span>
                  <input min="2000" onChange={(event) => setYearEnd(event.target.value)} type="number" value={yearEnd} />
                </label>
              </div>
              <BarChart data={yearlyData} emptyText="Chưa có doanh thu trong giai doan nay." />
            </article>
          </section>

          <section className="dashboard-grid summary-grid">
            <DonutChart
              title="Tinh trang phòng"
              total={Number(overview.totalRooms || 0)}
              segments={roomSegments}
              note="Phòng trống và phòng đang hoạt động/đã có khách theo trạng thái hiện tại."
            />
            <DonutChart
              title="Khách hàng"
              total={Number(overview.totalCustomers || 0)}
              segments={customerSegments}
              note="Tổng hợp tài khoản khách hàng đang hoạt động và đang khóa."
            />
            <DonutChart
              title="Booking thang hien tai"
              total={Number(overview.currentMonthBookings || 0)}
              segments={bookingSegments}
              note="Thong ke booking tao trong thang hien tai theo trang thai."
            />
          </section>
        </>
      ) : (
        <section className="panel note-panel">
          <h2>Không có dữ liệu</h2>
          <p>Chưa tải được dữ liệu thống kê từ backend.</p>
        </section>
      )}
    </section>
  )
}

export default DashboardHomePage
