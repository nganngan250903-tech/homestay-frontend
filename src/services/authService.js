import { request } from './api'

export async function loginAdmin(credentials) {
  const response = await request('/auth/login', {
    method: 'POST',
    data: credentials,
  })

  const auth = response.data
  if (auth?.role !== 'ADMIN') {
    throw new Error('Tai khoan nay khong co quyen ADMIN')
  }

  return auth
}
