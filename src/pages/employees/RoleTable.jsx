import AppIcon from '../../components/AppIcon'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

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
          <h2>Danh sach vai tro</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Them vai tro
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tim kiem vai tro</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten hoac mo ta vai tro"
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
      ) : roles.length === 0 ? (
        <EmptyState title="Khong co vai tro" description="Khong tim thay vai tro phu hop." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vai tro</th>
                <th>Mo ta</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                  </td>
                  <td>{role.description || 'Chua co'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="edit-btn compact-btn"
                        onClick={() => onEdit(role)}
                        type="button"
                      >
                        <AppIcon name="edit" />
                        Sua
                      </button>
                      <button
                        className="danger-btn compact-btn"
                        disabled={saving}
                        onClick={() => onDelete(role)}
                        type="button"
                      >
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
          Hien thi {roles.length} / {total} vai tro
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
