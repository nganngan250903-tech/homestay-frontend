import AppIcon from '../../../components/AppIcon'
import DetailItem from './DetailItem'

function AmenityDetailModal({ amenity, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="amenity-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Tien nghi</p>
            <h2 id="amenity-detail-title">Thong tin chi tiet tien nghi</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>
        <div className="detail-list">
          <DetailItem label="Ten tien nghi" value={amenity.name} />
          <DetailItem label="Loai tien nghi" value={amenity.category?.name} />
        </div>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="blue-btn" onClick={() => onEdit(amenity)} type="button">
            <AppIcon name="edit" />
            Chinh sua
          </button>
        </div>
      </section>
    </div>
  )
}

export default AmenityDetailModal
