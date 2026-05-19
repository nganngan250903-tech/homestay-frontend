import { useCallback, useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard'
import Toast from '../../components/Toast'
import {
  createEmployee,
  createRole,
  deleteRole,
  getEmployees,
  getRoles,
  updateEmployee,
  updateRole,
} from '../../services/employeeService'
import EmployeeDetailModal from './EmployeeDetailModal'
import EmployeeFormModal from './EmployeeFormModal'
import EmployeeTable from './EmployeeTable'
import RoleConfirmModal from './RoleConfirmModal'
import RoleFormModal from './RoleFormModal'
import RoleTable from './RoleTable'
import {
  PAGE_SIZE,
  buildCreatePayload,
  buildUpdatePayload,
  employeeFormFrom,
  emptyEmployeeForm,
  findEmployeeRoleId,
  getEmployeeRoleLabel,
  getRoleName,
  getSelectableRoles,
} from './employeeUtils'

const emptyRoleForm = { name: '', description: '' }

function EmployeePage() {
  const [employees, setEmployees] = useState([])
  const [roles, setRoles] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [roleSearchInput, setRoleSearchInput] = useState('')
  const [filters, setFilters] = useState({ search: '' })
  const [roleFilters, setRoleFilters] = useState({ search: '' })
  const [page, setPage] = useState(1)
  const [rolePage, setRolePage] = useState(1)
  const [modal, setModal] = useState({ open: false, mode: 'create', employee: null, form: emptyEmployeeForm })
  const [roleModal, setRoleModal] = useState({ open: false, mode: 'create', role: null, form: emptyRoleForm })
  const [detailModal, setDetailModal] = useState({ open: false, employee: null })
  const [roleConfirm, setRoleConfirm] = useState({ open: false, role: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingRole, setSavingRole] = useState(false)
  const [toast, setToast] = useState(null)

  const employeeRoleId = useMemo(() => findEmployeeRoleId(roles), [roles])
  const selectableRoles = useMemo(() => getSelectableRoles(roles), [roles])
  const manageableEmployees = useMemo(
    () => employees.filter((employee) => getRoleName(employee).toUpperCase() !== 'ADMIN'),
    [employees],
  )

  const filteredEmployees = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    return manageableEmployees.filter((employee) => {
      const searchable = [
        employee.name,
        employee.username,
        employee.email,
        employee.phone,
        employee.address,
        getRoleName(employee),
        getEmployeeRoleLabel(employee),
        employee.active === false ? 'da vo hieu hoa' : 'hoat dong',
      ].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(keyword)
    })
  }, [manageableEmployees, filters.search])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE))
  const pagedEmployees = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const filteredRoles = useMemo(() => {
    const keyword = roleFilters.search.trim().toLowerCase()
    return getSelectableRoles(roles).filter((role) => {
      const searchable = [role.name, role.description].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(keyword)
    })
  }, [roles, roleFilters.search])

  const roleTotalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE))
  const pagedRoles = filteredRoles.slice((rolePage - 1) * PAGE_SIZE, rolePage * PAGE_SIZE)

  const loadData = useCallback(async (clearToast = true) => {
    setLoading(true)
    if (clearToast) setToast(null)
    try {
      const [employeeData, roleData] = await Promise.all([getEmployees(), getRoles()])
      setEmployees(employeeData)
      setRoles(roleData)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc nhan vien' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadData)
  }, [loadData])

  const submitSearch = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput })
    setPage(1)
  }

  const submitRoleSearch = (event) => {
    event.preventDefault()
    setRoleFilters({ search: roleSearchInput })
    setRolePage(1)
  }

  const validateUnique = (form, currentId = null) => {
    const sameEmail = employees.find((employee) => employee.email?.toLowerCase() === form.email.trim().toLowerCase() && employee.id !== currentId)
    if (sameEmail) return 'Email da ton tai'

    const sameUsername = employees.find(
      (employee) => employee.username?.toLowerCase() === form.username.trim().toLowerCase() && employee.id !== currentId,
    )
    if (sameUsername) return 'Username da ton tai'

    return ''
  }

  const openCreateModal = () => {
    setModal({
      open: true,
      mode: 'create',
      employee: null,
      form: { ...emptyEmployeeForm, roleId: employeeRoleId ? String(employeeRoleId) : '' },
    })
  }

  const openEditModal = (employee) => {
    setDetailModal({ open: false, employee: null })
    const form = employeeFormFrom(employee)
    if (getRoleName(employee).toUpperCase() === 'ADMIN') {
      form.roleId = employeeRoleId ? String(employeeRoleId) : ''
    }
    setModal({ open: true, mode: 'edit', employee, form })
  }

  const closeModal = () => {
    setModal({ open: false, mode: 'create', employee: null, form: emptyEmployeeForm })
  }

  const updateField = (field, value) => {
    setModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const updateRoleField = (field, value) => {
    setRoleModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const openCreateRoleModal = () => {
    setRoleModal({ open: true, mode: 'create', role: null, form: emptyRoleForm })
  }

  const openEditRoleModal = (role) => {
    if (role.name?.toUpperCase() === 'ADMIN') {
      setToast({ type: 'error', message: 'Khong sua vai tro ADMIN tai day' })
      return
    }
    setRoleModal({ open: true, mode: 'edit', role, form: { name: role.name || '', description: role.description || '' } })
  }

  const closeRoleModal = () => {
    setRoleModal({ open: false, mode: 'create', role: null, form: emptyRoleForm })
  }

  const submitEmployee = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)

    const uniqueError = validateUnique(modal.form, modal.employee?.id)
    if (uniqueError) {
      setToast({ type: 'error', message: uniqueError })
      setSaving(false)
      return
    }

    const selectedRoleId = modal.form.roleId || employeeRoleId
    if (!selectedRoleId) {
      setToast({ type: 'error', message: 'Chua chon vai tro cho nhan vien' })
      setSaving(false)
      return
    }

    try {
      if (modal.mode === 'edit') {
        await updateEmployee(modal.employee.id, buildUpdatePayload(modal.form, selectedRoleId))
        await loadData(false)
        setToast({ type: 'success', message: 'Cap nhat du lieu thanh cong' })
      } else {
        await createEmployee(buildCreatePayload(modal.form, selectedRoleId))
        await loadData(false)
        setToast({ type: 'success', message: 'Da them thanh cong' })
      }
      closeModal()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc nhan vien' })
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteRole = (role) => {
    if (role.name?.toUpperCase() === 'ADMIN') {
      setToast({ type: 'error', message: 'Khong xoa vai tro ADMIN' })
      return
    }
    setRoleConfirm({ open: true, role })
  }

  const toggleEmployeeStatus = async (employee) => {
    setSaving(true)
    setToast(null)
    const nextActive = employee.active === false
    try {
      await updateEmployee(employee.id, { active: nextActive })
      await loadData(false)
      setToast({ type: 'success', message: 'Cap nhat du lieu thanh cong' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong cap nhat trang thai nhan vien' })
    } finally {
      setSaving(false)
    }
  }

  const submitRole = async (event) => {
    event.preventDefault()
    setSavingRole(true)
    setToast(null)

    const roleName = roleModal.form.name.trim()
    if (roleName.toUpperCase() === 'ADMIN') {
      setToast({ type: 'error', message: 'Khong tao hoac sua vai tro ADMIN tai day' })
      setSavingRole(false)
      return
    }

    const sameName = roles.find((role) => role.name?.toLowerCase() === roleName.toLowerCase() && role.id !== roleModal.role?.id)
    if (sameName) {
      setToast({ type: 'error', message: 'Ten vai tro da ton tai' })
      setSavingRole(false)
      return
    }

    const payload = { name: roleName, description: roleModal.form.description }

    try {
      if (roleModal.mode === 'edit') {
        await updateRole(roleModal.role.id, payload)
        setToast({ type: 'success', message: 'Cap nhat du lieu thanh cong' })
      } else {
        await createRole(payload)
        setToast({ type: 'success', message: 'Da them thanh cong' })
      }
      closeRoleModal()
      await loadData(false)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc vai tro' })
    } finally {
      setSavingRole(false)
    }
  }

  const closeRoleConfirm = () => {
    if (!savingRole) setRoleConfirm({ open: false, role: null })
  }

  const confirmDeleteRole = async () => {
    setSavingRole(true)
    setToast(null)
    try {
      await deleteRole(roleConfirm.role.id)
      await loadData(false)
      setToast({ type: 'delete', message: 'Da xoa thanh cong' })
      closeRoleConfirm()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong xoa duoc vai tro' })
    } finally {
      setSavingRole(false)
    }
  }

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Tong nhan vien" value={manageableEmployees.length} />
        <StatCard label="Dang hoat dong" value={manageableEmployees.filter((item) => item.active !== false).length} tone="mint" />
        <StatCard label="Da vo hieu hoa" value={manageableEmployees.filter((item) => item.active === false).length} tone="cream" />
      </div>

      <EmployeeTable
        employees={pagedEmployees}
        loading={loading}
        onApplySearch={submitSearch}
        onCreate={openCreateModal}
        onEdit={openEditModal}
        onSearchInputChange={setSearchInput}
        onStatusChange={toggleEmployeeStatus}
        onView={(employee) => setDetailModal({ open: true, employee })}
        page={page}
        searchInput={searchInput}
        setPage={setPage}
        total={filteredEmployees.length}
        totalPages={totalPages}
        saving={saving}
      />

      <RoleTable
        loading={loading}
        onApplySearch={submitRoleSearch}
        onCreate={openCreateRoleModal}
        onDelete={requestDeleteRole}
        onEdit={openEditRoleModal}
        onSearchInputChange={setRoleSearchInput}
        page={rolePage}
        roles={pagedRoles}
        searchInput={roleSearchInput}
        setPage={setRolePage}
        total={filteredRoles.length}
        totalPages={roleTotalPages}
        saving={savingRole}
      />

      {detailModal.open && detailModal.employee && (
        <EmployeeDetailModal
          employee={detailModal.employee}
          onClose={() => setDetailModal({ open: false, employee: null })}
          onEdit={openEditModal}
        />
      )}

      {modal.open && (
        <EmployeeFormModal
          form={modal.form}
          mode={modal.mode}
          onClose={closeModal}
          onSubmit={submitEmployee}
          onUpdateField={updateField}
          roles={selectableRoles}
          saving={saving}
        />
      )}

      {roleModal.open && (
        <RoleFormModal
          form={roleModal.form}
          mode={roleModal.mode}
          onClose={closeRoleModal}
          onSubmit={submitRole}
          onUpdateField={updateRoleField}
          saving={savingRole}
        />
      )}

      {roleConfirm.open && roleConfirm.role && (
        <RoleConfirmModal role={roleConfirm.role} onCancel={closeRoleConfirm} onConfirm={confirmDeleteRole} saving={savingRole} />
      )}
    </section>
  )
}

export default EmployeePage
