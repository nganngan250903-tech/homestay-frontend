import AppIcon from '../../../components/AppIcon'

function RoleFormModal({ form, mode, onClose, onSubmit, onUpdateField, saving }) {
  const title = mode === 'edit' ? 'Chỉnh sửa vai trò' : 'Thêm vai trò'

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card room-detail-card" role="dialog" aria-modal="true" aria-labelledby="role-form-title">
        <div className="modal-head detail-modal-head">
          <div>
            <h2 id="role-form-title">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng modal">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid room-edit-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Tên vai trò</span>
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
              {saving ? 'Đang lưu...' : 'Lưu vai trò'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default RoleFormModal
