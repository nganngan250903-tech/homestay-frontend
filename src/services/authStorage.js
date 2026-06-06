export const AUTH_STORAGE_KEY = 'homestay_auth'

export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoredAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function getStoredToken() {
  const auth = readStoredAuth()
  return auth?.token || auth?.accessToken || auth?.data?.token || ''
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
