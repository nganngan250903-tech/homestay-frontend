import { request } from './api'

export async function getStatisticsOverview(filters = {}) {
  const params = new URLSearchParams()
  if (filters.occupancyYear) params.set('occupancyYear', filters.occupancyYear)
  if (filters.occupancyMonth) params.set('occupancyMonth', filters.occupancyMonth)
  const query = params.toString()
  const response = await request(`/statistics/overview${query ? `?${query}` : ''}`)
  return response.data || {}
}
