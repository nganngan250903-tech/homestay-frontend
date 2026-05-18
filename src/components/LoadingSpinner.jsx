function LoadingSpinner({ label = 'Dang tai du lieu...' }) {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true"></span>
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
