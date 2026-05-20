import AppIcon from '../../../components/AppIcon'
import CustomerAvatar from './CustomerAvatar'
import DetailItem from './DetailItem'

function CustomerDetailModal({ customer, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Khach hang</p>
            <h2 id="customer-detail-title">Thong tin chi tiet khach hang</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="customer-profile-head">
          <CustomerAvatar customer={customer} size="large" />
          <div>
            <h2>{customer.name}</h2>
            <span className={`status-pill ${customer.status === 'LOCKED' ? 'occupied' : 'available'}`}>
              {customer.status === 'LOCKED' ? 'Dang khoa' : 'Hoat dong'}
            </span>
          </div>
        </div>

        <div className="detail-list">
          <DetailItem label="Email" value={customer.email} />
          <DetailItem label="So dien thoai" value={customer.phone} />
          <DetailItem label="Dia chi" value={customer.address} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="blue-btn" onClick={() => onEdit(customer)} type="button">
            <AppIcon name="edit" />
            Chinh sua
          </button>
        </div>
      </section>
    </div>
  )
}

export default CustomerDetailModal
