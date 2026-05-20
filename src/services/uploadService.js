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

export function getCloudinaryPublicId(url) {
  if (!url || !url.includes('/upload/')) {
    return ''
  }

  try {
    const uploadPath = new URL(url).pathname.split('/upload/')[1]
    if (!uploadPath) {
      return ''
    }

    const parts = uploadPath.split('/')
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part))
    const publicIdParts = versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts
    const filename = publicIdParts.pop()
    if (!filename) {
      return ''
    }

    publicIdParts.push(filename.replace(/\.[^/.]+$/, ''))
    return publicIdParts.join('/')
  } catch {
    return ''
  }
}
