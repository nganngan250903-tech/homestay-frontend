import { useEffect, useMemo, useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import { getRoomBookingCalendar } from '../../../services/bookingService'

const CHECK_IN_HOUR = 14
const CHECK_OUT_HOUR = 12
const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fromDateKey(key, hour) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day, hour, 0, 0, 0)
}

function toDateTimeInputFromKey(key, hour) {
  const date = fromDateKey(key, hour)
  return `${toDateKey(date)}T${pad(date.getHours())}:00`
}

function parseDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function monthTitle(date) {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getMonthDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells = Array.from({ length: startOffset }, (_, index) => ({ key: `empty-${index}`, empty: true }))

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    cells.push({ key: toDateKey(date), date })
  }

  return cells
}

function getCalendarRange(monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 2, 0)
  return { dateFrom: toDateKey(start), dateTo: toDateKey(end) }
}

function normalizeBookings(bookings) {
  return bookings
    .map((booking) => ({
      checkIn: parseDateTime(booking.checkIn),
      checkOut: parseDateTime(booking.checkOut),
    }))
    .filter((booking) => booking.checkIn && booking.checkOut)
}

function getDayBookingState(dateKey, bookings) {
  let hasCheckIn = false
  let hasCheckOut = false
  let hasMiddle = false
  const dayDate = fromDateKey(dateKey, 0)

  bookings.forEach((booking) => {
    const checkInKey = toDateKey(booking.checkIn)
    const checkOutKey = toDateKey(booking.checkOut)
    if (dateKey === checkInKey) hasCheckIn = true
    if (dateKey === checkOutKey) hasCheckOut = true
    if (dayDate > fromDateKey(checkInKey, 0) && dayDate < fromDateKey(checkOutKey, 0)) {
      hasMiddle = true
    }
  })

  return {
    hasBooking: hasCheckIn || hasCheckOut || hasMiddle,
    fullyBlocked: hasMiddle || (hasCheckIn && hasCheckOut),
    hasCheckIn,
    hasCheckOut,
  }
}

function overlapsBooking(startKey, endKey, bookings) {
  const start = fromDateKey(startKey, CHECK_IN_HOUR)
  const end = fromDateKey(endKey, CHECK_OUT_HOUR)
  return bookings.some((booking) => start < booking.checkOut && end > booking.checkIn)
}

function isInSelectedRange(dateKey, startKey, endKey) {
  if (!startKey) return false
  if (!endKey) return dateKey === startKey
  return dateKey >= startKey && dateKey <= endKey
}

function BookingDateRangeCalendar({ checkIn, checkOut, disabled, onChange, onError, roomId }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selectedDate = parseDateTime(checkIn) || new Date()
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  })
  const [bookings, setBookings] = useState([])

  const startKey = checkIn ? toDateKey(parseDateTime(checkIn)) : ''
  const endKey = checkOut ? toDateKey(parseDateTime(checkOut)) : ''
  const todayKey = toDateKey(new Date())
  const normalizedBookings = useMemo(() => normalizeBookings(bookings), [bookings])
  const months = useMemo(() => [visibleMonth, addMonths(visibleMonth, 1)], [visibleMonth])

  useEffect(() => {
    if (!roomId) return
    const range = getCalendarRange(visibleMonth)
    let active = true
    getRoomBookingCalendar(roomId, range)
      .then((data) => {
        if (active) setBookings(data)
      })
      .catch((error) => {
        if (active) onError?.(error.message || 'Không tải được lịch đặt phòng.')
      })

    return () => {
      active = false
    }
  }, [onError, roomId, visibleMonth])

  const selectDate = (dateKey) => {
    if (disabled) return
    if (dateKey < todayKey) {
      onError?.('Không thể chọn ngày trong quá khứ.')
      return
    }

    const state = getDayBookingState(dateKey, normalizedBookings)
    const selectingStart = !startKey || (startKey && endKey)

    if (selectingStart) {
      if (state.fullyBlocked || state.hasCheckIn) {
        onError?.('Ngày này đã có lịch, không thể chọn làm ngày nhận phòng.')
        return
      }
      onChange({
        checkIn: toDateTimeInputFromKey(dateKey, CHECK_IN_HOUR),
        checkOut: '',
      })
      return
    }

    if (dateKey <= startKey) {
      if (state.fullyBlocked || state.hasCheckIn) {
        onError?.('Ngày này đã có lịch, không thể chọn làm ngày nhận phòng.')
        return
      }
      onChange({
        checkIn: toDateTimeInputFromKey(dateKey, CHECK_IN_HOUR),
        checkOut: '',
      })
      return
    }

    if (overlapsBooking(startKey, dateKey, normalizedBookings)) {
      onError?.('Khoảng ngày đã chọn có lịch đặt phòng.')
      return
    }

    onChange({
      checkIn,
      checkOut: toDateTimeInputFromKey(dateKey, CHECK_OUT_HOUR),
    })
  }

  return (
    <div className="booking-calendar-field">
      <div className="booking-calendar-toolbar">
        <button type="button" className="icon-btn" onClick={() => setVisibleMonth((current) => addMonths(current, -1))} aria-label="Tháng trước">
          <AppIcon name="chevronLeft" />
        </button>
        <strong>{monthTitle(months[0])} - {monthTitle(months[1])}</strong>
        <button type="button" className="icon-btn" onClick={() => setVisibleMonth((current) => addMonths(current, 1))} aria-label="Tháng sau">
          <AppIcon name="chevronRight" />
        </button>
      </div>

      <div className="booking-calendar-months">
        {months.map((month) => (
          <div className="booking-calendar-month" key={month.toISOString()}>
            <h4>{monthTitle(month)}</h4>
            <div className="booking-calendar-weekdays">
              {WEEK_DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="booking-calendar-grid">
              {getMonthDays(month).map((cell) => {
                if (cell.empty) return <span className="booking-calendar-day empty" key={cell.key} />

                const dateKey = toDateKey(cell.date)
                const bookingState = getDayBookingState(dateKey, normalizedBookings)
                const selected = isInSelectedRange(dateKey, startKey, endKey)
                const past = dateKey < todayKey
                const classNames = [
                  'booking-calendar-day',
                  !past && bookingState.hasBooking ? 'booked' : '',
                  !past && bookingState.fullyBlocked ? 'blocked' : '',
                  selected ? 'selected' : '',
                  past ? 'past' : '',
                ].filter(Boolean).join(' ')

                return (
                  <button
                    className={classNames}
                    disabled={disabled || past}
                    key={dateKey}
                    onClick={() => selectDate(dateKey)}
                    type="button"
                  >
                    {cell.date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="booking-calendar-summary">
        <span>Check-in: <strong>{startKey || 'Chưa chọn'}</strong> 14:00</span>
        <span>Check-out: <strong>{endKey || 'Chưa chọn'}</strong> 12:00</span>
      </div>

      <div className="booking-calendar-legend">
        <span><i className="legend-dot booked" /> Có lịch</span>
        <span><i className="legend-dot selected" /> Ngày đã chọn</span>
      </div>
    </div>
  )
}

export default BookingDateRangeCalendar
