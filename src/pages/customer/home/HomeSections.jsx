import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useRef } from 'react'
import AppIcon from '../../../components/AppIcon'
import Toast from '../../../components/Toast'
import { shouldSuppressError } from '../../../services/api'
import { createBooking } from '../../../services/bookingService'
import { getStoredToken } from '../../../services/authStorage'
import BookingDateRangeCalendar from './BookingDateRangeCalendar'
import { formatRoomPrice } from './homeUtils'

const mapUrl = 'https://maps.app.goo.gl/ykFvjUHEnyu5a1B19'

const aboutFeatures = [
  {
    icon: 'house',
    title: 'Không gian nguyên căn',
    description: 'Riêng tư, ấm áp và gần gũi như đang nghỉ tại chính ngôi nhà của mình.',
    tone: 'blue',
  },
  {
    icon: 'users',
    title: 'Phù hợp nhóm bạn và gia đình',
    description: 'Không gian sinh hoạt chung thoáng, dễ kết nối và tận hưởng thời gian bên nhau.',
    tone: 'rose',
  },
  {
    icon: 'bath',
    title: 'Phòng ngủ tiện nghi',
    description: 'Phòng sạch sẽ, điều hòa, phòng tắm và các vật dụng cần thiết cho kỳ nghỉ ngắn ngày.',
    tone: 'blue',
  },
  {
    icon: 'car',
    title: 'Di chuyển thuận tiện',
    description: 'Gần các điểm dịch vụ, dễ tìm đường và phù hợp cho lịch trình linh hoạt.',
    tone: 'mint',
  },
]

const homestayGalleryImages = [
  '/page/651611899.jpg',
  '/page/download.jpg',
  '/page/download (1).jpg',
  '/page/homestay-vung-tau-6-2048x1536.jpg',
  '/page/homestay-vung-tau-9-2048x1536.jpg',
  '/page/images (6).jpg',
]

