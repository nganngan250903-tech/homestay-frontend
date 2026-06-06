import axios from 'axios'
import { getStoredToken } from './authStorage'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  const isAuthRequest = String(config.url || '').startsWith('/auth/')

  if (token && !isAuthRequest) {
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
    const fallbackMessage = error.response?.status === 401
      ? 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
      : 'Không thể kết nối backend'
    throw new Error(body?.message || (error.response?.status === 401 ? fallbackMessage : error.message || fallbackMessage), {
      cause: error,
    })
  }
}

export { apiClient }
