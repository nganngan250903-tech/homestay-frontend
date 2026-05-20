import AppIcon from '../../../components/AppIcon'

function AmenityFormModal({ categories, form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chỉnh sửa tiện nghi' : 'Thêm tiện nghi'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="amenity-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Tien nghi</p>
            <h2 id="amenity-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="form-section-title form-wide">
            <strong>Thông tin tiện nghi</strong>
          </div>
          <label className="field">
            <span>Ten tiện nghi</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Loai tiện nghi</span>
            <select onChange={(event) => onUpdateField('categoryId', event.target.value)} value={form.categoryId}>
              <option value="">Chưa phân loại</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Đang lưu...' : 'Lưu tiện nghi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AmenityFormModal
