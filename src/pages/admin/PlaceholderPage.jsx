function PlaceholderPage({ title, endpoint }) {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p className="muted-text">Module này sẽ được bổ sung chi tiết sau khi hoàn thiện giao diện phòng.</p>
        </div>
      </div>
      <div className="panel note-panel">
        <h2>Endpoint</h2>
        <p>{endpoint}</p>
      </div>
    </section>
  )
}

export default PlaceholderPage

