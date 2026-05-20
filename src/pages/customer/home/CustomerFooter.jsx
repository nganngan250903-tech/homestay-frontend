import { Link } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'

function CustomerFooter() {
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="customer-footer">
      <div className="customer-footer-band" />
      <div className="customer-footer-inner">
        <div className="customer-footer-brand">
          <Link className="customer-logo" to="/home">Lim Dim Homestay</Link>
        </div>
        <div className="customer-footer-grid">
          <section>
            <h3>Ve chung toi</h3>
            <p>Thanh lap nam 2024.</p>
            <p>Mo hinh kinh doanh du lich nghi duong.</p>
            <p>Mang lai cam giac gan gui, than thien nhu o nha</p>
          </section>
          <section>
            <h3>Homestay</h3>
            <Link to="/home/dat-phong">Danh sach cac phong</Link>
            <Link to="/home/uu-dai">Khuyen mai</Link>
          </section>
          <section>
            <h3>Tai khoan</h3>
            <Link to="/home">Tai khoan cua toi</Link>
            <Link to="/home/dat-phong">Lich su dat phong</Link>
          </section>
          <section>
            <h3>Lien he</h3>
            <span>Email: LimDim@gmail.com.vn</span>
            <span>Dia chi:16/52 Ba Trieu, Hue City, Vietnam</span>
            <span>Phone: +84 328 54 7686</span>
            <span>Website: LimDimhomestay.vn</span>
            <span className="footer-social">f</span>
          </section>
        </div>
      </div>
      <button className="footer-top-btn" onClick={scrollTop} type="button" aria-label="Ve dau trang">
        <AppIcon name="chevronUp" />
      </button>
    </footer>
  )
}

export default CustomerFooter
