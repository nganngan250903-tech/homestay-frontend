import AppIcon from '../../../components/AppIcon'
import CustomerAvatar from './CustomerAvatar'
import DetailItem from './DetailItem'

function CustomerDetailModal({ customer, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="customer-detail-title">Thông tin chi tiết khách hàng</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <div className="customer-profile-head">
          <CustomerAvatar customer={customer} size="large" />
          <div>
            <h2>{customer.name}</h2>
            <span className={`status-pill ${customer.status === 'LOCKED' ? 'occupied' : 'available'}`}>
              {customer.status === 'LOCKED' ? 'Đang khóa' : 'Hoạt động'}
            </span>
          </div>
        </div>

        <div className="detail-list">
          <DetailItem label="Email" value={customer.email} />
          <DetailItem label="Số điện thoại" value={customer.phone} />
          <DetailItem label="Địa chỉ" value={customer.address} />
        </div>

        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
          <button className="blue-btn" onClick={() => onEdit(customer)} type="button">
            <AppIcon name="edit" />
            Chỉnh sửa
          </button>
        </div>
      </section>
    </div>
  )
}

export default CustomerDetailModal

