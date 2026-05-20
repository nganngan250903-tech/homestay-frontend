import AppIcon from '../../../../components/AppIcon'
import { CustomerRoomSection } from '../HomeSections'
import useCustomerRooms from '../useCustomerRooms'

const amenityHighlights = [
  {
    icon: 'wifi',
    title: 'Wifi tốc độ cao',
    description: 'Kết nối ổn định cho làm việc, học tập và giải trí trong suốt kỳ nghỉ.',
  },
  {
    icon: 'snowflake',
    title: 'Điều hòa riêng',
    description: 'Mỗi phòng đều có điều hòa, giúp không gian nghỉ ngơi luôn dễ chịu.',
  },
  {
    icon: 'bath',
    title: 'Phòng tắm sạch sẽ',
    description: 'Vật dụng cơ bản được chuẩn bị gọn gàng, thuận tiện cho khách lưu trú.',
  },
  {
    icon: 'coffee',
    title: 'Khu sinh hoạt chung',
    description: 'Không gian chung ấm cúng để uống trà, trò chuyện và thư giãn.',
  },
]

const serviceHighlights = [
  {
    icon: 'calendar',
    title: 'Hỗ trợ đặt phòng',
    description: 'Tư vấn phòng phù hợp theo số khách, lịch trình và ngân sách của bạn.',
  },
  {
    icon: 'car',
    title: 'Hỗ trợ di chuyển',
    description: 'Gợi ý cách di chuyển đến homestay và các địa điểm gần khu lưu trú.',
  },
  {
    icon: 'utensils',
    title: 'Gợi ý ăn uống',
    description: 'Chia sẻ những địa điểm ăn uống gần gũi, dễ trải nghiệm hương vị địa phương.',
  },
]

const offerHighlights = [
  'Ưu đãi cho khách đặt phòng dài ngày.',
  'Giá tốt hơn cho nhóm bạn và gia đình khi đặt nhiều phòng.',
  'Cập nhật ưu đãi theo mùa và các dịp lễ trong năm.',
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

export function BookingPage(props) {
  const rooms = useCustomerRooms()

  return (
    <>
      <PageHero
        title="Đặt phòng"
        description="Chọn phòng phù hợp với lịch trình của bạn và xem chi tiết tiện nghi, giá tham khảo trước khi đặt."
      />
      <CustomerRoomSection rooms={rooms} id="dat-phong" {...props} />
    </>
  )
}

export function AmenityInfoPage() {
  return (
    <>
      <PageHero
        title="Tiện nghi"
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
        title="Dịch vụ"
        description="Các dịch vụ hỗ trợ khách hàng từ lúc chọn phòng đến khi hoàn tất kỳ nghỉ tại Lim Dim."
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
        title="Ưu đãi"
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
        title="Quy tắc & FAQ"
        description="Một số thông tin cần biết trước khi đặt phòng và lưu trú tại homestay."
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
