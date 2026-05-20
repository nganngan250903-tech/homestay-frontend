export const PAGE_SIZE = 6
export const emptyCustomerForm = { email: '', name: '', phone: '', address: '', image: '', status: 'ACTIVE' }

export function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

export function customerFormFrom(customer) {
  return {
    email: customer.email || '',
    name: customer.name || '',
    phone: customer.phone || '',
    address: customer.address || '',
    image: customer.image || '',
    status: customer.status || 'ACTIVE',
  }
}
