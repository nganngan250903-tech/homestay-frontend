import { useState } from 'react'
import AppIcon from '../../../components/AppIcon'
import { formatRoomPrice } from './homeUtils'

const aboutFeatures = [
  {
    icon: 'house',
    title: 'Khong gian nguyen can',
    description: 'Rieng tu, am ap va gan gui nhu dang nghi tai chinh ngoi nha cua minh.',
    tone: 'blue',
  },
  {
    icon: 'users',
    title: 'Phu hop nhom ban va gia dinh',
    description: 'Khong gian sinh hoat chung thoang, de ket noi va tan huong thoi gian ben nhau.',
    tone: 'rose',
  },
  {
    icon: 'bath',
    title: 'Phong ngu tien nghi',
    description: 'Phong sach se, dieu hoa, phong tam va cac vat dung can thiet cho ky nghi ngan ngay.',
    tone: 'blue',
  },
  {
    icon: 'car',
    title: 'Di chuyen thuan tien',
    description: 'Gan cac diem dich vu, de tim duong va phu hop cho lich trinh linh hoat.',
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

function RoomDetailModal({ room, onClose }) {
  if (!room) return null

  const amenities = room.amenities || []
  const photos = [
    room.thumbnail,
    room.image,
    ...(room.roomPhotos || []).map((photo) => photo.photo || photo.Photo),
  ].filter(Boolean)
  const uniquePhotos = [...new Set(photos)]

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="customer-room-modal" role="dialog" aria-modal="true" aria-labelledby="customer-room-title">
        <div className="customer-auth-head">
          <div>
            <p className="eyebrow">Chi tiet phong</p>
            <h2 id="customer-room-title">{room.name}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Dong">
            <AppIcon name="close" />
          </button>
        </div>
        <div className="customer-room-detail">
          <img src={room.image} alt={room.name} />
          <div className="customer-room-info">
            <p>{room.description}</p>
            <div className="customer-room-facts">
              <span>Loai phong</span>
              <strong>{room.roomType?.name || 'Chua co'}</strong>
              <span>Chi nhanh</span>
              <strong>{room.branch?.name || 'Chua co'}</strong>
              <span>Dien tich</span>
              <strong>{room.area ? `${room.area} m2` : 'Chua co'}</strong>
              <span>So khach toi da</span>
              <strong>{room.maxGuest || room.roomType?.maxGuest || 'Chua co'}</strong>
              <span>Gia tham khao</span>
              <strong>{room.price ? `${formatRoomPrice(room.price)}d/gio` : 'Lien he'}</strong>
            </div>
          </div>
        </div>
        {uniquePhotos.length > 1 && (
          <div className="customer-room-photo-strip">
            {uniquePhotos.slice(0, 5).map((photo) => (
              <img src={photo} alt={`Anh ${room.name}`} key={photo} />
            ))}
          </div>
        )}
        {amenities.length > 0 && (
          <div className="customer-room-amenities">
            <h3>Tien nghi</h3>
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
      </section>
    </div>
  )
}

export function CustomerRoomSection({ rooms, id = 'phong' }) {
  const [selectedRoom, setSelectedRoom] = useState(null)

  return (
    <>
      <section className="home-room-section" id={id}>
        <div className="home-section-title">
          <h2>Dat phong tai Lim Dim</h2>
          <p>Chon phong phu hop va xem chi tiet truoc khi gui yeu cau dat phong.</p>
        </div>
        {rooms.length === 0 ? (
          <div className="home-room-empty">
            <strong>Chua co phong de hien thi</strong>
            <span>Danh sach phong se duoc cap nhat tu he thong quan tri.</span>
          </div>
        ) : (
          <div className="home-room-grid">
            {rooms.map((room) => (
              <article className="home-room-card" key={room.id}>
                <img src={room.image} alt={room.name} />
                <div>
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                  <span>Se khach toi da {room.maxGuest || room.roomType?.maxGuest || 3} nguoi</span>
                  <div className="home-room-footer">
                    <strong>{room.price ? `${formatRoomPrice(room.price)}d/gio` : 'Lien he'}</strong>
                    <button onClick={() => setSelectedRoom(room)} type="button">Xem Chi Tiet</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </>
  )
}

function HomeSections({ rooms }) {
  return (
    <>
      <section className="home-hero" id="top">
        <img src="/Lim Dim.png" alt="Lim Dim Homestay" />
      </section>

      <section className="home-about" id="thong-tin">
        <div className="home-about-grid">
          <div className="home-about-intro">
            <h2>DEN VOI LIM DIM HOMESTAY</h2>
            <p>
              Đến với Lim Dim Homestay, bạn sẽ tìm thấy một khoảng nghỉ thật chậm giữa lòng Huế yên bình.
              Với mô hình nhà vườn gần gũi thiên nhiên, Lim Dim mang đến không gian trong lành,
              thoáng đãng cùng khu sân vườn xanh mát và hồ bơi thư giãn giữa những ngày nắng dịu.
              Homestay gồm 5 phòng được thiết kế ấm cúng, phù hợp cho khách đi một mình, cặp đôi hoặc gia đình nhỏ.
              Tại đây, du khách có thể tận hưởng những buổi tối quây quần bên bếp nướng, thong thả trò chuyện,
              nghỉ ngơi và cảm nhận nhịp sống nhẹ nhàng rất riêng của Huế.
            </p>
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
          <h2>HINH ANH CAC PHONG CAN HO</h2>
          <p>
            Nhung goc phong, khong gian sinh hoat va khu nghi duoc cham chut de mang lai cam giac
            gan gui, sach se va thoai mai cho moi ky nghi tai Lim Dim Homestay.
          </p>
        </div>
        <div className="home-gallery-grid">
          {homestayGalleryImages.map((image, index) => (
            <figure className="home-gallery-item" key={image}>
              <img src={image} alt={`Khong gian Lim Dim Homestay ${index + 1}`} />
            </figure>
          ))}
        </div>
      </section>

      <CustomerRoomSection rooms={rooms} />
    </>
  )
}

export default HomeSections
