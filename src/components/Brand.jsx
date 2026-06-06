function Brand({ subtitle = 'Trang quản trị' }) {
  return (
    <div className="brand">
      <img className="brand-logo" src="/logo.jpg" alt="LimDimHomestay" />
      <div>
        <p>Lim Dim Homestay</p>
        <small>{subtitle}</small>
      </div>
    </div>
  )
}

export default Brand
