function PlaceholderPage({ title, endpoint }) {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin module</p>
          <h1>{title}</h1>
          <p className="muted-text">Module nay se duoc noi chi tiet sau khi hoan thien giao dien phòng.</p>
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
