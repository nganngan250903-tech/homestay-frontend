import { request } from './api'

export async function loginStaff(credentials) {
  const response = await request('/auth/login', {
    method: 'POST',
    data: credentials,
  })

  const auth = response.data
  if (!['ADMIN', 'EMPLOYEE'].includes(auth?.role)) {
    throw new Error('Tai khoan nay khong co quyen truy cap he thong quan ly')
  }

  return auth
}
