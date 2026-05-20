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
          <p className="eyebrow">DANH SACH NHAN VIEN</p>
          <h2>Danh sach nhan vien</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Them nhan vien
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tim kiem nhan vien</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten, username, email hoac so dien thoai"
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
      ) : employees.length === 0 ? (
        <EmptyState title="Khong co nhan vien" description="Khong tim thay nhan vien phu hop." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nhan vien</th>
                <th>Username</th>
                <th>Email</th>
                <th>Vai tro</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
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
                    <button
                      className={`status-action-pill ${employee.active === false ? 'locked' : 'active'}`}
                      disabled={saving}
                      onClick={() => onStatusChange(employee)}
                      type="button"
                    >
                      <AppIcon name={employee.active === false ? 'unlock' : 'lock'} />
                      {employee.active === false ? 'Da vo hieu hoa' : 'Hoat dong'}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn compact-btn" onClick={() => onView(employee)} type="button">
                        <AppIcon name="eye" />
                        Xem
                      </button>
                      <button className="edit-btn compact-btn" onClick={() => onEdit(employee)} type="button">
                        <AppIcon name="edit" />
                        Sua
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
          Hien thi {employees.length} / {total} nhan vien
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
