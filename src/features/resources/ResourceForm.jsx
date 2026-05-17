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
        <button className="primary-btn" disabled={loading} type="submit">
          Tao du lieu
        </button>
        <button className="ghost-btn" type="button" onClick={onReset}>
          Lam moi form
        </button>
      </div>
    </form>
  )
}

export default ResourceForm
