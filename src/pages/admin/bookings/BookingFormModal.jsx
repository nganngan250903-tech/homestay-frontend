import AppIcon from '../../../components/AppIcon'
import BookingDateRangeCalendar from '../../customer/home/BookingDateRangeCalendar'
import { roomLabel } from './bookingUtils'

function BookingFormModal({
  customerSuggestionLoading,
  customerSuggestions,
  form,
  newCustomer,
  onClose,
  onCreateCustomer,
  onQuickCustomerFieldChange,
  onSelectCustomer,
  onSubmit,
  onUpdateField,
  onCalendarError,
  quickCustomerSaving,
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
          <div className="quick-customer-box">
            <div className="quick-customer-head">
              <strong>Khách chưa có hồ sơ</strong>
              <span>Tạo nhanh để tiếp tục booking.</span>
            </div>
            <div className="quick-customer-grid">
              <label className="field">
                <span>Tên khách</span>
                <input
                  autoComplete="off"
                  onChange={(event) => onQuickCustomerFieldChange('name', event.target.value)}
                  placeholder="Nhập tên khách"
                  type="text"
                  value={newCustomer.name}
                />
              </label>
              <label className="field">
                <span>Số điện thoại</span>
                <input
                  autoComplete="off"
                  onChange={(event) => onQuickCustomerFieldChange('phone', event.target.value)}
                  placeholder="Nhập số điện thoại"
                  type="tel"
                  value={newCustomer.phone}
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  autoComplete="off"
                  onChange={(event) => onQuickCustomerFieldChange('email', event.target.value)}
                  placeholder="Có thể bỏ trống"
                  type="email"
                  value={newCustomer.email}
                />
              </label>
              <label className="field">
                <span>Địa chỉ</span>
                <input
                  autoComplete="off"
                  onChange={(event) => onQuickCustomerFieldChange('address', event.target.value)}
                  placeholder="Có thể bỏ trống"
                  type="text"
                  value={newCustomer.address}
                />
              </label>
            </div>
            <button
              className="save-btn compact-btn"
              disabled={saving || quickCustomerSaving || !newCustomer.name.trim() || !newCustomer.phone.trim()}
              onClick={onCreateCustomer}
              type="button"
            >
              <AppIcon name="save" />
              {quickCustomerSaving ? 'Đang tạo...' : 'Thêm khách nhanh'}
            </button>
          </div>
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
          <div className="form-wide">
            <BookingDateRangeCalendar
              checkIn={form.checkIn}
              checkOut={form.checkOut}
              disabled={saving || !form.roomId}
              onChange={({ checkIn, checkOut }) => {
                onUpdateField('checkIn', checkIn)
                onUpdateField('checkOut', checkOut)
              }}
              onError={onCalendarError}
              roomId={form.roomId}
            />
            {!form.roomId && <small className="helper-text">Chọn phòng trước để xem lịch đặt phòng.</small>}
          </div>
          <div className="modal-actions form-wide">
            <button className="cancel-btn" disabled={saving} onClick={onClose} type="button">
              <AppIcon name="close" />
              Hủy
            </button>
            <button className="save-btn" disabled={saving || !form.checkIn || !form.checkOut} type="submit">
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

