import AppIcon from '../../components/AppIcon'

function RoleFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chinh sua vai tro' : 'Them vai tro'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="role-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <p className="eyebrow">Vai tro</p>
            <h2 id="role-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Ten vai tro</span>
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
              {saving ? 'Dang luu...' : 'Luu vai tro'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default RoleFormModal
