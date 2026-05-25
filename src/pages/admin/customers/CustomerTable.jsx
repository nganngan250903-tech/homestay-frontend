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
          <h2>Danh sách khách hàng</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Thêm khách hàng
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tìm kiếm khách hàng</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Tên, email hoặc số điện thoại"
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
      ) : customers.length === 0 ? (
        <EmptyState title="Không có khách hàng" description="Không tìm thấy khách hàng phù hợp." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
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
                      {customer.status === 'LOCKED' ? 'Đang khóa' : 'Hoạt động'}
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
                          Sửa
                        </button>
                      )}
                      {onHistory && (
                        <button className="blue-btn compact-btn" onClick={() => onHistory(customer)} type="button">
                          <AppIcon name="history" />
                          Lịch sử
                        </button>
                      )}
                      {onDelete && (
                        <button className="danger-btn compact-btn" disabled={saving} onClick={() => onDelete(customer)} type="button">
                          <AppIcon name="trash" />
                          Xóa
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
          Hiển thị {customers.length} / {total} khách hàng
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

