import axios from 'axios'
import { getStoredToken } from './authStorage'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
})

const TECHNICAL_MESSAGE_PATTERNS = [
  'could not execute statement',
  'deadlock',
  'sql [',
  'jdbc',
  'hibernate',
  'transaction',
  'constraint',
  'duplicate entry',
  'something went wrong',
]
function isTechnicalMessage(message) {
  const normalized = String(message || '').toLowerCase()
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function createSuppressedError(cause) {
  const error = new Error('')
  error.suppressDisplay = true
  error.cause = cause
  return error
}

export function shouldSuppressError(error) {
  return Boolean(error?.suppressDisplay)
}

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
      if (isTechnicalMessage(body?.message)) {
        throw createSuppressedError()
      }
      throw new Error(body?.message || `HTTP ${response.status}`)
    }

    return body
  } catch (error) {
    if (shouldSuppressError(error)) {
      throw error
    }

    const body = error.response?.data
    if (isTechnicalMessage(body?.message) || isTechnicalMessage(error.message)) {
      throw createSuppressedError(error)
    }

    const fallbackMessage = error.response?.status === 401
      ? 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
      : 'Không thể kết nối backend'
    throw new Error(body?.message || (error.response?.status === 401 ? fallbackMessage : error.message || fallbackMessage), {
      cause: error,
    })
  }
}

export { apiClient }
