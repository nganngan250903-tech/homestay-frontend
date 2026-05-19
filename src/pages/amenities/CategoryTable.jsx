import AppIcon from '../../components/AppIcon'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

function CategoryTable({
  categories,
  loading,
  onApplySearch,
  onCreate,
  onDelete,
  onEdit,
  onSearchInputChange,
  onView,
  page,
  searchInput,
  setPage,
  total,
  totalPages,
  saving,
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">DANH SACH LOAI TIEN NGHI</p>
          <h2>Danh sach loai tien nghi</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Them loai tien nghi
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tim kiem loai tien nghi</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten hoac mo ta"
            value={searchInput}
          />
        </label>
        <div className="room-toolbar-action">
          <button className="blue-btn" type="submit">
            <AppIcon name="search" />
            Tim kiem
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState title="Khong co loai tien nghi" description="Khong tim thay loai tien nghi phu hop." />
      ) : (
        <div className="table-wrap">
          <table className="data-table room-type-table">
            <thead>
              <tr>
                <th>Loai tien nghi</th>
                <th>Mo ta</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>{category.description || 'Chua co'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn compact-btn" onClick={() => onView(category)} type="button">
                        <AppIcon name="eye" />
                        Xem
                      </button>
                      <button className="edit-btn compact-btn" onClick={() => onEdit(category)} type="button">
                        <AppIcon name="edit" />
                        Sua
                      </button>
                      <button className="danger-btn compact-btn" disabled={saving} onClick={() => onDelete(category)} type="button">
                        <AppIcon name="trash" />
                        Xoa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-bar">
        <span>
          Hien thi {categories.length} / {total} loai tien nghi
        </span>
        <div className="pagination-actions">
          <button className="cancel-btn compact-btn" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
            <AppIcon name="chevronLeft" />
            Truoc
          </button>
          <strong>{page} / {totalPages}</strong>
          <button className="cancel-btn compact-btn" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">
            <AppIcon name="chevronRight" />
            Sau
          </button>
        </div>
      </div>
    </section>
  )
}

export default CategoryTable
