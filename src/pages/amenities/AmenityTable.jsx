import AppIcon from '../../components/AppIcon'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import AmenityIconBox from './AmenityIconBox'

function AmenityTable({
  amenities,
  loading,
  onApplySearch,
  onCreate,
  onDelete,
  onEdit,
  onSearchInputChange,
  onView,
  page,
  searchInput,
  setPage,
  total,
  totalPages,
  saving,
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">DANH SACH TIEN NGHI</p>
          <h2>Danh sach tien nghi</h2>
        </div>
        <button className="blue-btn" onClick={onCreate} type="button">
          <AppIcon name="plus" />
          Them tien nghi
        </button>
      </div>

      <form className="room-toolbar" onSubmit={onApplySearch}>
        <label className="field">
          <span>Tim kiem tien nghi</span>
          <input
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ten hoac loai tien nghi"
            value={searchInput}
          />
        </label>
        <div className="room-toolbar-action">
          <button className="blue-btn" type="submit">
            <AppIcon name="search" />
            Tim kiem
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : amenities.length === 0 ? (
        <EmptyState title="Khong co tien nghi" description="Khong tim thay tien nghi phu hop." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tien nghi</th>
                <th>Loai tien nghi</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((amenity) => (
                <tr key={amenity.id}>
                  <td>
                    <div className="room-type-cell">
                      <AmenityIconBox name={amenity.name} />
                      <div>
                        <strong>{amenity.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{amenity.category?.name || 'Chua phan loai'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn compact-btn" onClick={() => onView(amenity)} type="button">
                        <AppIcon name="eye" />
                        Xem
                      </button>
                      <button className="edit-btn compact-btn" onClick={() => onEdit(amenity)} type="button">
                        <AppIcon name="edit" />
                        Sua
                      </button>
                      <button className="danger-btn compact-btn" disabled={saving} onClick={() => onDelete(amenity)} type="button">
                        <AppIcon name="trash" />
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

      <div className="pagination-bar">
        <span>
          Hien thi {amenities.length} / {total} tien nghi
        </span>
        <div className="pagination-actions">
          <button className="cancel-btn compact-btn" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
            <AppIcon name="chevronLeft" />
            Truoc
          </button>
          <strong>{page} / {totalPages}</strong>
          <button className="cancel-btn compact-btn" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">
            <AppIcon name="chevronRight" />
            Sau
          </button>
        </div>
      </div>
    </section>
  )
}

export default AmenityTable
