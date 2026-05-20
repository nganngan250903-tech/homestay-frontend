import { Link, NavLink } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'
import CustomerAvatar from '../../admin/customers/CustomerAvatar'

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
      <Link className="customer-logo" to="/home">Lim Dim Homestay</Link>
      <nav aria-label="Dieu huong trang chu">
        <NavLink end to="/home">Thông tin</NavLink>
        <NavLink to="/home/bookingRoom">Đặt phòng</NavLink>
        <NavLink to="/home/amenities">Tien nghi</NavLink>
        <NavLink to="/home/services">Dich vu</NavLink>
        <NavLink to="/home/offers">Uu dai</NavLink>
        <NavLink to="/home/rulesFaq">Quy tac & FAQ</NavLink>
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
                  Chỉnh sửa thong tin
                </button>
                <button onClick={() => onOpenModal('password')} type="button">
                  <AppIcon name="lock" />
                  Doi mat khau
                </button>
                <button onClick={onHistoryOpen} type="button">
                  <AppIcon name="history" />
                  Xem lich su booking
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
