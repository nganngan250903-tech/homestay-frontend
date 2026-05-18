import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import {
  createRoomType,
  deleteRoomType,
  getRoomTypes,
  updateRoomType,
} from '../../services/roomService'

const emptyForm = { name: '', description: '', maxGuest: '', image: '' }

function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const loadRoomTypes = useCallback(async () => {
    setLoading(true)
    setToast(null)
    try {
      setRoomTypes(await getRoomTypes())
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong tai duoc loai phong' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadRoomTypes)
  }, [loadRoomTypes])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setToast(null)
    const payload = { ...form, maxGuest: Number(form.maxGuest) }
    try {
      if (editing) {
        await updateRoomType(editing.id, payload)
        setToast({ type: 'success', message: 'Da cap nhat loai phong' })
      } else {
        await createRoomType(payload)
        setToast({ type: 'success', message: 'Da them loai phong' })
      }
      setForm(emptyForm)
      setEditing(null)
      await loadRoomTypes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong luu duoc loai phong' })
    } finally {
      setSaving(false)
    }
  }

  const editRoomType = (roomType) => {
    setEditing(roomType)
    setForm({
      name: roomType.name || '',
      description: roomType.description || '',
      maxGuest: roomType.maxGuest ? String(roomType.maxGuest) : '',
      image: roomType.image || '',
    })
  }

  const removeRoomType = async (roomType) => {
    const confirmed = window.confirm(`Xoa loai phong ${roomType.name}?`)
    if (!confirmed) {
      return
    }
    try {
      await deleteRoomType(roomType.id)
      setToast({ type: 'success', message: 'Da xoa loai phong' })
      await loadRoomTypes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong xoa duoc loai phong' })
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Room type management</p>
          <h1>Loai phong</h1>
          <p className="muted-text">Quan ly ten, mo ta, so khach toi da va anh loai phong.</p>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} />

      <section className="panel">
        <form className="form-grid" onSubmit={submit}>
          <label className="field">
            <span>Ten loai phong</span>
            <input onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
          </label>
          <label className="field">
            <span>So khach toi da</span>
            <input
              min="1"
              onChange={(event) => updateField('maxGuest', event.target.value)}
              required
              type="number"
              value={form.maxGuest}
            />
          </label>
          <label className="field form-wide">
            <span>Mo ta</span>
            <input onChange={(event) => updateField('description', event.target.value)} value={form.description} />
          </label>
          <label className="field form-wide">
            <span>Image URL</span>
            <input onChange={(event) => updateField('image', event.target.value)} value={form.image} />
          </label>
          <div className="modal-actions form-wide">
            {editing && (
              <button
                className="secondary-btn"
                onClick={() => {
                  setEditing(null)
                  setForm(emptyForm)
                }}
                type="button"
              >
                Huy sua
              </button>
            )}
            <button className="primary-btn" disabled={saving} type="submit">
              {saving ? 'Dang luu...' : editing ? 'Cap nhat' : 'Them loai phong'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        {loading ? (
          <LoadingSpinner />
        ) : roomTypes.length === 0 ? (
          <EmptyState title="Chua co loai phong" description="Hay them loai phong dau tien." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loai phong</th>
                  <th>So khach</th>
                  <th>Mo ta</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>
                      <strong>{roomType.name}</strong>
                      <span className="cell-subtext">ID {roomType.id}</span>
                    </td>
                    <td>{roomType.maxGuest}</td>
                    <td>{roomType.description || 'Chua co'}</td>
                    <td>
                      <div className="table-actions">
                        <button className="ghost-btn compact-btn" onClick={() => editRoomType(roomType)} type="button">
                          Sua
                        </button>
                        <button className="danger-btn compact-btn" onClick={() => removeRoomType(roomType)} type="button">
                          Xoa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

export default RoomTypePage
