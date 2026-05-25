export const PAYMENT_PAGE_SIZE = 12

export const paymentStatuses = [
  { value: 'SUCCESS', label: 'Thành công' },
  { value: 'FAILED', label: 'Thất bại' },
]

export const emptyPaymentFilters = {
  bookingId: '',
}

export function getPaymentStatusLabel(status) {
  return paymentStatuses.find((item) => item.value === status)?.label || status || '-'
}

export function formatCurrency(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(number)
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
