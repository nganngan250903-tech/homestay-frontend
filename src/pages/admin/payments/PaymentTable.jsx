import AppIcon from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'
import LoadingSpinner from '../../../components/LoadingSpinner'
import {
  formatCurrency,
  formatDateTime,
  getPaymentStatusLabel,
} from './paymentUtils'

function PaymentTable({
  filters,
  loading,
  onApplyFilters,
  onFilterChange,
  page,
  payments,
  setPage,
  total,
  totalPages,
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Danh sách các giao dịch VNPAY</h2>
        </div>
      </div>

      <form className="booking-toolbar compact-booking-toolbar payment-toolbar" onSubmit={onApplyFilters}>
        <label className="field">
          <span>Mã Booking</span>
          <input
            inputMode="numeric"
            min="1"
            onChange={(event) => onFilterChange('bookingId', event.target.value)}
            placeholder="Nhập mã booking"
            type="number"
            value={filters.bookingId}
          />
        </label>
        <div className="booking-toolbar-actions">
          <button className="blue-btn compact-btn" type="submit">
            <AppIcon name="search" />
            Lọc
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState title="Không có giao dịch" description="Chưa có giao dịch VNPay phù hợp." />
      ) : (
        <div className="table-wrap">
          <table className="data-table payment-admin-table">
            <thead>
              <tr>
                <th>Mã Booking</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Giờ giao dịch</th>
                <th>Trạng thái</th>
                <th>Thông tin VNPay</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.bookingId || payment.txnRef || '-'}</strong>
                  </td>
                  <td>
                    <strong>{payment.customerName || '-'}</strong>
                    <span className="cell-subtext">{payment.roomName || '-'}{payment.roomTypeName ? ` - ${payment.roomTypeName}` : ''}</span>
                  </td>
                  <td>
                    <strong>{formatCurrency(payment.amount)}</strong>
                    <span className="cell-subtext">
                      Tổng booking: {formatCurrency(payment.bookingTotalAmount)}
                    </span>
                  </td>
                  <td>
                    <strong>{formatDateTime(payment.paidAt) || formatDateTime(payment.createdAt) || '-'}</strong>
                  </td>
                  <td>
                    <span className={`booking-status-select ${String(payment.status || '').toLowerCase()}`}>
                      {getPaymentStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td>
                    <strong>{payment.providerTransactionNo || '-'}</strong>
                    <span className="cell-subtext">Mã phản hồi: {payment.responseCode || '-'}</span>
                    <span className="cell-subtext">{payment.message || '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-bar">
        <span>Hiển thị {payments.length} / {total} giao dịch</span>
        <div className="pagination-actions">
          <button className="cancel-btn compact-btn" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
            <AppIcon name="chevronLeft" />
            Trước
          </button>
          <strong>{page} / {totalPages}</strong>
          <button className="cancel-btn compact-btn" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button">
            Sau
            <AppIcon name="chevronRight" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PaymentTable

