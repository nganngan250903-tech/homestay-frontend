import { request } from './api'

export async function uploadImage(file, folder) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await request('/uploads/image', {
    method: 'POST',
    data: formData,
  })

  return response.data
}

export async function deleteCloudImage(publicId) {
  const response = await request(`/uploads/image?publicId=${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
  })

  return response.data
}
