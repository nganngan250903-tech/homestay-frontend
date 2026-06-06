import { useEffect, useMemo, useState } from 'react'
import AppIcon from '../../../../components/AppIcon'
import { getRoomBookingCalendar } from '../../../../services/bookingService'
import { getAmenities } from '../../../../services/roomService'
import { CustomerRoomSection } from '../HomeSections'
import useCustomerRooms from '../useCustomerRooms'

const fallbackAmenityGroups = [
  {
    icon: 'wifi',
    category: 'Kết nối & giải trí',
    amenities: ['Wifi miễn phí', 'TV màn hình phẳng', 'Không gian làm việc nhỏ'],
  },
  {
    icon: 'snowflake',
    category: 'Tiện ích trong phòng',
    amenities: ['Điều hòa', 'Tủ hoặc kệ để quần áo', 'Ổ điện gần giường'],
  },
  {
    icon: 'bath',
    category: 'Phòng tắm',
    amenities: ['Phòng tắm riêng', 'Khăn tắm', 'Vật dụng vệ sinh cơ bản'],
  },
  {
    icon: 'coffee',
    category: 'Khu sinh hoạt chung',
    amenities: ['Bàn ghế tiếp khách', 'Khu bếp chung', 'Không gian sân vườn'],
  },
  {
    icon: 'car',
    category: 'Dịch vụ hỗ trợ',
    amenities: ['Hỗ trợ di chuyển', 'Gợi ý địa điểm gần homestay', 'Hỗ trợ trong thời gian lưu trú'],
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

const fallbackFaqs = [
  {
    id: 'deposit',
    question: 'Khách có cần đặt cọc trước không?',
    answerBlocks: [
      { type: 'paragraph', text: 'Quý khách cần thanh toán toàn bộ số tiền khi đặt phòng. Homestay không áp dụng chính sách đặt cọc riêng.' },
    ],
  },
  {
    id: 'cancel',
    question: 'Có thể hủy lịch đặt phòng không?',
    answerBlocks: [
      { type: 'paragraph', text: 'Khách hàng đã đăng nhập có thể xem lịch sử booking và gửi yêu cầu hủy theo quy định hệ thống.' },
    ],
  },
  {
    id: 'checkin',
    question: 'Giờ nhận phòng và trả phòng như thế nào?',
    answerBlocks: [
      { type: 'paragraph', text: 'Giờ nhận phòng từ 14:00 - 22:00. Giờ trả phòng từ 07:00 - 12:00.' },
    ],
  },
]

const fallbackCommonRules = [
  {
    icon: 'login',
    title: 'Nhận phòng',
    content: [
      { strong: 'Từ 14:00 - 22:00' },
      { text: 'Vui lòng liên hệ homestay nếu cần hỗ trợ nhận phòng sớm.' },
    ],
  },
]

const fallbackNearbyGroups = [
  {
    icon: 'walk',
    title: 'Xung quanh có gì?',
    places: [
      { name: 'Cầu Tràng Tiền', distance: '2 km' },
      { name: 'Cung An Định', distance: '3 km' },
      { name: 'Cầu gỗ Lim', distance: '2,5 km' },
      { name: 'Bia Quốc Học', distance: '2,5 km' },
      { name: 'Công Viên 3/2', distance: '800 m' },
    ],
  },
]

function amenityIconName(name = '') {
  const value = name.toLowerCase()
  if (value.includes('wifi') || value.includes('internet')) return 'wifi'
  if (value.includes('điều hòa') || value.includes('máy lạnh') || value.includes('dieu hoa') || value.includes('may lanh')) return 'snowflake'
  if (value.includes('tv') || value.includes('tivi')) return 'tv'
  if (value.includes('xe') || value.includes('đậu') || value.includes('đỗ') || value.includes('parking')) return 'car'
  if (value.includes('bếp') || value.includes('ăn') || value.includes('bep') || value.includes('an')) return 'utensils'
  if (value.includes('tắm') || value.includes('vệ sinh') || value.includes('tam') || value.includes('bath')) return 'bath'
  if (value.includes('cafe') || value.includes('coffee') || value.includes('trà')) return 'coffee'
  return 'sparkles'
}

function groupAmenities(amenities) {
  const groups = new Map()

  amenities.forEach((amenity) => {
    const categoryName = amenity.category?.name || amenity.categoryName || 'Tiện nghi khác'
    const categoryId = amenity.category?.id || categoryName
    const groupKey = String(categoryId)
    const amenityName = amenity.name || amenity.amenityName

    if (!amenityName) return

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        category: categoryName,
        icon: amenityIconName(categoryName),
        amenities: [],
      })
    }

    groups.get(groupKey).amenities.push(amenityName)
  })

  return [...groups.values()].sort((first, second) => first.category.localeCompare(second.category, 'vi'))
}

