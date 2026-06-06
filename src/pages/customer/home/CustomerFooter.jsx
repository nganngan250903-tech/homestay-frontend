import { Link } from 'react-router-dom'
import AppIcon from '../../../components/AppIcon'

const mapUrl = 'https://maps.app.goo.gl/ykFvjUHEnyu5a1B19'

function CustomerFooter() {
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="customer-footer">
      <div className="customer-footer-inner">
        <div className="customer-footer-brand">
          <Link className="customer-logo" to="/home">Lim Dim Homestay</Link>
        </div>
        <div className="customer-footer-grid">
          <section>
            <h3>Về chúng tôi</h3>
            <p>Thành lập năm 2024.</p>
            <p>Mô hình kinh doanh du lịch nghỉ dưỡng.</p>
            <p>Mang lại cảm giác gần gũi, thân thiện như ở nhà</p>
          </section>
          <section>
            <h3>Tài khoản</h3>
            <Link to="/home">Tài khoản của tôi</Link>
            <Link to="/home/bookingRoom">Lịch sử đặt phòng</Link>
          </section>
          <section>
            <h3>Liên hệ</h3>
            <span>Email: LimDim@gmail.com.vn</span>
            <a href={mapUrl} target="_blank" rel="noreferrer">Địa chỉ: 16/52 Ba Triệu, Huế</a>
            <span>Phone: +84 328 54 7686</span>
            <span>Website: LimDimhomestay.vn</span>
            <span className="footer-social">f</span>
          </section>
        </div>
      </div>
      <button className="footer-top-btn" onClick={scrollTop} type="button" aria-label="Về đầu trang">
        <AppIcon name="chevronUp" />
      </button>
    </footer>
  )
}

export default CustomerFooter
