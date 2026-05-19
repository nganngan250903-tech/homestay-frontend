import AppIcon from '../../components/AppIcon'

function ConfirmDeleteModal({ message, onCancel, onConfirm, saving }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
        <p className="confirm-message" id="confirm-delete-title">{message}</p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="danger-btn" disabled={saving} onClick={onConfirm} type="button">
            <AppIcon name="trash" />
            {saving ? 'Dang xoa...' : 'Xoa'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDeleteModal
