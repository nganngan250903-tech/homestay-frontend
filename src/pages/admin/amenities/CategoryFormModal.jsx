import AppIcon from '../../../components/AppIcon'

function CategoryFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chinh sua loai tien nghi' : 'Them loai tien nghi'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Loai tien nghi</p>
            <h2 id="category-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <div className="form-section-title form-wide">
            <strong>Thong tin loai tien nghi</strong>
          </div>
          <label className="field">
            <span>Ten loai tien nghi</span>
            <input onChange={(event) => onUpdateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field form-wide">
            <span>Mo ta</span>
            <textarea onChange={(event) => onUpdateField('description', event.target.value)} value={form.description} />
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" onClick={onClose} type="button">
              <AppIcon name="close" />
              Huy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              {saving ? 'Dang luu...' : 'Luu loai tien nghi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CategoryFormModal
