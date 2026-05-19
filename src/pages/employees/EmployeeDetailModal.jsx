import AppIcon from '../../components/AppIcon'
import DetailItem from '../customers/DetailItem'
import EmployeeAvatar from './EmployeeAvatar'
import { getEmployeeRoleLabel, getRoleName } from './employeeUtils'

function EmployeeDetailModal({ employee, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="employee-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Nhan vien</p>
            <h2 id="employee-detail-title">Thong tin chi tiet nhan vien</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="customer-profile-head">
          <EmployeeAvatar employee={employee} size="large" />
          <div>
            <h2>{employee.name}</h2>
            <span className={`status-pill ${employee.active === false ? 'occupied' : 'available'}`}>
              {employee.active === false ? 'Da vo hieu hoa' : 'Hoat dong'}
            </span>
          </div>
        </div>

        <div className="detail-list">
          <DetailItem label="Username" value={employee.username} />
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="So dien thoai" value={employee.phone} />
          <DetailItem label="Vai tro" value={getEmployeeRoleLabel(employee)} />
          <DetailItem label="Ma vai tro" value={getRoleName(employee)} />
          <DetailItem label="Luong" value={employee.salary} />
          <DetailItem label="Dia chi" value={employee.address} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="blue-btn" onClick={() => onEdit(employee)} type="button">
            <AppIcon name="edit" />
            Chinh sua
          </button>
        </div>
      </section>
    </div>
  )
}

export default EmployeeDetailModal
