function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || 'Chua co'}</strong>
    </div>
  )
}

export default DetailItem
