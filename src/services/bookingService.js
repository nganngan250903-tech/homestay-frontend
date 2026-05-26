import { request } from './api'

export async function getBookings(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const response = await request(`/bookings${query.toString() ? `?${query.toString()}` : ''}`)
  return response.data
}

export async function createBooking(payload) {
  const response = await request('/bookings', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function getRoomBookingCalendar(roomId, params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const response = await request(`/rooms/${encodeURIComponent(roomId)}/booking-calendar${query.toString() ? `?${query.toString()}` : ''}`)
  return response.data || []
}

export async function getBooking(id) {
  const response = await request(`/bookings/${id}`)
  return response.data
}

export async function cancelBooking(id) {
  const response = await request(`/bookings/${id}/cancel`, { method: 'POST' })
  return response.data
}

export async function createVnPayPaymentUrl(bookingId) {
  const response = await request(`/payments/vnpay/create/${bookingId}`, { method: 'POST' })
  return response.data
}

export async function confirmDemoPayment(bookingId) {
  const response = await request(`/payments/demo-success/${bookingId}`, { method: 'POST' })
  return response.data
}

export async function confirmVnPayReturnPayment(params) {
  const response = await request('/payments/vnpay/confirm-return', {
    method: 'POST',
    data: params,
  })
  return response.data
}

export async function updateBookingStatus(id, status) {
  const response = await request(`/bookings/${id}/status`, {
    method: 'PATCH',
    data: { status },
  })
  return response.data
}

export async function checkInBooking(id) {
  const response = await request(`/bookings/${id}/check-in`, { method: 'POST' })
  return response.data
}

export async function checkOutBooking(id) {
  const response = await request(`/bookings/${id}/check-out`, { method: 'POST' })
  return response.data
}
