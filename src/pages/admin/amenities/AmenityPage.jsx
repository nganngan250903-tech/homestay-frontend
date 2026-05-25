import { useCallback, useEffect, useMemo, useState } from 'react'
import StatCard from '../../../components/StatCard'
import Toast from '../../../components/Toast'
import {
  createAmenity,
  createCategory,
  deleteAmenity,
  deleteCategory,
  getAmenities,
  getCategories,
  updateAmenity,
  updateCategory,
} from '../../../services/roomService'
import AmenityDetailModal from './AmenityDetailModal'
import AmenityFormModal from './AmenityFormModal'
import AmenityTable from './AmenityTable'
import CategoryDetailModal from './CategoryDetailModal'
import CategoryFormModal from './CategoryFormModal'
import CategoryTable from './CategoryTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import {
  PAGE_SIZE,
  amenityFormFrom,
  categoryFormFrom,
  emptyAmenityForm,
  emptyCategoryForm,
} from './amenityUtils'

function AmenityPage() {
  const [amenities, setAmenities] = useState([])
  const [categories, setCategories] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [categorySearchInput, setCategorySearchInput] = useState('')
  const [filters, setFilters] = useState({ search: '', categorySearch: '' })
  const [page, setPage] = useState(1)
  const [categoryPage, setCategoryPage] = useState(1)
  const [amenityModal, setAmenityModal] = useState({ open: false, mode: 'create', amenity: null, form: emptyAmenityForm })
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', category: null, form: emptyCategoryForm })
  const [amenityDetail, setAmenityDetail] = useState({ open: false, amenity: null })
  const [categoryDetail, setCategoryDetail] = useState({ open: false, category: null })
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: '', item: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const filteredAmenities = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    return amenities.filter((amenity) => {
      const searchable = [amenity.name, amenity.category?.name].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(keyword)
    })
  }, [amenities, filters.search])

  const filteredCategories = useMemo(() => {
    const keyword = filters.categorySearch.trim().toLowerCase()
    return categories.filter((category) => {
      const searchable = [category.name, category.description].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(keyword)
    })
  }, [categories, filters.categorySearch])

  const totalPages = Math.max(1, Math.ceil(filteredAmenities.length / PAGE_SIZE))
  const totalCategoryPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE))
  const pagedAmenities = filteredAmenities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pagedCategories = filteredCategories.slice((categoryPage - 1) * PAGE_SIZE, categoryPage * PAGE_SIZE)

  const loadData = useCallback(async (clearToast = true) => {
    setLoading(true)
    if (clearToast) {
      setToast(null)
    }
    try {
      const [amenityData, categoryData] = await Promise.all([getAmenities(), getCategories()])
      setAmenities(amenityData)
      setCategories(categoryData)
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không tải được tiện nghi' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadData)
  }, [loadData])

  const openCreateAmenity = () => {
    setAmenityModal({ open: true, mode: 'create', amenity: null, form: emptyAmenityForm })
  }

  const openEditAmenity = (amenity) => {
    setAmenityDetail({ open: false, amenity: null })
    setAmenityModal({ open: true, mode: 'edit', amenity, form: amenityFormFrom(amenity) })
  }

  const closeAmenityModal = () => {
    setAmenityModal({ open: false, mode: 'create', amenity: null, form: emptyAmenityForm })
  }

  const openCreateCategory = () => {
    setCategoryModal({ open: true, mode: 'create', category: null, form: emptyCategoryForm })
  }

  const openEditCategory = (category) => {
    setCategoryDetail({ open: false, category: null })
    setCategoryModal({ open: true, mode: 'edit', category, form: categoryFormFrom(category) })
  }

  const closeCategoryModal = () => {
    setCategoryModal({ open: false, mode: 'create', category: null, form: emptyCategoryForm })
  }

  const updateAmenityField = (field, value) => {
    setAmenityModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const updateCategoryField = (field, value) => {
    setCategoryModal((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  const submitAmenity = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)

    const categoryId = amenityModal.form.categoryId ? Number(amenityModal.form.categoryId) : null
    const payload =
      amenityModal.mode === 'edit'
        ? { name: amenityModal.form.name, categoryId }
        : { name: amenityModal.form.name, category: categoryId ? { id: categoryId } : null }

    try {
      if (amenityModal.mode === 'edit') {
        await updateAmenity(amenityModal.amenity.id, payload)
        await loadData(false)
        setToast({ type: 'success', message: 'Cập nhật dữ liệu thành công' })
      } else {
        await createAmenity(payload)
        await loadData(false)
        setToast({ type: 'success', message: 'Đã thêm thành công' })
      }
      closeAmenityModal()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không lưu được tiện nghi' })
    } finally {
      setSaving(false)
    }
  }

  const submitCategory = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)

    try {
      if (categoryModal.mode === 'edit') {
        await updateCategory(categoryModal.category.id, categoryModal.form)
        await loadData(false)
        setToast({ type: 'success', message: 'Cập nhật dữ liệu thành công' })
      } else {
        await createCategory(categoryModal.form)
        await loadData(false)
        setToast({ type: 'success', message: 'Đã thêm thành công' })
      }
      closeCategoryModal()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không lưu được loại tiện nghi' })
    } finally {
      setSaving(false)
    }
  }

  const removeAmenity = async (amenity) => {
    setSaving(true)
    setToast(null)
    try {
      await deleteAmenity(amenity.id)
      await loadData(false)
      setConfirmDelete({ open: false, type: '', item: null })
      setToast({ type: 'delete', message: 'Đã xóa thành công' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không xóa được tiện nghi' })
    } finally {
      setSaving(false)
    }
  }

  const removeCategory = async (category) => {
    setSaving(true)
    setToast(null)
    try {
      await deleteCategory(category.id)
      await loadData(false)
      setConfirmDelete({ open: false, type: '', item: null })
      setToast({ type: 'delete', message: 'Đã xóa thành công' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không xóa được loại tiện nghi' })
    } finally {
      setSaving(false)
    }
  }

  const applySearch = (event) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, search: searchInput }))
    setPage(1)
  }

  const applyCategorySearch = (event) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, categorySearch: categorySearchInput }))
    setCategoryPage(1)
  }

  const requestDeleteAmenity = (amenity) => {
    setConfirmDelete({ open: true, type: 'amenity', item: amenity })
  }

  const requestDeleteCategory = (category) => {
    setConfirmDelete({ open: true, type: 'category', item: category })
  }

  const closeConfirmDelete = () => {
    if (!saving) {
      setConfirmDelete({ open: false, type: '', item: null })
    }
  }

  const confirmDeleteItem = () => {
    if (confirmDelete.type === 'amenity') {
      removeAmenity(confirmDelete.item)
      return
    }

    if (confirmDelete.type === 'category') {
      removeCategory(confirmDelete.item)
    }
  }

  return (
    <section className="page-stack">
      <Toast message={toast?.message} type={toast?.type} />

      <div className="stats-grid">
        <StatCard label="Số tiện nghi" value={amenities.length} />
        <StatCard label="Loại tiện nghi" value={categories.length} tone="mint" />
        <StatCard
          label="Chưa phân loại"
          value={amenities.filter((amenity) => !amenity.category?.id).length}
          tone="cream"
        />
      </div>

      <AmenityTable
        amenities={pagedAmenities}
        loading={loading}
        onApplySearch={applySearch}
        onCreate={openCreateAmenity}
        onDelete={requestDeleteAmenity}
        onEdit={openEditAmenity}
        onSearchInputChange={setSearchInput}
        onView={(amenity) => setAmenityDetail({ open: true, amenity })}
        page={page}
        searchInput={searchInput}
        setPage={setPage}
        total={filteredAmenities.length}
        totalPages={totalPages}
        saving={saving}
      />

      <CategoryTable
        categories={pagedCategories}
        loading={loading}
        onApplySearch={applyCategorySearch}
        onCreate={openCreateCategory}
        onDelete={requestDeleteCategory}
        onEdit={openEditCategory}
        onSearchInputChange={setCategorySearchInput}
        onView={(category) => setCategoryDetail({ open: true, category })}
        page={categoryPage}
        searchInput={categorySearchInput}
        setPage={setCategoryPage}
        total={filteredCategories.length}
        totalPages={totalCategoryPages}
        saving={saving}
      />

      {amenityDetail.open && amenityDetail.amenity && (
        <AmenityDetailModal
          amenity={amenityDetail.amenity}
          onClose={() => setAmenityDetail({ open: false, amenity: null })}
          onEdit={openEditAmenity}
        />
      )}

      {categoryDetail.open && categoryDetail.category && (
        <CategoryDetailModal
          category={categoryDetail.category}
          onClose={() => setCategoryDetail({ open: false, category: null })}
          onEdit={openEditCategory}
        />
      )}

      {amenityModal.open && (
        <AmenityFormModal
          categories={categories}
          form={amenityModal.form}
          mode={amenityModal.mode}
          onClose={closeAmenityModal}
          onSubmit={submitAmenity}
          onUpdateField={updateAmenityField}
          saving={saving}
        />
      )}

      {categoryModal.open && (
        <CategoryFormModal
          form={categoryModal.form}
          mode={categoryModal.mode}
          onClose={closeCategoryModal}
          onSubmit={submitCategory}
          onUpdateField={updateCategoryField}
          saving={saving}
        />
      )}

      {confirmDelete.open && confirmDelete.item && (
        <ConfirmDeleteModal
          message={`Bạn chắc chắn muốn xóa ${confirmDelete.type === 'amenity' ? 'tiện nghi' : 'loại tiện nghi'} này`}
          onCancel={closeConfirmDelete}
          onConfirm={confirmDeleteItem}
          saving={saving}
        />
      )}
    </section>
  )
}

export default AmenityPage
