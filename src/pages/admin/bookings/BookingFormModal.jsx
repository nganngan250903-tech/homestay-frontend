import AppIcon from '../../../components/AppIcon'
import { roomLabel } from './bookingUtils'

function BookingFormModal({
  customerSuggestionLoading,
  customerSuggestions,
  form,
  onClose,
  onSelectCustomer,
  onSubmit,
  onUpdateField,
  rooms,
  saving,
}) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        <div className="modal-head">
          <div>
            <h2>Tạo booking mới</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field customer-suggestion-field">
            <span>Khách hàng</span>
            <input
              autoComplete="off"
              onChange={(event) => onUpdateField('customerKeyword', event.target.value)}
              placeholder="Nhập tên hoặc Gmail khách hàng"
              required
              type="text"
              value={form.customerKeyword}
            />
            {(customerSuggestionLoading || customerSuggestions.length > 0) && (
              <div className="customer-suggestion-list">
                {customerSuggestionLoading ? (
                  <span className="customer-suggestion-empty">Đang tìm khách hàng...</span>
                ) : (
                  customerSuggestions.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer)}
                      type="button"
                    >
                      <strong>{customer.name || 'Khách hàng'}</strong>
                      <span>{customer.email || customer.phone || 'Khách hàng đã lưu'}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </label>
          <label className="field">
            <span>Phòng</span>
            <select onChange={(event) => onUpdateField('roomId', event.target.value)} required value={form.roomId}>
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{roomLabel(room)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Số khách</span>
            <input
              min="1"
              onChange={(event) => onUpdateField('guestCount', event.target.value)}
              required
              type="number"
              value={form.guestCount}
            />
          </label>
          <label className="field">
            <span>Check-in</span>
            <input onChange={(event) => onUpdateField('checkIn', event.target.value)} required type="datetime-local" value={form.checkIn} />
          </label>
          <label className="field">
            <span>Check-out</span>
            <input onChange={(event) => onUpdateField('checkOut', event.target.value)} required type="datetime-local" value={form.checkOut} />
          </label>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" disabled={saving} onClick={onClose} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving} type="submit">
              <AppIcon name="save" />
              Lưu
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default BookingFormModal

