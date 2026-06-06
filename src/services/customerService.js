import { request } from './api'

export async function getCustomers(keyword = '') {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  const response = await request(`/customers${query}`)
  return response.data || []
}

export async function lookupCustomers(keyword = '') {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  const response = await request(`/customers/lookup${query}`)
  return response.data || []
}

export async function getCustomer(id) {
  const response = await request(`/customers/${id}`)
  return response.data
}

export async function createCustomer(payload) {
  const response = await request('/customers', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function createQuickCustomer(payload) {
  const response = await request('/customers/quick', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateCustomer(id, payload) {
  const response = await request(`/customers/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function updateCustomerStatus(id, status) {
  const response = await request(`/customers/${id}/status`, {
    method: 'PATCH',
    data: { status },
  })
  return response.data
}

export async function getCustomerBookings(id) {
  const response = await request(`/customers/${id}/bookings`)
  return response.data || []
}

export async function deleteCustomer(id) {
  const response = await request(`/customers/${id}`, { method: 'DELETE' })
  return response.data
}
