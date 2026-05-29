import React from "react";
import "./Footer.css";
import logo from "../../images/logo.png";

const Footer = () => {
  return (
    <footer className="techshop-footer">
      {/* Blue strip at the top */}
      <div className="footer-green-strip"></div>

      <div className="footer-content">

        {/* Left Section: Logo and Copyright */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src={logo} alt="TechShop" className="footer-logo-img" />
          </div>
          <p className="footer-copyright">Shop bán điện thoại uy tín tại Việt Nam</p>
        </div>

        {/* Middle Section: Navigation Links */}
        <div className="footer-middle">
          {/* Column 1: VỀ TechShop */}
          <div className="footer-column">
            <h3 className="footer-column-title">VỀ TECHSHOP</h3>
            <ul className="footer-links">
              <li><a href="/origin">Nguồn gốc</a></li>
              <li><a href="/services">Dịch vụ</a></li>
              <li><a href="/careers">Nghề Nghiệp</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>

          {/* Column 2: TIN TỨC */}
          <div className="footer-column">
            <h3 className="footer-column-title">TIN TỨC</h3>
            <ul className="footer-links">
              <li><a href="/news">Tin tức mới nhất</a></li>
              <li><a href="/promotions">Khuyến mãi</a></li>
              
            </ul>
          </div>

          {/* Column 3: HỆ THỐNG CỬA HÀNG — ✅ ĐÃ ĐƯA VÀO TRONG footer-middle */}
          <div className="footer-column">
            <h3 className="footer-column-title">HỆ THỐNG CỬA HÀNG</h3>
            <ul className="footer-links">
              <li><a href="/find-store">Tìm cửa hàng gần nhất</a></li>
            </ul>
          </div>
        </div>

        {/* Right Section: Social Media — ✅ NẰM TRONG footer-content, NGANG HÀNG footer-middle */}
        <div className="footer-right">
          <h3 className="footer-column-title">THEO DÕI CHÚNG TÔI</h3>
          <div className="footer-social-icons">
            <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://youtube.com" className="social-icon" aria-label="YouTube">
              <i className="bi bi-youtube"></i>
            </a>
            <a href="https://tiktok.com" className="social-icon" aria-label="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>
          </div>

          <div className="footer-map">
            <iframe
              title="Bản đồ địa điểm TechShop"
              className="footer-map-iframe"
              src="https://www.google.com/maps?q=10.743902,106.6340446&z=17&output=embed&hl=vi"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              className="footer-map-link"
              href="https://maps.app.goo.gl/6RuUrqKaYAFspPe57"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở trong Google Maps
            </a>
          </div>
        </div>

      </div>
      
      <div className="footer-bottom" style={{ textAlign: "center", padding: "15px 0", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#ccc" }}>© 2025 TechShop. All rights reserved</p>
      </div>
            {/* Chat Icon */}
            <div className="footer-chat-icon" title="Chat với chúng tôi">
        <i className="bi bi-chat-dots-fill"></i>
      </div>
    </footer>
    
  );
};

export default Footer;