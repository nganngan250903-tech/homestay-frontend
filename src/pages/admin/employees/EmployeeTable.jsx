import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import EmployeeAvatar from './EmployeeAvatar'
import { getEmployeeRoleLabel } from './employeeUtils'

function EmployeeTable({
  employees,
  loading,
  onApplySearch,
  onCreate,
  onEdit,
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
          <h2>Danh sách nhân viên</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Thêm nhân viên
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tìm kiếm nhân viên</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Tên, username, email hoặc số điện thoại"
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
      ) : employees.length === 0 ? (
        <EmptyState title="Không có nhân viên" description="Không tìm thấy nhân viên phù hợp." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Username</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="room-type-cell">
                      <EmployeeAvatar employee={employee} />
                      <strong>{employee.name}</strong>
                    </div>
                  </td>
                  <td>{employee.username || '-'}</td>
                  <td>{employee.email}</td>
                  <td>{getEmployeeRoleLabel(employee)}</td>
                  <td>
                    <span className={`status-pill ${employee.active === false ? 'occupied' : 'available'}`}>
                      {employee.active === false ? 'Đã vô hiệu hóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn compact-btn" onClick={() => onView(employee)} type="button">
                        <AppIcon name="eye" />
                        Xem
                      </button>
                      <button className="edit-btn compact-btn" onClick={() => onEdit(employee)} type="button">
                        <AppIcon name="edit" />
                        Sửa
                      </button>
                      <button
                        className={`status-action-pill ${employee.active === false ? 'active' : 'locked'}`}
                        disabled={saving}
                        onClick={() => onStatusChange(employee)}
                        type="button"
                      >
                        <AppIcon name={employee.active === false ? 'unlock' : 'lock'} />
                        {employee.active === false ? 'Mở khóa' : 'Khóa'}
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
          Hiển thị {employees.length} / {total} nhân viên
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

export default EmployeeTable
