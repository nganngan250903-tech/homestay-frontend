import { request } from './api'

export async function getPayments(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const response = await request(`/payments${query.toString() ? `?${query}` : ''}`)
  return response.data
}
