import StatCard from '../components/StatCard'

function DashboardHomePage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="muted-text">Tong quan nhanh cho khu vuc quan tri LimDimHomestay.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="API dat phong" value="/bookings" />
        <StatCard label="API phong" value="/rooms" tone="mint" />
        <StatCard label="API nhan vien" value="/employees" tone="cream" />
      </div>

      <section className="panel note-panel">
        <h2>Chuc nang da noi backend</h2>
        <p>
          Sidebar admin hien da co cac module chinh theo controller backend: booking, phong,
          loai phong, bang gia, anh phong, chi nhanh, tien nghi, khach hang, nhan vien,
          vai tro va thong ke.
        </p>
      </section>
    </section>
  )
}

export default DashboardHomePage
