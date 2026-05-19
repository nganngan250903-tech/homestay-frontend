import AppIcon from '../components/AppIcon'
import Brand from '../components/Brand'

function HomePage({ auth, onLogout }) {
  const displayName = auth?.user?.name || auth?.user?.email || auth?.email || 'Nguoi dung'
  const role = auth?.role || auth?.user?.role || auth?.userType || 'USER'

  return (
    <main className="login-page">
      <header className="login-header">
        <Brand subtitle="Homestay portal" />
      </header>

      <section className="login-card">
        <p className="eyebrow">Trang chu</p>
        <h1>Xin chao, {displayName}</h1>
        <p className="muted-text">
          Tai khoan dang dang nhap voi quyen {role}. Khu vuc quan tri chi danh cho ADMIN.
        </p>
        <button className="cancel-btn home-logout-btn" onClick={onLogout} type="button">
          <AppIcon name="logout" />
          Dang xuat
        </button>
      </section>
    </main>
  )
}

export default HomePage
