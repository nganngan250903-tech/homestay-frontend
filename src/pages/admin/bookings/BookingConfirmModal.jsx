import AppIcon from '../../../components/AppIcon'

const actionConfig = {
  confirm: { label: 'Xác nhận booking', tone: 'save-btn', icon: 'check', message: 'Bạn chắc chắn muốn xác nhận booking này?' },
  cancel: { label: 'Xác nhận hủy', tone: 'danger-btn', icon: 'trash', message: 'Bạn chắc chắn muốn hủy booking này?' },
  checkIn: { label: 'Check-in', tone: 'blue-btn', icon: 'login', message: 'Xác nhận khách đã nhận phòng?' },
  checkOut: { label: 'Check-out', tone: 'edit-btn', icon: 'logout', message: 'Xác nhận khách đã trả phòng?' },
}

function BookingConfirmModal({ confirm, onCancel, onConfirm, saving }) {
  const config = actionConfig[confirm.action] || actionConfig.confirm

  return (
    <div className="modal-backdrop">
      <section className="confirm-modal">
        <div className="modal-head">
          <div>
            <h2>{config.label}</h2>
          </div>
        </div>
        <p className="confirm-message">
          {config.message} Booking của {confirm.booking?.customerName || 'khách hàng'}.
        </p>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" disabled={saving} onClick={onCancel} type="button">
            <AppIcon name="close" />
            Hủy
          </button>
          <button className={config.tone} disabled={saving} onClick={onConfirm} type="button">
            <AppIcon name={config.icon} />
            {config.label}
          </button>
        </div>
      </section>
    </div>
  )
}

export default BookingConfirmModal

