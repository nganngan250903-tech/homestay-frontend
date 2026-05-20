function LoadingSpinner({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true"></span>
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
