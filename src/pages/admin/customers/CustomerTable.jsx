import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import CustomerAvatar from './CustomerAvatar'

function CustomerTable({
  customers,
  loading,
  onApplySearch,
  onCreate,
  onDelete,
  onEdit,
  onHistory,
  onSearchInputChange,
  onStatusChange,
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
          <p className="eyebrow">DANH SACH KHACH HANG</p>
          <h2>Danh sach khach hang</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Them khach hang
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tim kiem khach hang</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten, email hoac so dien thoai"
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
      ) : customers.length === 0 ? (
        <EmptyState title="Khong co khach hang" description="Khong tim thay khach hang phu hop." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khach hang</th>
                <th>Email</th>
                <th>So dien thoai</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="room-type-cell">
                      <CustomerAvatar customer={customer} />
                      <strong>{customer.name}</strong>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <button
                      className={`status-action-pill ${customer.status === 'LOCKED' ? 'locked' : 'active'}`}
                      disabled={!onStatusChange}
                      onClick={() => onStatusChange?.(customer)}
                      type="button"
                    >
                      <AppIcon name={customer.status === 'LOCKED' ? 'unlock' : 'lock'} />
                      {customer.status === 'LOCKED' ? 'Dang khoa' : 'Hoat dong'}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn compact-btn" onClick={() => onView(customer)} type="button">
                        <AppIcon name="eye" />
                        Xem
                      </button>
                      {onEdit && (
                        <button className="edit-btn compact-btn" onClick={() => onEdit(customer)} type="button">
                          <AppIcon name="edit" />
                          Sua
                        </button>
                      )}
                      {onHistory && (
                        <button className="blue-btn compact-btn" onClick={() => onHistory(customer)} type="button">
                          <AppIcon name="history" />
                          Lich su
                        </button>
                      )}
                      {onDelete && (
                        <button className="danger-btn compact-btn" disabled={saving} onClick={() => onDelete(customer)} type="button">
                          <AppIcon name="trash" />
                          Xoa
                        </button>
                      )}
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
          Hien thi {customers.length} / {total} khach hang
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

export default CustomerTable
