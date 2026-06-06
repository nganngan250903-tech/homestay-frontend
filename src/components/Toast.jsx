function Toast({ duration = 3000, message, type }) {
  if (!message) {
    return null
  }

  return (
    <div
      className={`toast ${type}`}
      key={`${type}-${message}`}
      style={{ '--toast-duration': `${duration}ms` }}
    >
      {message}
    </div>
  )
}

export default Toast
