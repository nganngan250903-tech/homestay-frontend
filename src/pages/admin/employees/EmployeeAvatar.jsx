import { useState } from 'react'

function EmployeeAvatar({ employee, size = 'small' }) {
  const [failed, setFailed] = useState(false)
  const initial = (employee?.name || employee?.email || 'N').trim().charAt(0).toUpperCase()

  if (employee?.image && !failed) {
    return (
      <img
        className={`customer-avatar ${size}`}
        src={employee.image}
        alt={employee.name || employee.email || 'Nhân viên'}
        onError={() => setFailed(true)}
      />
    )
  }

  return <span className={`customer-avatar placeholder ${size}`}>{initial}</span>
}

export default EmployeeAvatar
