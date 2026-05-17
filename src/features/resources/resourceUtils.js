export function toNumber(value) {
  return Number(value || 0)
}

export function optionalNumber(value) {
  return value === '' || value === undefined ? null : Number(value)
}

export function nestedId(value) {
  const id = optionalNumber(value)
  return id ? { id } : null
}

export function defaultForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? true : ''
    return acc
  }, {})
}

export function buildDefaultPayload(resource, data) {
  return resource.fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'number' ? optionalNumber(data[field.name]) : data[field.name]
    return acc
  }, {})
}
