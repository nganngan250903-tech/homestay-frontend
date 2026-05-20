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
    description: 'Moi phong deu co dieu hoa, giup khong gian nghi ngoi luon de chiu.',
  },
  {
    icon: 'bath',
    title: 'Phong tam sach se',
    description: 'Vat dung co ban duoc chuan bi gon gang, thuan tien cho khach luu tru.',
  },
  {
    icon: 'coffee',
    title: 'Khu sinh hoat chung',
    description: 'Khong gian chung am cung de uong tra, tro chuyen va thu gian.',
  },
]

const serviceHighlights = [
  {
    icon: 'calendar',
    title: 'Ho tro dat phong',
    description: 'Tu van phong phu hop theo so khach, lich trinh va ngan sach cua ban.',
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
  'Uu dai cho khach dat phong dai ngay.',
  'Gia tot hon cho nhom ban va gia dinh khi dat nhieu phong.',
  'Cap nhat uu dai theo mua va cac dip le trong nam.',
]

const faqItems = [
  {
    question: 'Khach co can dat coc truoc khong?',
    answer: 'Homestay se xac nhan thong tin dat phong va huong dan thanh toan theo tung thoi diem.',
  },
  {
    question: 'Co the huy lich dat phong khong?',
    answer: 'Khach hang da dang nhap co the xem lich su booking va gui yeu cau huy theo quy dinh he thong.',
  },
  {
    question: 'Gio nhan phong va tra phong nhu the nao?',
    answer: 'Thong tin gio nhan phong, tra phong se duoc nhan vien xac nhan khi booking duoc duyet.',
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
        title="Dat phong"
        description="Chon phong phu hop voi lich trinh cua ban va xem chi tiet tien nghi, gia tham khao truoc khi dat."
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
        description="Nhung tien ich can thiet duoc sap xep gon gang de ky nghi ngan ngay van thoai mai."
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
        description="Cac dich vu ho tro khach hang tu luc chon phong den khi hoan tat ky nghi tai Lim Dim."
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
        description="Cac chuong trinh uu dai duoc cap nhat theo tinh trang phong, thoi diem dat va so luong khach."
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
        description="Mot so thong tin can biet truoc khi dat phong va luu tru tai homestay."
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
