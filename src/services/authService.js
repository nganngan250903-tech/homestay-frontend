import { request } from './api'

export async function loginStaff(credentials) {
  const response = await request('/auth/login', {
    method: 'POST',
    data: credentials,
  })

  const auth = response.data
  if (!['ADMIN', 'EMPLOYEE'].includes(auth?.role)) {
    throw new Error('Tài khoản này không có quyền truy cập hệ thống quản lý')
  }

  return auth
}