function PageHero({ title, description }) {
  return (
    <section className="customer-simple-hero">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

function FaqAnswer({ blocks = [] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`
        if (block.type === 'list') {
          return (
            <ul key={key}>
              {block.items?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        }
        return <p key={key}>{block.text}</p>
      })}
    </>
  )
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function defaultBookingSearch() {
  const tomorrow = addDays(new Date(), 1)
  return {
    checkInDate: toDateKey(tomorrow),
    checkOutDate: toDateKey(addDays(tomorrow, 1)),
    roomTypeId: 'ALL',
  }
}

function toSearchDateTime(dateKey, hour) {
  return new Date(`${dateKey}T${pad(hour)}:00:00`)
}

function hasDateOverlap(bookings, checkInDate, checkOutDate) {
  const checkIn = toSearchDateTime(checkInDate, 14)
  const checkOut = toSearchDateTime(checkOutDate, 12)
  return bookings.some((booking) => {
    const bookingCheckIn = new Date(booking.checkIn)
    const bookingCheckOut = new Date(booking.checkOut)
    return checkIn < bookingCheckOut && checkOut > bookingCheckIn
  })
}

export function BookingPage(props) {
  const rooms = useCustomerRooms()
  const [search, setSearch] = useState(defaultBookingSearch)
  const [availableRoomIds, setAvailableRoomIds] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const roomTypes = useMemo(() => {
    const values = new Map()
    rooms.forEach((room) => {
      if (room.roomType?.id) values.set(String(room.roomType.id), room.roomType.name)
    })
    return [...values.entries()].map(([id, name]) => ({ id, name }))
  }, [rooms])

  const candidateRooms = useMemo(() => {
    return rooms.filter((room) => search.roomTypeId === 'ALL' || String(room.roomType?.id) === search.roomTypeId)
  }, [rooms, search.roomTypeId])

  useEffect(() => {
    let active = true

    const runSearch = async () => {
      setSearchError('')
      setAvailableRoomIds(null)

      if (!search.checkInDate || !search.checkOutDate) return
      if (search.checkOutDate <= search.checkInDate) {
        setSearchError('Ngày đi phải sau ngày đến.')
        setAvailableRoomIds(new Set())
        return
      }

      setSearching(true)
      try {
        const results = await Promise.all(
          candidateRooms.map(async (room) => {
            const bookings = await getRoomBookingCalendar(room.id, {
              dateFrom: search.checkInDate,
              dateTo: search.checkOutDate,
            })
            return {
              id: room.id,
              available: !hasDateOverlap(bookings, search.checkInDate, search.checkOutDate),
            }
          }),
        )
        if (!active) return
        setAvailableRoomIds(new Set(results.filter((item) => item.available).map((item) => item.id)))
      } catch (error) {
        if (!active) return
        setSearchError(error.message || 'Không kiểm tra được phòng trống.')
        setAvailableRoomIds(new Set())
      } finally {
        if (active) setSearching(false)
      }
    }

    runSearch()

    return () => {
      active = false
    }
  }, [candidateRooms, search.checkInDate, search.checkOutDate])

  const filteredRooms = useMemo(() => {
    if (!availableRoomIds) return candidateRooms
    return candidateRooms.filter((room) => availableRoomIds.has(room.id))
  }, [availableRoomIds, candidateRooms])

  const updateSearch = (field, value) => {
    setSearch((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <section className="booking-search-section">
        <form className="booking-search-form">
          <label className="field">
            <span>Ngày đến</span>
            <input
              min={toDateKey(new Date())}
              onChange={(event) => updateSearch('checkInDate', event.target.value)}
              type="date"
              value={search.checkInDate}
            />
          </label>
          <label className="field">
            <span>Ngày đi</span>
            <input
              min={search.checkInDate || toDateKey(new Date())}
              onChange={(event) => updateSearch('checkOutDate', event.target.value)}
              type="date"
              value={search.checkOutDate}
            />
          </label>
          <label className="field">
            <span>Loại phòng</span>
            <select onChange={(event) => updateSearch('roomTypeId', event.target.value)} value={search.roomTypeId}>
              <option value="ALL">Tất cả loại phòng</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>
          <div className="booking-search-status">
            {searching ? 'Đang kiểm tra phòng trống...' : `${filteredRooms.length} phòng phù hợp`}
          </div>
        </form>
        {searchError && <p className="booking-search-error">{searchError}</p>}
      </section>
      <CustomerRoomSection
        emptyDescription="Thử chọn ngày khác hoặc loại phòng khác để xem thêm lựa chọn."
        emptyTitle="Không có phòng trống trong khoảng thời gian này"
        id="dat-phong"
        rooms={filteredRooms}
        showHeading={false}
        {...props}
      />
    </>
  )
}

export function AmenityInfoPage() {
  const [amenities, setAmenities] = useState([])
  const [nearbyGroups, setNearbyGroups] = useState(fallbackNearbyGroups)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    getAmenities()
      .then((data) => {
        if (!active) return
        setAmenities(data)
        setLoadError('')
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error.message || 'Không tải được danh sách tiện nghi.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    fetch('/data/nearby-places.json')
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được dữ liệu địa điểm.')
        return response.json()
      })
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return
        setNearbyGroups(data)
      })
      .catch(() => {
        if (active) setNearbyGroups(fallbackNearbyGroups)
      })

    return () => {
      active = false
    }
  }, [])

  const amenityGroups = useMemo(() => {
    const grouped = groupAmenities(amenities)
    return grouped.length > 0 ? grouped : fallbackAmenityGroups
  }, [amenities])

  return (
    <>
      <section className="customer-amenity-section">
        <div className="customer-amenity-shell">
          <div className="customer-amenity-heading">
            <div>
              <h2>Các tiện nghi của LimDim homestay</h2>
            </div>
            {loading && <small>Đang tải dữ liệu...</small>}
            {!loading && loadError && <small>{loadError} Đang hiển thị dữ liệu mẫu.</small>}
          </div>

          <div className="customer-amenity-grid">
            {amenityGroups.map((group) => (
              <section className="customer-amenity-group" key={group.category}>
                <div className="customer-amenity-category">
                  <span className="customer-amenity-icon">
                    <AppIcon name={group.icon} />
                  </span>
                  <h3>{group.category}</h3>
                </div>
                <ul>
                  {group.amenities.map((amenity) => (
                    <li key={amenity}>
                      <AppIcon name="check" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="customer-nearby-section">
        <div className="customer-nearby-shell">
          <div className="customer-nearby-heading">
            <h2>Xung quanh LimDimHomestay có gì</h2>
          </div>
          <div className="customer-nearby-grid">
            {nearbyGroups.map((group) => (
              <section className="customer-nearby-group" key={group.title}>
                <div className="customer-nearby-title">
                  <AppIcon name={group.icon} />
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.places.map((place) => (
                    <li key={`${group.title}-${place.name}`}>
                      <span>{place.name}</span>
                      <strong>{place.distance}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
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
          {fallbackFaqs.map((item) => (
            <article className="home-faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <FaqAnswer blocks={item.answerBlocks} />
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export function CommonRulesPage() {
  const [rules, setRules] = useState(fallbackCommonRules)

  useEffect(() => {
    let active = true

    fetch('/data/common-rules.json')
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được dữ liệu quy tắc.')
        return response.json()
      })
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return
        setRules(data)
      })
      .catch(() => {
        if (active) setRules(fallbackCommonRules)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageHero
        title="Quy tắc chung"
        description="Vui lòng xem các quy định nhận phòng, thanh toán và lưu trú trước khi đặt phòng."
      />
      <section className="customer-rules-section">
        <div className="customer-rules-table">
          {rules.map((rule) => (
            <article className="customer-rule-row" key={rule.title}>
              <div className="customer-rule-label">
                <AppIcon name={rule.icon} />
                <h3>{rule.title}</h3>
              </div>
              <div className="customer-rule-content">
                {rule.paymentMethods ? (
                  <div className="payment-method-list">
                    {rule.paymentMethods.map((method) => (
                      <span key={method}>{method}</span>
                    ))}
                  </div>
                ) : (
                  rule.content?.map((item, index) => {
                    const key = `${rule.title}-${index}`
                    if (item.heading) return <h4 key={key}>{item.heading}</h4>
                    if (item.strong) return <strong key={key}>{item.strong}</strong>
                    return <p key={key}>{item.text}</p>
                  })
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export function QuestionsPage() {
  const [faqs, setFaqs] = useState(fallbackFaqs)

  useEffect(() => {
    let active = true

    fetch('/data/faqs.json')
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được dữ liệu câu hỏi.')
        return response.json()
      })
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return
        setFaqs(data)
      })
      .catch(() => {
        if (active) setFaqs(fallbackFaqs)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="customer-faq-section">
      <div className="customer-faq-shell">
        <h1>Những câu hỏi thường gặp về LimDim Homestay</h1>
        <div className="customer-faq-grid">
          {faqs.map((item) => (
            <details className="customer-faq-card" key={item.id || item.question} open>
              <summary>
                <span>{item.question}</span>
                <AppIcon name="chevronDown" />
              </summary>
              <div className="customer-faq-answer">
                <FaqAnswer blocks={item.answerBlocks} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
