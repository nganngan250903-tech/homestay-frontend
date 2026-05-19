import AppIcon from '../../components/AppIcon'

function AmenityFormModal({ categories, form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chinh sua tien nghi' : 'Them tien nghi'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="amenity-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Tien nghi</p>
            <h2 id="amenity-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="form-section-title form-wide">
            <strong>Thong tin tien nghi</strong>
          </div>
          <label className="field">
            <span>Ten tien nghi</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>Loai tien nghi</span>
            <select onChange={(event) => onUpdateField('categoryId', event.target.value)} value={form.categoryId}>
              <option value="">Chua phan loai</option>
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
              Huy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu tien nghi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AmenityFormModal
