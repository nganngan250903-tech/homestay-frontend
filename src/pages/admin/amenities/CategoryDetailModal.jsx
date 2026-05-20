import AppIcon from '../../../components/AppIcon'
import DetailItem from './DetailItem'

function CategoryDetailModal({ category, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="category-detail-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Loai tiện nghi</p>
            <h2 id="category-detail-title">Thông tin chi tiết loại tiện nghi</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>
        <div className="detail-list">
          <DetailItem label="Ten loai tiện nghi" value={category.name} />
          <DetailItem label="Mô tả" value={category.description} />
        </div>
        <div className="modal-actions detail-actions">
          <button className="cancel-btn" onClick={onClose} type="button">
            <AppIcon name="close" />
            Đóng
          </button>
          <button className="blue-btn" onClick={() => onEdit(category)} type="button">
            <AppIcon name="edit" />
            Chỉnh sửa
          </button>
        </div>
      </section>
    </div>
  )
}

export default CategoryDetailModal
