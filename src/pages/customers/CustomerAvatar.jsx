import { useState } from 'react'

function CustomerAvatar({ customer, size = 'small' }) {
  const [failed, setFailed] = useState(false)
  const initials = (customer?.name || customer?.email || '?').trim().charAt(0).toUpperCase()

  if (customer?.image && !failed) {
    return (
      <img
        className={`customer-avatar ${size}`}
        src={customer.image}
        alt={customer.name || 'Khach hang'}
        onError={() => setFailed(true)}
      />
    )
  }

  return <span className={`customer-avatar placeholder ${size}`}>{initials}</span>
}

export default CustomerAvatar
