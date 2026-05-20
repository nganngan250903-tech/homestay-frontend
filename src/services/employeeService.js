import { request } from './api'

export async function getEmployees() {
  const response = await request('/employees')
  return response.data || []
}

export async function getEmployee(id) {
  const response = await request(`/employees/${id}`)
  return response.data
}

export async function getRoles() {
  const response = await request('/roles')
  return response.data || []
}

export async function createRole(payload) {
  const response = await request('/roles', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateRole(id, payload) {
  const response = await request(`/roles/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function deleteRole(id) {
  const response = await request(`/roles/${id}`, { method: 'DELETE' })
  return response.data
}

export async function createEmployee(payload) {
  const response = await request('/employees', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateEmployee(id, payload) {
  const response = await request(`/employees/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function changeEmployeePassword(id, payload) {
  const response = await request(`/employees/${id}/password`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function disableEmployee(id) {
  const response = await request(`/employees/${id}`, { method: 'DELETE' })
  return response.data
}
