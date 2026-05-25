import AppIcon from '../../../components/AppIcon'
import DetailItem from '../customers/DetailItem'
import EmployeeAvatar from './EmployeeAvatar'
import { getEmployeeRoleLabel, getRoleName } from './employeeUtils'

function EmployeeDetailModal({ employee, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="employee-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="employee-detail-title">Thông tin chi tiết nhân viên</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="customer-profile-head">
          <EmployeeAvatar employee={employee} size="large" />
          <div>
            <h2>{employee.name}</h2>
            <span className={`status-pill ${employee.active === false ? 'occupied' : 'available'}`}>
              {employee.active === false ? 'Đã vô hiệu hóa' : 'Hoạt động'}
            </span>
          </div>
        </div>

        <div className="detail-list">
          <DetailItem label="Username" value={employee.username} />
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="Số điện thoại" value={employee.phone} />
          <DetailItem label="Vai trò" value={getEmployeeRoleLabel(employee)} />
          <DetailItem label="Mã vai trò" value={getRoleName(employee)} />
          <DetailItem label="Lương" value={employee.salary} />
          <DetailItem label="Địa chỉ" value={employee.address} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
          <button className="blue-btn" onClick={() => onEdit(employee)} type="button">
            <AppIcon name="edit" />
            Chỉnh sửa
          </button>
        </div>
      </section>
    </div>
  )
}

export default EmployeeDetailModal
