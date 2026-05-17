function Brand({ subtitle = 'Quan ly van hanh' }) {
  return (
    <div className="brand">
      <span className="brand-mark">H</span>
      <div>
        <p>Homestay Manager</p>
        <small>{subtitle}</small>
      </div>
    </div>
  )
}

export default Brand
