import heroImage from '../../../assets/hero.png'

export const fallbackRooms = [
  {
    id: 'double',
    name: 'Phòng Giường Đôi',
    description: 'Phòng được thiết kế theo phong cách hiện đại, kết hợp hài hòa góc riêng tư và tiện nghi ấm áp.',
    image: heroImage,
    price: 180000,
  },
  {
    id: 'single',
    name: 'Phòng Giường Đơn',
    description: 'Không gian gọn gọn cho chuyến đi cá nhân, có cửa sổ thoáng và đầy đủ vật dụng cần thiết.',
    image: heroImage,
    price: 100000,
  },
  {
    id: 'dorm',
    name: 'Phòng Dorm',
    description: 'Lựa chọn tiết kiệm cho nhóm bạn trẻ, gần khu sinh hoạt chung và các tiện ích cơ bản.',
    image: heroImage,
    price: 120000,
  },
]

export const emptyCustomerForm = { name: '', email: '', phone: '', address: '', image: '' }
