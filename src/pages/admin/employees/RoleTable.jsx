import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'

function RoleTable({
  loading,
  onApplySearch,
  onCreate,
  onDelete,
  onEdit,
  onSearchInputChange,
  page,
  roles,
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
          <p className="eyebrow">QUAN LY VAI TRO</p>
          <h2>Danh sach vai trò</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Thêm vai trò
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tìm kiếm vai trò</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten hoac mô tả vai trò"
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
      ) : roles.length === 0 ? (
        <EmptyState title="Không có vai trò" description="Không tìm thấy vai trò phù hợp." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vai trò</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                  </td>
                  <td>{role.description || 'Chưa có'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="edit-btn compact-btn"
                        onClick={() => onEdit(role)}
                        type="button"
                      >
                        <AppIcon name="edit" />
                        Sửa
                      </button>
                      <button
                        className="danger-btn compact-btn"
                        disabled={saving}
                        onClick={() => onDelete(role)}
                        type="button"
                      >
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
          Hiển thị {roles.length} / {total} vai trò
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

export default RoleTable
