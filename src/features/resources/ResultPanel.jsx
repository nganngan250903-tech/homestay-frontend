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
          Chưa có dữ liệu. Hãy tạo mới hoặc tra cứu một bản ghi từ backend.
        </div>
      )}
    </section>
  )
}

export default ResultPanel
