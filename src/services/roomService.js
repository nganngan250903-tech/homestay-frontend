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

export async function getBookingsByRoom(roomId) {
  const response = await request(`/bookings?roomId=${encodeURIComponent(roomId)}&page=0&size=10`)
  return response.data?.content || response.data || []
}

export async function createRoomPhoto(roomId, photo) {
  const response = await request('/roomPhotos', {
    method: 'POST',
    data: {
      room: { id: roomId },
      photo,
    },
  })
  return response.data
}

export async function getRoomPhotos() {
  const response = await request('/roomPhotos')
  return response.data || []
}

export async function getRoomPricings() {
  const response = await request('/roomPricings')
  return response.data || []
}

export async function createRoomPricing(payload) {
  const response = await request('/roomPricings', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateRoomPricing(id, payload) {
  const response = await request(`/roomPricings/${id}`, {
    method: 'PATCH',
    data: payload,
  })
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

export async function createAmenity(payload) {
  const response = await request('/amenities', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateAmenity(id, payload) {
  const response = await request(`/amenities/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function deleteAmenity(id) {
  const response = await request(`/amenities/${id}`, { method: 'DELETE' })
  return response.data
}

export async function getCategories() {
  const response = await request('/categories')
  return response.data || []
}

export async function createCategory(payload) {
  const response = await request('/categories', {
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function updateCategory(id, payload) {
  const response = await request(`/categories/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return response.data
}

export async function deleteCategory(id) {
  const response = await request(`/categories/${id}`, { method: 'DELETE' })
  return response.data
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
