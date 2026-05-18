import { request } from './api'

export async function getRooms() {
  const response = await request('/rooms')
  return response.data || []
}

export async function createRoom(payload) {
  const response = await request('/rooms', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateRoom(id, payload) {
  const response = await request(`/rooms/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function deleteRoom(id) {
  const response = await request(`/rooms/${id}`, { method: 'DELETE' })
  return response.data
}

export async function getRoomTypes() {
  const response = await request('/roomTypes')
  return response.data || []
}

export async function getBranches() {
  const response = await request('/branches')
  return response.data || []
}

export async function getAmenities() {
  const response = await request('/amenities')
  return response.data || []
}

export async function createRoomType(payload) {
  const response = await request('/roomTypes', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateRoomType(id, payload) {
  const response = await request(`/roomTypes/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function deleteRoomType(id) {
  const response = await request(`/roomTypes/${id}`, { method: 'DELETE' })
  return response.data
}
