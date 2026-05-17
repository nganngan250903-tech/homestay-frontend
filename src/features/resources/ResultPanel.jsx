function ResultPanel({ result }) {
  return (
    <section className="panel result-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ket qua API</p>
          <h2>Response gan nhat</h2>
        </div>
      </div>
      {result ? (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      ) : (
        <div className="empty-state">
          Chua co du lieu. Hay tao moi hoac tra cuu mot ban ghi tu backend.
        </div>
      )}
    </section>
  )
}

export default ResultPanel
