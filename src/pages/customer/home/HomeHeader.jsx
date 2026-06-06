import { Link, NavLink } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'
import CustomerAvatar from '../../admin/customers/CustomerAvatar'

const mapUrl = 'https://maps.app.goo.gl/ykFvjUHEnyu5a1B19'

function HomeHeader({
  currentCustomer,
  isCustomer,
  menuOpen,
  onAuthOpen,
  onHistoryOpen,
  onLogout,
  onMenuToggle,
  onOpenModal,
}) {
  return (
    <header className="customer-nav">
      <div className="customer-header-brand">
        <Link className="customer-logo" to="/home">Lim Dim Homestay</Link>
        <a className="customer-header-address" href={mapUrl} target="_blank" rel="noreferrer">
          <AppIcon name="mapPin" />
          <span>16/52 Ba Triệu, Huế</span>
        </a>
      </div>
      <nav aria-label="Điều hướng trang chủ">
        <NavLink end to="/home">Thông tin</NavLink>
        <NavLink to="/home/bookingRoom">Đặt phòng</NavLink>
        <NavLink to="/home/amenities">Tiện Nghi</NavLink>
        <NavLink to="/home/rules">Quy tắc chung</NavLink>
        <NavLink to="/home/questions">Câu hỏi</NavLink>
      </nav>
      <div className="customer-nav-actions">
        {isCustomer ? (
          <div className="customer-account-menu">
            <button className="customer-account-trigger" onClick={onMenuToggle} type="button">
              <CustomerAvatar customer={currentCustomer} />
              <span>{currentCustomer.name || currentCustomer.email}</span>
              <AppIcon name="chevronDown" />
            </button>
            {menuOpen && (
              <div className="customer-account-dropdown">
                <button onClick={() => onOpenModal('profile')} type="button">
                  <AppIcon name="edit" />
                  Chỉnh sửa thông tin
                </button>
                <button onClick={() => onOpenModal('password')} type="button">
                  <AppIcon name="lock" />
                  Đổi mật khẩu
                </button>
                <button onClick={onHistoryOpen} type="button">
                  <AppIcon name="history" />
                  Xem lịch sử booking
                </button>
                <button onClick={onLogout} type="button">
                  <AppIcon name="logout" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => onAuthOpen('login')} type="button">Đăng nhập</button>
            <button onClick={() => onAuthOpen('register')} type="button">Đăng ký</button>
          </>
        )}
      </div>
    </header>
  )
}

export default HomeHeader
