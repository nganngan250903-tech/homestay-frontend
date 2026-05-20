export const PAGE_SIZE = 6

export const emptyEmployeeForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  image: '',
  salary: '',
  roleId: '',
}

export function employeeFormFrom(employee) {
  return {
    name: employee.name || '',
    username: employee.username || '',
    email: employee.email || '',
    password: '',
    phone: employee.phone || '',
    address: employee.address || '',
    image: employee.image || '',
    salary: employee.salary ?? '',
    roleId: employee.role?.id ? String(employee.role.id) : '',
  }
}

export function getRoleName(employee) {
  return employee.role?.name || 'EMPLOYEE'
}

export function getRoleLabel(role) {
  return role?.description || role?.name || 'Chưa có'
}

export function getEmployeeRoleLabel(employee) {
  return getRoleLabel(employee.role)
}

export function findEmployeeRoleId(roles) {
  return roles.find((role) => role.name?.toUpperCase() === 'EMPLOYEE')?.id || null
}

export function getSelectableRoles(roles) {
  return roles.filter((role) => role.name?.toUpperCase() !== 'ADMIN')
}

export function buildCreatePayload(form, fallbackRoleId) {
  return {
    name: form.name.trim(),
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password,
    phone: form.phone.trim(),
    address: form.address,
    image: form.image,
    salary: form.salary === '' ? null : Number(form.salary),
    roleId: Number(form.roleId || fallbackRoleId),
  }
}

export function buildUpdatePayload(form, fallbackRoleId) {
  return {
    name: form.name.trim(),
    username: form.username.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address,
    image: form.image,
    salary: form.salary === '' ? null : Number(form.salary),
    roleId: Number(form.roleId || fallbackRoleId),
  }
}
