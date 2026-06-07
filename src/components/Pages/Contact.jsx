import React, { useEffect } from 'react';
import './Contact.css';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page-wrapper">
      <div className="contact-header-text">
        <h1>Liên Hệ Với Chúng Tôi</h1>
        <p>Vui lòng để lại thông tin, đội ngũ chăm sóc khách hàng của TechShop sẽ hỗ trợ bạn trong thời gian sớm nhất</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-box">
          <div className="info-item">
            <h3>Trụ sở chính</h3>
            <p>484 Kinh Dương Vương, Phường An Lạc, TP. Hồ Chí Minh</p>
          </div>
          <div className="info-item">
            <h3>Hotline hỗ trợ (24/7)</h3>
            <p>1900 xxxx</p>
          </div>
          <div className="info-item">
            <h3>Email chăm sóc khách hàng</h3>
            <p>support@techshop.vn</p>
          </div>
          <div className="info-item">
            <h3>Thời gian làm việc</h3>
            <p>08:00 - 22:00 (Kể cả Thứ 7 & Chủ Nhật)</p>
          </div>
          <div className="map-placeholder">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.8249842416353!2d106.619183415334!3d10.748050992340387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ddb3d7c5417%3A0xc3d29486c9fcd0f4!2zNDg0IEtpbmggRMawxqFuZyBWxrDGoW5nLCBBbiBM4bqhYywgQsOsbmggVMOibiwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1655000000000!5m2!1svi!2s"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
        </div>

        <div className="contact-form-box">
          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã liên hệ!"); }}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" placeholder="Nhập" required />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" placeholder="Nhập" required />
            </div>
            <div className="form-group">
              <label>Email (Tùy chọn)</label>
              <input type="email" placeholder="Nhập" />
            </div>
            <div className="form-group">
              <label>Nội dung cần hỗ trợ</label>
              <textarea rows="6" placeholder=""></textarea>
            </div>
            <button type="submit" className="contact-submit-btn">Gửi Yêu Cầu</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
