import { useCallback, useEffect, useMemo, useState } from 'react'
import LoadingSpinner from '../../../components/LoadingSpinner'
import StatCard from '../../../components/StatCard'
import Toast from '../../../components/Toast'
import { getRooms } from '../../../services/roomService'
import { getStatisticsOverview } from '../../../services/statisticsService'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

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
    <div className="bar-chart" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
      {data.map((item) => (
        <div className="bar-column" key={item.label}>
          <strong>{formatCurrency(item.value)}</strong>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }}></div>
          </div>
          <span>{item.label}</span>
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

function RoomOccupancyChart({ month, onMonthChange, onYearChange, rooms, year }) {
  const [activeRoom, setActiveRoom] = useState(null)
  const max = Math.max(...rooms.map((room) => Number(room.occupancyRate || 0)), 100)
  const displayedRoom = activeRoom || rooms[0]

  return (
    <article className="dashboard-card room-occupancy-card">
      <div className="dashboard-card-head">
        <div>
          <h2>Doanh thu theo phòng</h2>
          <p>Tỷ lệ lấp đầy của từng phòng theo tháng đã chọn</p>
        </div>
        <div className="dashboard-filters room-occupancy-filters">
          <label>
            <span>Tháng</span>
            <select onChange={(event) => onMonthChange(event.target.value)} value={month}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Năm</span>
            <input min="2000" onChange={(event) => onYearChange(event.target.value)} type="number" value={year} />
          </label>
        </div>
      </div>
      {rooms.length ? (
        <>
          <div className="room-occupancy-chart" style={{ gridTemplateColumns: `repeat(${rooms.length}, minmax(0, 1fr))` }}>
            {rooms.map((room) => {
              const occupancyRate = Number(room.occupancyRate || 0)
              const isActive = displayedRoom === room
              return (
                <button
                  className={isActive ? 'room-occupancy-column active' : 'room-occupancy-column'}
                  key={room.roomId || room.roomName}
                  onBlur={() => setActiveRoom(null)}
                  onFocus={() => setActiveRoom(room)}
                  onMouseEnter={() => setActiveRoom(room)}
                  type="button"
                >
                  <strong>{occupancyRate.toFixed(0)}%</strong>
                  <div className="room-occupancy-track">
                    <div
                      className="room-occupancy-fill"
                      style={{ height: `${Math.min(100, Math.max(4, (occupancyRate / max) * 100))}%` }}
                    ></div>
                  </div>
                  <span>{room.roomName}</span>
                </button>
              )
            })}
          </div>
          <div className="room-occupancy-summary" aria-live="polite">
            <strong>{displayedRoom.roomName}</strong>
            <span>{formatCurrency(displayedRoom.revenue)} trong tháng</span>
            <span>{displayedRoom.occupiedNights}/{displayedRoom.totalNights} đêm được đặt phòng</span>
          </div>
        </>
      ) : (
        <div className="empty-chart">Chưa có dữ liệu lấp đầy theo phòng trong tháng này.</div>
      )}
    </article>
  )
}

function DashboardHomePage() {
  const today = useMemo(() => new Date(), [])
  const [overview, setOverview] = useState(null)
  const [roomFallbacks, setRoomFallbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [dailyRange, setDailyRange] = useState({
    start: addDays(toDateInput(today), -6),
    end: toDateInput(today),
  })
  const [monthYear, setMonthYear] = useState(String(today.getFullYear()))
  const [yearEnd, setYearEnd] = useState(String(today.getFullYear()))
  const [occupancyMonth, setOccupancyMonth] = useState(String(today.getMonth() + 1))
  const [occupancyYear, setOccupancyYear] = useState(String(today.getFullYear()))

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setToast(null)
    try {
      const [overviewData, roomData] = await Promise.all([
        getStatisticsOverview({
          occupancyMonth,
          occupancyYear,
        }),
        getRooms().catch(() => []),
      ])
      setOverview(overviewData)
      setRoomFallbacks(roomData)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được dữ liệu dashboard' })
    } finally {
      setLoading(false)
    }
  }, [occupancyMonth, occupancyYear])

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
    { label: 'Trống', value: Number(overview.availableRooms || 0), color: '#22c55e' },
    { label: 'Chờ nhận phòng', value: Number(overview.waitingCheckInRooms || 0), color: '#38bdf8' },
    { label: 'Đang ở', value: Number(overview.occupiedRooms || 0), color: '#2563eb' },
    { label: 'Cần dọn phòng', value: Number(overview.cleaningRooms || 0), color: '#f59e0b' },
    { label: 'Bảo trì', value: Number(overview.maintenanceRooms || 0), color: '#ef4444' },
  ] : []
  const customerSegments = overview ? [
    { label: 'Đang hoạt động', value: Number(overview.activeCustomers || 0), color: '#22c55e' },
    { label: 'Đang khóa', value: Number(overview.lockedCustomers || 0), color: '#f59e0b' },
  ] : []
  const roomOccupancyThisMonth = overview?.roomOccupancyThisMonth?.length
    ? overview.roomOccupancyThisMonth
    : roomFallbacks.map((room) => ({
        roomId: room.id,
        roomName: room.name || 'Phòng',
        occupancyRate: 0,
        occupiedNights: 0,
        totalNights: new Date(Number(occupancyYear), Number(occupancyMonth), 0).getDate(),
        revenue: 0,
      }))

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : overview ? (
        <>
          <div className="stats-grid dashboard-stats">
            <StatCard label="Doanh thu tổng" value={formatCurrency(totalRevenue)} />
            <StatCard label="Hôm nay" value={formatCurrency(overview.revenueToday)} tone="mint" />
            <StatCard label="Tháng này" value={formatCurrency(overview.revenueThisMonth)} tone="cream" />
            <StatCard label="Năm này" value={formatCurrency(overview.revenueThisYear)} />
          </div>

          <section className="dashboard-grid summary-grid">
            <DonutChart
              title="Tình trạng phòng"
              total={Number(overview.totalRooms || 0)}
              segments={roomSegments}
              note="Tổng hợp 5 trạng thái phòng hiện tại."
            />
            <DonutChart
              title="Khách hàng"
              total={Number(overview.totalCustomers || 0)}
              segments={customerSegments}
              note="Tổng hợp tài khoản khách hàng đang hoạt động và đang khóa."
            />
          </section>

          <section className="dashboard-revenue-grid">
            <div className="dashboard-revenue-row dashboard-revenue-row-primary">
              <article className="dashboard-card revenue-card daily-revenue-card">
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

              <RoomOccupancyChart
                month={occupancyMonth}
                onMonthChange={setOccupancyMonth}
                onYearChange={setOccupancyYear}
                rooms={roomOccupancyThisMonth}
                year={occupancyYear}
              />
            </div>

            <div className="dashboard-revenue-row">
              <article className="dashboard-card revenue-card">
                <div className="dashboard-card-head">
                  <div>
                    <h2>Doanh thu theo tháng</h2>
                    <p>Lọc theo năm</p>
                  </div>
                  <label className="compact-filter">
                    <span>Năm</span>
                    <input min="2000" onChange={(event) => setMonthYear(event.target.value)} type="number" value={monthYear} />
                  </label>
                </div>
                <BarChart data={monthlyData} emptyText="Chưa có doanh thu trong năm đã chọn." />
              </article>

              <article className="dashboard-card revenue-card">
                <div className="dashboard-card-head">
                  <div>
                    <h2>Doanh thu theo năm</h2>
                    <p>Hiển thị 5 năm kết thúc tại năm đã chọn</p>
                  </div>
                  <label className="compact-filter">
                    <span>Đến năm</span>
                    <input min="2000" onChange={(event) => setYearEnd(event.target.value)} type="number" value={yearEnd} />
                  </label>
                </div>
                <BarChart data={yearlyData} emptyText="Chưa có doanh thu trong giai đoạn này." />
              </article>
            </div>
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


