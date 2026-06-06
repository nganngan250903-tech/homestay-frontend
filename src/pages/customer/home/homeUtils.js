export function formatRoomPrice(value) {
  if (!value) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN').format(Number(value))
}

export function getRoomTypePrice(roomType, pricings) {
  const pricing = pricings
    .filter((item) => item.roomType?.id === roomType.id)
    .sort((first, second) => {
      const firstActive = first.status ? 1 : 0
      const secondActive = second.status ? 1 : 0
      if (firstActive !== secondActive) return secondActive - firstActive
      return new Date(second.startDate || 0) - new Date(first.startDate || 0)
    })[0]

  return pricing?.basePrice
}

export function customerFormFrom(customer) {
  return {
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    image: customer?.image || '',
  }
}
