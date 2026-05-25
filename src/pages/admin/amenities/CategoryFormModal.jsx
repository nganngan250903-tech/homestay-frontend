import AppIcon from '../../../components/AppIcon'

function CategoryFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chỉnh sửa loại tiện nghi' : 'Thêm loại tiện nghi'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="category-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="form-section-title form-wide">
            <strong>Thông tin loại tiện nghi</strong>
          </div>
          <label className="field">
            <span>Tên loại tiện nghi</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field form-wide">
            <span>Mô tả</span>
            <textarea onChange={(event) => onUpdateField('description', event.target.value)} value={form.description} />
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu loại tiện nghi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CategoryFormModal
