import AppIcon from '../../components/AppIcon'

function ResourceForm({ form, loading, onReset, onSubmit, onUpdateField, resource }) {
  return (
    <form className="resource-form" onSubmit={onSubmit}>
      {resource.fields.map((field) => (
        <label className={field.type === 'checkbox' ? 'check-field' : 'field'} key={field.name}>
          <span>{field.label}</span>
          {field.type === 'checkbox' ? (
            <input
              checked={Boolean(form[field.name])}
              onChange={(event) => onUpdateField(field.name, event.target.checked)}
              type="checkbox"
            />
          ) : (
            <input
              onChange={(event) => onUpdateField(field.name, event.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
              type={field.type || 'text'}
              value={form[field.name]}
            />
          )}
        </label>
      ))}

      <div className="form-actions">
        <button className="save-btn" disabled={loading} type="submit">
          <AppIcon name="save" />
          Tao du lieu
        </button>
        <button className="cancel-btn" type="button" onClick={onReset}>
          <AppIcon name="reset" />
          Lam moi form
        </button>
      </div>
    </form>
  )
}

export default ResourceForm
