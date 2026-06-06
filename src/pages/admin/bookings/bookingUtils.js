export const BOOKING_PAGE_SIZE = 8

export const bookingStatuses = [
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'NO_SHOW', label: 'Không đến' },
]

export const emptyBookingForm = {
  customerId: '',
  customerKeyword: '',
  roomId: '',
  checkIn: '',
  checkOut: '',
  guestCount: 1,
}

export function getBookingStatusLabel(status) {
  return bookingStatuses.find((item) => item.value === status)?.label || status || '-'
}

export function getStayStatus(booking) {
  if (booking.actualCheckOutAt) return 'Đã trả phòng'
  if (booking.actualCheckInAt) return 'Đã nhận phòng'
  return 'Chưa nhận phòng'
}

export function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

export function roomLabel(room) {
  if (!room) return '-'
  const name = room.name || 'Phòng'
  const roomType = room.roomType?.name ? ` - ${room.roomType.name}` : ''
  return `${name}${roomType}`
}
