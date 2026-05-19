import AppIcon from '../../components/AppIcon'

function EmployeeConfirmModal({ employee, onCancel, onConfirm, saving }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="employee-confirm-title">
        <p className="confirm-message" id="employee-confirm-title">
          Ban chac chan muon xoa nhan vien nay? Tai khoan se duoc vo hieu hoa, khong xoa lich su lien quan.
        </p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Huy
          </button>
          <button className="danger-btn" disabled={saving || employee?.active === false} onClick={onConfirm} type="button">
            <AppIcon name="trash" />
            {saving ? 'Dang xu ly...' : 'Xac nhan xoa'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default EmployeeConfirmModal
