import AppIcon from '../../../../components/AppIcon'
import { CustomerRoomSection } from '../HomeSections'
import useCustomerRooms from '../useCustomerRooms'

const amenityHighlights = [
  {
    icon: 'wifi',
    title: 'Wifi toc do cao',
    description: 'Ket noi on dinh cho lam viec, hoc tap va giai tri trong suot ky nghi.',
  },
  {
    icon: 'snowflake',
    title: 'Dieu hoa rieng',
    description: 'Mỗi phòng đều có điều hòa, giúp không gian nghỉ ngơi luôn dễ chịu.',
  },
  {
    icon: 'bath',
    title: 'Phòng tam sach se',
    description: 'Vật dụng cơ bản được chuẩn bị gọn gàng, thuận tiện cho khách lưu trú.',
  },
  {
    icon: 'coffee',
    title: 'Khu sinh hoat chung',
    description: 'Không gian chung ấm cúng để uống trà, trò chuyện và thư giãn.',
  },
]

const serviceHighlights = [
  {
    icon: 'calendar',
    title: 'Ho tro dat phòng',
    description: 'Tu van phòng phu hop theo số khách, lich trinh va ngan sach cua ban.',
  },
  {
    icon: 'car',
    title: 'Ho tro di chuyen',
    description: 'Goi y cach di chuyen den homestay va cac dia diem gan khu luu tru.',
  },
  {
    icon: 'utensils',
    title: 'Goi y an uong',
    description: 'Chia se nhung dia diem an uong gan gui, de trai nghiem huong vi dia phuong.',
  },
]

const offerHighlights = [
  'Ưu đãi cho khách đặt phòng dài ngày.',
  'Giá tốt hơn cho nhóm bạn và gia đình khi đặt nhiều phòng.',
  'Cap nhat uu dai theo mua va cac dip le trong nam.',
]

const faqItems = [
  {
    question: 'Khách có cần đặt cọc trước không?',
    answer: 'Homestay sẽ xác nhận thông tin đặt phòng và hướng dẫn thanh toán theo từng thời điểm.',
  },
  {
    question: 'Có thể hủy lịch đặt phòng không?',
    answer: 'Khách hàng đã đăng nhập có thể xem lịch sử booking và gửi yêu cầu hủy theo quy định hệ thống.',
  },
  {
    question: 'Giờ nhận phòng và trả phòng như thế nào?',
    answer: 'Thông tin giờ nhận phòng, trả phòng sẽ được nhân viên xác nhận khi booking được duyệt.',
  },
]

function PageHero({ title, description }) {
  return (
    <section className="customer-simple-hero">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

export function BookingPage() {
  const rooms = useCustomerRooms()

  return (
    <>
      <PageHero
        title="Đặt phòng"
        description="Chọn phòng phù hợp với lịch trình của bạn và xem chi tiết tiện nghi, giá tham khảo trước khi đặt."
      />
      <CustomerRoomSection rooms={rooms} id="dat-phong" />
    </>
  )
}

export function AmenityInfoPage() {
  return (
    <>
      <PageHero
        title="Tien nghi"
        description="Những tiện ích cần thiết được sắp xếp gọn gàng để kỳ nghỉ ngắn ngày vẫn thoải mái."
      />
      <section className="home-info-section">
        <div className="home-info-grid">
          {amenityHighlights.map((amenity) => (
            <article className="home-info-card" key={amenity.title}>
              <div className="home-info-icon">
                <AppIcon name={amenity.icon} />
              </div>
              <h3>{amenity.title}</h3>
              <p>{amenity.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export function ServiceInfoPage() {
  return (
    <>
      <PageHero
        title="Dich vu"
        description="Cac dich vu ho tro khách hàng tu luc chon phòng den khi hoan tat ky nghi tai Lim Dim."
      />
      <section className="home-info-section soft">
        <div className="home-service-list">
          {serviceHighlights.map((service) => (
            <article className="home-service-item" key={service.title}>
              <div className="home-info-icon">
                <AppIcon name={service.icon} />
              </div>
              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export function OfferInfoPage() {
  return (
    <>
      <PageHero
        title="Uu dai"
        description="Các chương trình ưu đãi được cập nhật theo tình trạng phòng, thời điểm đặt và số lượng khách."
      />
      <section className="home-info-section">
        <div className="home-offer-list">
          {offerHighlights.map((offer) => (
            <div className="home-offer-item" key={offer}>
              <AppIcon name="check" />
              <span>{offer}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export function RulesFaqPage() {
  return (
    <>
      <PageHero
        title="Quy tac & FAQ"
        description="Mot so thong tin can biet truoc khi dat phòng va luu tru tai homestay."
      />
      <section className="home-info-section soft">
        <div className="home-faq-list">
          {faqItems.map((item) => (
            <article className="home-faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
