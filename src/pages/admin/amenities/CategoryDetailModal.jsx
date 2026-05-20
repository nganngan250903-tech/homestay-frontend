import AppIcon from '../../../components/AppIcon'
import DetailItem from './DetailItem'

function CategoryDetailModal({ category, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="category-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Loai tien nghi</p>
            <h2 id="category-detail-title">Thong tin chi tiet loai tien nghi</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>
        <div className="detail-list">
          <DetailItem label="Ten loai tien nghi" value={category.name} />
          <DetailItem label="Mo ta" value={category.description} />
        </div>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Dong
          </button>
          <button className="blue-btn" onClick={() => onEdit(category)} type="button">
            <AppIcon name="edit" />
            Chinh sua
          </button>
        </div>
      </section>
    </div>
  )
}

export default CategoryDetailModal
