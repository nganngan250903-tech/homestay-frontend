import AppIcon from '../../../components/AppIcon'
import DetailItem from './DetailItem'

function AmenityDetailModal({ amenity, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="amenity-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="amenity-detail-title">Thông tin chi tiết tiện nghi</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>
        <div className="detail-list">
          <DetailItem label="Tên tiện nghi" value={amenity.name} />
          <DetailItem label="Loại tiện nghi" value={amenity.category?.name} />
        </div>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
          <button className="blue-btn" onClick={() => onEdit(amenity)} type="button">
            <AppIcon name="edit" />
            Chỉnh sửa
          </button>
        </div>
      </section>
    </div>
  )
}

export default AmenityDetailModal
