import { request } from './api'

export async function createBooking(payload) {
  const response = await request('/bookings', {
    method: 'POST',
    data: payload,
  })
  return response.data
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

export async function updateBookingStatus(id, status) {
  const response = await request(`/bookings/${id}/status`, {
    method: 'PATCH',
    data: { status },
  })
  return response.data
}
