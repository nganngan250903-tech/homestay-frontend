import { request } from './api'

export async function getStatisticsOverview() {
  const response = await request('/statistics/overview')
  return response.data || {}
}
