import heroImage from '../../../assets/hero.png'

export const fallbackRooms = [
  {
    id: 'double',
    name: 'Phong Giuong Doi',
    description: 'Phong duoc thiet ke theo phong cach hien dai, ket hop hai toa goc rieng tu va tien nghi am ap.',
    image: heroImage,
    price: 180000,
  },
  {
    id: 'single',
    name: 'Phong Giuong Don',
    description: 'Khong gian gon gon cho chuyen di ca nhan, co cua so thoang va day du vat dung can thiet.',
    image: heroImage,
    price: 100000,
  },
  {
    id: 'dorm',
    name: 'Phong Dorm',
    description: 'Lua chon tiet kiem cho nhom ban tre, gan khu sinh hoat chung va cac tien ich co ban.',
    image: heroImage,
    price: 120000,
  },
]

export const emptyCustomerForm = { name: '', email: '', phone: '', address: '', image: '' }
