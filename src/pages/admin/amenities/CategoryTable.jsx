import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'

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
          <h2>Danh sach loai tiện nghi</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Thêm loai tiện nghi
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tìm kiếm loai tiện nghi</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten hoac mô tả"
            value={searchInput}
          />
        </label>
        <div className="room-toolbar-action">
          <button className="blue-btn" type="submit">
            <AppIcon name="search" />
            Tìm kiếm
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState title="Không có loại tiện nghi" description="Không tìm thấy loại tiện nghi phù hợp." />
      ) : (
        <div className="table-wrap">
          <table className="data-table room-type-table">
            <thead>
              <tr>
                <th>Loai tiện nghi</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>{category.description || 'Chưa có'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn compact-btn" onClick={() => onView(category)} type="button">
                        <AppIcon name="eye" />
                        Xem
                      </button>
                      <button className="edit-btn compact-btn" onClick={() => onEdit(category)} type="button">
                        <AppIcon name="edit" />
                        Sửa
                      </button>
                      <button className="danger-btn compact-btn" disabled={saving} onClick={() => onDelete(category)} type="button">
                        <AppIcon name="trash" />
                        Xóa
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
          Hiển thị {categories.length} / {total} loai tiện nghi
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