function toDateTimeInput(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

function createDefaultBookingForm() {
  const checkIn = new Date()
  checkIn.setDate(checkIn.getDate() + 1)
  checkIn.setHours(14, 0, 0, 0)

  const checkOut = new Date(checkIn)
  checkOut.setDate(checkOut.getDate() + 1)
  checkOut.setHours(12, 0, 0, 0)

  return {
    checkIn: toDateTimeInput(checkIn),
    checkOut: toDateTimeInput(checkOut),
    guestCount: 1,
  }
}

function RoomDetailModal({
  isCustomer,
  onBookingCreated,
  onClose,
  onRequireCustomerAuth,
  room,
  bookingCustomer,
}) {
  const navigate = useNavigate()
  const [bookingForm, setBookingForm] = useState(createDefaultBookingForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const bookingSubmitRef = useRef(false)
  const showCalendarError = useCallback((message) => {
    setToast({ type: 'error', message })
  }, [])

  const photos = useMemo(() => {
    if (!room) return []
    return [
      room.thumbnail,
      room.image,
      ...(room.roomPhotos || []).map((photo) => photo.photo || photo.Photo),
    ].filter(Boolean)
  }, [room])

  if (!room) return null

  const amenities = room.amenities || []
  const uniquePhotos = [...new Set(photos)]

  const updateBookingField = (field, value) => {
    setBookingForm((current) => ({ ...current, [field]: value }))
  }

  const updateBookingDates = (dates) => {
    setBookingForm((current) => ({ ...current, ...dates }))
  }

  const submitBooking = async (event) => {
    event.preventDefault()
    if (bookingSubmitRef.current) return

    if (!isCustomer || !bookingCustomer?.id) {
      setToast({ type: 'error', message: 'Bạn cần đăng nhập tài khoản khách hàng trước khi đặt phòng.' })
      onRequireCustomerAuth?.()
      return
    }
    if (!getStoredToken()) {
      setToast({ type: 'error', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' })
      onRequireCustomerAuth?.()
      return
    }
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      setToast({ type: 'error', message: 'Vui lòng chọn ngày nhận phòng và ngày trả phòng.' })
      return
    }

    bookingSubmitRef.current = true
    setSaving(true)
    setToast(null)
    try {
      const booking = await createBooking({
        customerId: bookingCustomer.id,
        employeeId: null,
        roomId: room.id,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guestCount: Number(bookingForm.guestCount),
      })
      onBookingCreated?.(booking)
      setToast({ type: 'success', message: 'Đặt phòng thành công. Đang chuyển sang thanh toán.' })
      setBookingForm(createDefaultBookingForm())
      window.setTimeout(() => navigate(`/home/payment/${booking.id}`), 500)
    } catch (error) {
      if (shouldSuppressError(error)) return
      if (error.cause?.response?.status === 401) {
        onRequireCustomerAuth?.()
      }
      setToast({ type: 'error', message: error.message || 'Không tạo được booking.' })
    } finally {
      bookingSubmitRef.current = false
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-room-modal" role="dialog" aria-modal="true" aria-labelledby="customer-room-title">
        <div className="customer-auth-head">
          <div>
            <h2 id="customer-room-title">{room.name}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Đóng">
            <AppIcon name="close" />
          </button>
        </div>
        <Toast message={toast?.message} type={toast?.type} />
        <div className="customer-room-detail">
          <img src={room.image} alt={room.name} />
          <div className="customer-room-info">
            <p>{room.description}</p>
            <div className="customer-room-facts">
              <span>Loại phòng</span>
              <strong>{room.roomType?.name || 'Chưa có'}</strong>
              <span>Chi nhánh</span>
              <strong>{room.branch?.name || 'Chưa có'}</strong>
              <span>Diện tích</span>
              <strong>{room.area ? `${room.area} m2` : 'Chưa có'}</strong>
              <span>Số khách tối đa</span>
              <strong>{room.maxGuest || room.roomType?.maxGuest || 'Chưa có'}</strong>
              <span>Giá tham khảo</span>
              <strong>{room.price ? `${formatRoomPrice(room.price)}đ/đêm` : 'Liên hệ'}</strong>
            </div>
          </div>
        </div>
        {uniquePhotos.length > 1 && (
          <div className="customer-room-photo-strip">
            {uniquePhotos.slice(0, 5).map((photo) => (
              <img src={photo} alt={`Ảnh ${room.name}`} key={photo} />
            ))}
          </div>
        )}
        {amenities.length > 0 && (
          <div className="customer-room-amenities">
            <h3>Tiện nghi</h3>
            <div>
              {amenities.map((amenity) => (
                <span key={amenity.amenityId || amenity.id || amenity.amenityName}>
                  <AppIcon name="sparkles" />
                  {amenity.amenityName || amenity.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <form className="customer-booking-form" onSubmit={submitBooking}>
          <div className="compact-section-head">
            <div>
              <h3>Thông tin đặt phòng</h3>
            </div>
          </div>
          <BookingDateRangeCalendar
            checkIn={bookingForm.checkIn}
            checkOut={bookingForm.checkOut}
            disabled={saving}
            onChange={updateBookingDates}
            onError={showCalendarError}
            roomId={room.id}
          />
          <label className="field">
            <span>Số khách</span>
            <input
              min="1"
              max={room.maxGuest || room.roomType?.maxGuest || undefined}
              onChange={(event) => updateBookingField('guestCount', event.target.value)}
              required
              type="number"
              value={bookingForm.guestCount}
            />
          </label>
          <button className="save-btn home-primary-btn" disabled={saving} type="submit">
            <AppIcon name="calendar" />
            {saving ? 'Đang tạo booking...' : 'Đặt phòng'}
          </button>
        </form>
      </section>
    </div>
  )
}

export function CustomerRoomSection({
  bookingCustomer,
  emptyDescription = 'Danh sách phòng sẽ được cập nhật từ hệ thống quản trị.',
  emptyTitle = 'Chưa có phòng để hiển thị',
  id = 'phong',
  isCustomer,
  onBookingCreated,
  onRequireCustomerAuth,
  rooms,
  showHeading = true,
}) {
  const [selectedRoom, setSelectedRoom] = useState(null)

  return (
    <>
      <section className="home-room-section" id={id}>
        {showHeading && (
          <div className="home-section-title">
            <h2>Đặt phòng tại Lim Dim</h2>
            <p>Chọn phòng phù hợp và xem chi tiết trước khi gửi yêu cầu đặt phòng.</p>
          </div>
        )}
        {rooms.length === 0 ? (
          <div className="home-room-empty">
            <strong>{emptyTitle}</strong>
            <span>{emptyDescription}</span>
          </div>
        ) : (
          <div className="home-room-grid">
            {rooms.map((room) => (
              <article className="home-room-card" key={room.id}>
                <img src={room.image} alt={room.name} />
                <div>
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                  <span>Số khách tối đa {room.maxGuest || room.roomType?.maxGuest || 3} người</span>
                  <div className="home-room-footer">
                    <strong>{room.price ? `${formatRoomPrice(room.price)}đ/đêm` : 'Liên hệ'}</strong>
                    <button onClick={() => setSelectedRoom(room)} type="button">Xem chi tiết</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <RoomDetailModal
        bookingCustomer={bookingCustomer}
        isCustomer={isCustomer}
        onBookingCreated={onBookingCreated}
        onClose={() => setSelectedRoom(null)}
        onRequireCustomerAuth={onRequireCustomerAuth}
        room={selectedRoom}
      />
    </>
  )
}

function HomeSections({ bookingCustomer, isCustomer, onBookingCreated, onRequireCustomerAuth, rooms }) {
  return (
    <>
      <section className="home-hero" id="top">
        <img src="/Lim Dim.png" alt="Lim Dim Homestay" />
      </section>

      <section className="home-about" id="thong-tin">
        <div className="home-about-grid">
          <div className="home-about-summary">
            <div className="home-about-intro">
              <h2>ĐẾN VỚI LIM DIM HOMESTAY</h2>
              <p>
                Đến với Lim Dim Homestay, bạn sẽ tìm thấy một khoảng nghỉ thật chậm giữa lòng Huế yên bình.
                Với mô hình nhà vườn gần gũi thiên nhiên, Lim Dim mang đến không gian trong lành,
                thoáng đãng cùng khu sân vườn xanh mát và hồ bơi thư giãn giữa những ngày nắng dịu.
                Homestay gồm 5 phòng được thiết kế ấm cúng, phù hợp cho khách đi một mình, cặp đôi hoặc gia đình nhỏ.
                Tại đây, du khách có thể tận hưởng những buổi tối quây quần bên bếp nướng, thong thả trò chuyện,
                nghỉ ngơi và cảm nhận nhịp sống nhẹ nhàng rất riêng của Huế.
              </p>
            </div>
            <aside className="home-about-contact" aria-label="Liên hệ với Lim Dim Homestay">
              <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
              <div className="home-about-contact-list">
                <p><span>Email:</span> LimDim@gmail.com.vn</p>
                <p>
                  <span>Địa chỉ:</span>
                  <a href={mapUrl} target="_blank" rel="noreferrer">16/52 Ba Triệu, Huế</a>
                </p>
                <p><span>Phone:</span> +84 328 54 7686</p>
                <p><span>Website:</span> LimDimhomestay.vn</p>
              </div>
            </aside>
          </div>
          <div className="home-about-features">
            {aboutFeatures.map((feature) => (
              <article className={`home-about-feature ${feature.tone}`} key={feature.title}>
                <div className="home-about-icon">
                  <AppIcon name={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-gallery-section" id="hinh-anh">
        <div className="home-gallery-heading">
          <h2>HÌNH ẢNH CÁC PHÒNG CĂN HỘ</h2>
          <p>
            Những góc phòng, không gian sinh hoạt và khu nghỉ được chăm chút để mang lại cảm giác
            gần gũi, sạch sẽ và thoải mái cho mỗi kỳ nghỉ tại Lim Dim Homestay.
          </p>
        </div>
        <div className="home-gallery-grid">
          {homestayGalleryImages.map((image, index) => (
            <figure className="home-gallery-item" key={image}>
              <img src={image} alt={`Không gian Lim Dim Homestay ${index + 1}`} />
            </figure>
          ))}
        </div>
      </section>

      <CustomerRoomSection
        bookingCustomer={bookingCustomer}
        isCustomer={isCustomer}
        onBookingCreated={onBookingCreated}
        onRequireCustomerAuth={onRequireCustomerAuth}
        rooms={rooms}
      />
    </>
  )
}

export default HomeSections

