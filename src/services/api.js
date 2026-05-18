import axios from 'axios'
import { readStoredAuth } from './authStorage'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
})

apiClient.interceptors.request.use((config) => {
  const auth = readStoredAuth()
  const token = auth?.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

export async function request(path, options = {}) {
  try {
    const response = await apiClient.request({
      url: path,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : options.data,
      headers: options.headers,
    })

    const body = response.data

    if (body?.status && body.status >= 400) {
      throw new Error(body?.message || `HTTP ${response.status}`)
    }

    return body
  } catch (error) {
    const body = error.response?.data
    throw new Error(body?.message || error.message || 'Khong the ket noi backend', {
      cause: error,
    })
  }
}

export { apiClient }
