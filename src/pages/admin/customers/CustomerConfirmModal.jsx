import AppIcon from '../../../components/AppIcon'

function CustomerConfirmModal({ confirm, onCancel, onConfirm, saving }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="customer-confirm-title">
        <p className="confirm-message" id="customer-confirm-title">{confirm.message}</p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
          <button className={confirm.action === 'delete' ? 'danger-btn' : 'blue-btn'} disabled={saving} onClick={onConfirm} type="button">
            <AppIcon name={confirm.action === 'delete' ? 'trash' : confirm.nextStatus === 'LOCKED' ? 'lock' : 'unlock'} />
            {saving ? 'Đang xử lý...' : confirm.label}
          </button>
        </div>
      </section>
    </div>
  )
}

export default CustomerConfirmModal
