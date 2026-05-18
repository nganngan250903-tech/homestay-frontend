function Brand({ subtitle = 'Admin Management' }) {
  return (
    <div className="brand">
      <img className="brand-logo" src="/logo.jpg" alt="LimDimHomestay" />
      <div>
        <p>LimDimHomestay</p>
        <small>{subtitle}</small>
      </div>
    </div>
  )
}

export default Brand