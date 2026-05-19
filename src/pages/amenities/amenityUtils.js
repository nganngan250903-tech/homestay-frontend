export const PAGE_SIZE = 6
export const emptyAmenityForm = { name: '', categoryId: '' }
export const emptyCategoryForm = { name: '', description: '' }

export function amenityIconName(name = '') {
  const value = name.toLowerCase()
  if (value.includes('wifi')) return 'wifi'
  if (value.includes('dieu hoa') || value.includes('may lanh')) return 'snowflake'
  if (value.includes('tv') || value.includes('tivi')) return 'tv'
  if (value.includes('xe') || value.includes('parking')) return 'car'
  if (value.includes('bep') || value.includes('an')) return 'utensils'
  if (value.includes('tam') || value.includes('bath')) return 'bath'
  if (value.includes('cafe') || value.includes('coffee')) return 'coffee'
  return 'sparkles'
}

export function amenityFormFrom(amenity) {
  return {
    name: amenity.name || '',
    categoryId: amenity.category?.id ? String(amenity.category.id) : '',
  }
}

export function categoryFormFrom(category) {
  return {
    name: category.name || '',
    description: category.description || '',
  }
}
