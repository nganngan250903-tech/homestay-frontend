import AppIcon from '../../../components/AppIcon'

function EmployeeConfirmModal({ employee, onCancel, onConfirm, saving }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="employee-confirm-title">
        <p className="confirm-message" id="employee-confirm-title">
          Bạn chắc chắn muốn xóa nhân viên này? Tài khoản sẽ được vô hiệu hóa, không xóa lịch sử liên quan.
        </p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Hủy
          </button>
          <button className="danger-btn" disabled={saving || employee?.active === false} onClick={onConfirm} type="button">
            <AppIcon name="trash" />
            {saving ? 'Đang xử lý...' : 'Xác nhận xóa'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default EmployeeConfirmModal
