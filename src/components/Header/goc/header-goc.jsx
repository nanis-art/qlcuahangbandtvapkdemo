import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logoImage from "../../images/logo.png";

const Header = () => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("cart");
      if (!savedCart) {
        setCartCount(0);
      } else {
        try {
          const cart = JSON.parse(savedCart);
          const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
          setCartCount(totalItems);
        } catch (error) {
          console.error("Lỗi đọc giỏ hàng:", error);
          setCartCount(0);
        }
      }
    };

    const updateCurrentUser = () => {
      const savedUser = localStorage.getItem("currentUser");
      if (!savedUser) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Lỗi đọc thông tin người dùng:", error);
        setCurrentUser(null);
      }
    };

    updateCartCount();
    updateCurrentUser();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("userUpdated", updateCurrentUser);
    window.addEventListener("storage", () => {
      updateCartCount();
      updateCurrentUser();
    });

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("userUpdated", updateCurrentUser);
      window.removeEventListener("storage", () => {
        updateCartCount();
        updateCurrentUser();
      });
    };
  }, []);

  const dienthoaiMenuItems = [
    { text: "Xiaomi", href: "/dien-thoai/xiaomi" },
    { text: "Samsung Galaxy", href: "/dien-thoai/samsung" },
    { text: "OPPO", href: "/dien-thoai/oppo" },
    { text: "Vivo", href: "/dien-thoai/vivo" },
    { text: "Realme", href: "/dien-thoai/realme" },
    { text: "OnePlus", href: "/dien-thoai/oneplus" },
  ];

  const tabletMenuItems = [
    { text: "Xiaomi Pad ", href: "/may-tinh-bang/xiaomi-pad" },
    { text: "Redmi Pad ", href: "/may-tinh-bang/redmi-pad" },
    { text: "POCO Pad ", href: "/may-tinh-bang/poco-pad" },
    { text: "Vivo Pad ", href: "/may-tinh-bang/vivo-pad" },
    { text: "iQOO Pad ", href: "/may-tinh-bang/iqoo-pad" },
    { text: "OPPO Pad ", href: "/may-tinh-bang/oppo-pad" },
    { text: "OnePlus Pad ", href: "/may-tinh-bang/oneplus-pad" },
  ];

  const smartwatchMenuItems = [
    { text: "Xiaomi Watch", href: "/dong-ho-thong-minh/xiaomi" },
    { text: "Redmi Watch ", href: "/dong-ho-thong-minh/redmi" },
    { text: "POCO Watch", href: "/dong-ho-thong-minh/poco" },
    { text: "Vivo Watch", href: "/dong-ho-thong-minh/vivo" },
    { text: "OPPO Watch ", href: "/dong-ho-thong-minh/oppo" },
    { text: "OnePlus Watch", href: "/dong-ho-thong-minh/oneplus" },
    { text: "Samsung Galaxy Watch", href: "/dong-ho-thong-minh/samsung" },
  ];

  const phukienMenuItems = [
    { text: "Âm Thanh", href: "/phu-kien/am-thanh" },
    { text: "Sạc & Nguồn", href: "/phu-kien/sac-nguon" },
    { text: "Phụ Kiện Điện Thoại", href: "/phu-kien/phu-kien-dien-thoai" },
    { text: "Thiết Bị Nhập Liệu", href: "/phu-kien/nhap-lieu" },
    { text: "Phụ Kiện Quay Chụp", href: "/phu-kien/quay-chup" },
    { text: "Thiết Bị Lưu Trữ", href: "/phu-kien/luu-tru" },
    { text: "Smarthome", href: "/phu-kien/smarthome" },
    { text: "Phụ Kiện Khác", href: "/phu-kien/khac" },
  ];

  console.log("dienthoaiMenuItems:", dienthoaiMenuItems);
  console.log("tabletMenuItems:", tabletMenuItems);
  console.log("smartwatchMenuItems:", smartwatchMenuItems);
  console.log("phukienMenuItems:", phukienMenuItems);
  console.log("hoveredMenu:", hoveredMenu);

  return (
    <header className="techshop-header">
      
      <div className="header-top-bar">
        <div className="header-top-content">
          
          <div className="left">
            
            <div className="header-logo-container">
              <div className="techshop-logo">
                <a href="/">  <img src={logoImage} alt="Logo" className="header-logo-image" /></a>
              </div>
            </div>
          </div>

          <div className="center">
            <label className="input-group-search">
              <i className="bi bi-search search-icon"></i>
              <input type="text" placeholder="Tìm kiếm sản phẩm..." value={q} onChange={e => setQ(e.target.value)} />
              <button>Tìm kiếm</button>
            </label>
          </div>

          <div className="right">

            <div className="header-user-actions">
              
              <button className="favorite-button" onClick={() => navigate("/favorites")}>
                <i className="bi bi-heart"></i>
                <span>Yêu thích</span>
                <span className="favorite-badge">0</span>
              </button>

              <button className="cart-button" onClick={() => navigate("/cart")}>
                <i className="bi bi-cart3"></i>
                <span>Giỏ hàng</span>
                <span className="cart-badge">{cartCount}</span>
              </button>

              <span className="action-separator">|</span>
              
              <div className="language-selector">
                <span className="lang-active">VN</span>
                <span className="lang-separator">|</span>
                <span className="lang-option">EN</span>
              </div>

              <button className="login-link" onClick={() => navigate("/login")}>
                <i className="bi bi-person-circle"></i>
                <span>{currentUser ? currentUser.name || currentUser.user : "Đăng nhập"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="header-navigation">
        <div className="nav-content">
          <a href="/" className="nav-link">
            TRANG CHỦ
          </a>

          <div className="nav-item-with-dropdown" onMouseEnter={() => setHoveredMenu("dienthoai")} onMouseLeave={() => setHoveredMenu(null)}>
            <a href="/dienthoai" className={`nav-link ${hoveredMenu === "dienthoai" ? "active" : ""}`}>
              ĐIỆN THOẠI
            </a>
            {hoveredMenu === "dienthoai" && (
              <div className="dropdown-menu">
                {dienthoaiMenuItems.map((item, index) => (
                  <a key={index} href={item.href} className="dropdown-item">
                    {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="nav-item-with-dropdown" onMouseEnter={() => setHoveredMenu("maytinhbang")} onMouseLeave={() => setHoveredMenu(null)}>
            <a href="/may-tinh-bang" className={`nav-link ${hoveredMenu === "maytinhbang" ? "active" : ""}`}>
              MÁY TÍNH BẢNG
            </a>
            {hoveredMenu === "maytinhbang" && (
              <div className="dropdown-menu">
                {tabletMenuItems.map((item, index) => (
                  <a key={index} href={item.href} className="dropdown-item">
                    {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="nav-item-with-dropdown" onMouseEnter={() => setHoveredMenu("dongho")} onMouseLeave={() => setHoveredMenu(null)}>
            <a href="/dong-ho-thong-minh" className={`nav-link ${hoveredMenu === "dongho" ? "active" : ""}`}>
              ĐỒNG HỒ THÔNG MINH
            </a>
            {hoveredMenu === "dongho" && (
              <div className="dropdown-menu">
                {smartwatchMenuItems.map((item, index) => (
                  <a key={index} href={item.href} className="dropdown-item">
                    {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <div className="nav-item-with-dropdown" onMouseEnter={() => setHoveredMenu("phukien")} onMouseLeave={() => setHoveredMenu(null)}>
            <a href="/phu-kien" className={`nav-link ${hoveredMenu === "phukien" ? "active" : ""}`}>
              PHỤ KIỆN
            </a>
            {hoveredMenu === "phukien" && (
              <div className="dropdown-menu">
                {phukienMenuItems.map((item, index) => (
                  <a key={index} href={item.href} className="dropdown-item">
                    {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="/promotions" className="nav-link">
            KHUYẾN MÃI
          </a>
          <a href="/about" className="nav-link">
            VỀ CHÚNG TÔI
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
