import AppIcon from '../../../components/AppIcon'

function RoleConfirmModal({ role, onCancel, onConfirm, saving }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="role-confirm-title">
        <p className="confirm-message" id="role-confirm-title">
          Bạn chắc chắn muốn xóa vai trò {role?.name}?
        </p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Hủy
          </button>
          <button className="danger-btn" disabled={saving} onClick={onConfirm} type="button">
            <AppIcon name="trash" />
            {saving ? 'Đang xử lý...' : 'Xác nhận xóa'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default RoleConfirmModal
