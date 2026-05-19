import AppIcon from '../../components/AppIcon'

function RoleConfirmModal({ role, onCancel, onConfirm, saving }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="role-confirm-title">
        <p className="confirm-message" id="role-confirm-title">
          Ban chac chan muon xoa vai tro {role?.name}?
        </p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Huy
          </button>
          <button className="danger-btn" disabled={saving} onClick={onConfirm} type="button">
            <AppIcon name="trash" />
            {saving ? 'Dang xu ly...' : 'Xac nhan xoa'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default RoleConfirmModal
