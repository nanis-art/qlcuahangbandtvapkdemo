import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";
import logoImage from "../../images/logo.png";
import { imageMap } from "../../utils/productImages";
import { rankProductsBySearch } from "../../utils/productSearch";

const jsonBase = import.meta.env.BASE_URL || "/";

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [favCount, setFavCount] = useState(0);
  const [q, setQ] = useState("");

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBoxRef = useRef(null);

  const navigate = useNavigate();

const searchMatches = rankProductsBySearch(products, q, 5);

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) {
      setCartCount(0);
      return;
    }
    try {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
    } catch {
      setCartCount(0);
    }
  };

  const updateCurrentUser = () => {
    const savedUser = localStorage.getItem("currentUser");
    if (!savedUser) {
      setCurrentUser(null);
      return;
    }
    try {
      setCurrentUser(JSON.parse(savedUser));
    } catch {
      setCurrentUser(null);
    }
  };

  const updateFavCount = () => {
    const savedFavs = localStorage.getItem("Favorite");
    if (!savedFavs) {
      setFavCount(0);
      return;
    }
    try {
      setFavCount(JSON.parse(savedFavs).length);
    } catch {
      setFavCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    updateCurrentUser();
    updateFavCount();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("userUpdated", updateCurrentUser);
    window.addEventListener("FavoriteUpdated", updateFavCount);

    const handleStorageChange = () => {
      updateCartCount();
      updateCurrentUser();
      updateFavCount();
    };
    window.addEventListener("storage", handleStorageChange);

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const header = document.querySelector(".techshop-header");
          if (header) {
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
              header.classList.add("header-hidden");
            } else {
              header.classList.remove("header-hidden");
            }
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const setHeaderHeight = () => {
      const header = document.querySelector(".techshop-header");
      if (header) {
        document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");
      }
    };
    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("userUpdated", updateCurrentUser);
      window.removeEventListener("FavoriteUpdated", updateFavCount);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", setHeaderHeight);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${jsonBase}products.json`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setProducts(data);
      } catch (err) {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!searchFocused) return;
    const onPointerDown = e => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchFocused]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!currentUser) setUserMenuOpen(false);
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUserMenuOpen(false);
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/");
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
    setSearchFocused(false);
  };

  const goToProduct = product => {
    setQ("");
    setSearchFocused(false);
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const dienthoaiMenuItems = [
    { text: "Xiaomi", href: "/dien-thoai/xiaomi" },
    { text: "Samsung Galaxy", href: "/dien-thoai/samsung" },
    { text: "OPPO", href: "/dien-thoai/oppo" },
    { text: "Vivo", href: "/dien-thoai/vivo" },
    { text: "Realme", href: "/dien-thoai/realme" },
    { text: "OnePlus", href: "/dien-thoai/oneplus" },
  ];

  const tabletMenuItems = [
    { text: "Xiaomi Pad", href: "/may-tinh-bang/xiaomi-pad" },
    { text: "Redmi Pad", href: "/may-tinh-bang/redmi-pad" },
    { text: "POCO Pad", href: "/may-tinh-bang/poco-pad" },
    { text: "Vivo Pad", href: "/may-tinh-bang/vivo-pad" },
    { text: "iQOO Pad", href: "/may-tinh-bang/iqoo-pad" },
    { text: "OPPO Pad", href: "/may-tinh-bang/oppo-pad" },
    { text: "OnePlus Pad", href: "/may-tinh-bang/oneplus-pad" },
  ];

  const smartwatchMenuItems = [
    { text: "Xiaomi Watch", href: "/dong-ho-thong-minh/xiaomi" },
    { text: "Redmi Watch", href: "/dong-ho-thong-minh/redmi" },
    { text: "POCO Watch", href: "/dong-ho-thong-minh/poco" },
    { text: "Vivo Watch", href: "/dong-ho-thong-minh/vivo" },
    { text: "OPPO Watch", href: "/dong-ho-thong-minh/oppo" },
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

  const renderDropdown = items => (
    <div className="dropdown-menu">
      {items.map((item, index) => (
        <Link key={index} to={item.href} className="dropdown-item">
          {item.text}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <header className="techshop-header">
        <div className="header-top-bar">
          <div className="header-top-content">
            <div className="left">
              <div className="header-logo-container">
                <div className="techshop-logo">
                  <Link to="/">
                    <img src={logoImage} alt="Logo" className="header-logo-image" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="center" ref={searchBoxRef}>
              <form className="input-group-search" onSubmit={handleSearchSubmit}>
                <i className="bi bi-search search-icon"></i>
                <input type="text" placeholder="Tìm kiếm sản phẩm..." value={q} onChange={e => setQ(e.target.value)} onFocus={() => setSearchFocused(true)} autoComplete="off" />
                <button type="submit">Tìm kiếm</button>
              </form>

              {searchFocused && q.trim().length > 0 && (
                <ul className="header-search_dropdown">
                  {searchMatches.length === 0 ? (
                    <li className="header-search_empty">Không tìm thấy sản phẩm.</li>
                  ) : (
                    searchMatches.map(p => (
                      <li key={p.id}>
                        <button type="button" className="header-search_option" onClick={() => goToProduct(p)}>
                          <span className="header-search_thumb-wrap">
                            <img
                              src={imageMap[p.imageKey] || "https://dummyimage.com/40x40/e2e8f0/475569&text=No"}
                              alt={p.name}
                              className="header-search_thumb"
                              style={{ objectFit: "contain", width: "40px", height: "40px", background: "#f8faff", borderRadius: "4px" }}
                            />{" "}
                          </span>
                          <span className="header-search_meta">
                            <span className="header-search_name">{p.name}</span>
                            {p.currentPrice && <span className="header-search_price">{p.currentPrice}</span>}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}

            </div>

            <div className="right">
              <div className="header-user-actions">
                <button className="favorite-button" onClick={() => navigate("/favorites")}>
                  <i className="bi bi-heart"></i>
                  <span>Yêu thích</span>
                  <span className="favorite-badge">{favCount}</span>
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

                {currentUser ? (
                  <div className="header-user-menu" ref={userMenuRef}>
                    <button className="login-link header-user-menu_trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                      <i className="bi bi-person-circle"></i>
                      <span>{currentUser.name || currentUser.user}</span>
                      <i className={`bi bi-chevron-down ${userMenuOpen ? "is-open" : ""}`}></i>
                    </button>

                    {userMenuOpen && (
                      <div className="header-user-dropdown">
                        <button
                          type="button"
                          className="header-user-dropdown_item"
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigate("/profile");
                          }}
                        >
                          Hồ sơ
                        </button>
                        {currentUser.role === "staff" && (
                          <button
                            type="button"
                            className="header-user-dropdown_item"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate("/admin");
                            }}
                          >
                            Quản trị
                          </button>
                        )}
                        <button type="button" className="header-user-dropdown_item header-user-dropdown_item--logout" onClick={handleLogout}>
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="login-link" onClick={() => navigate("/login")}>
                    <i className="bi bi-person-circle"></i>
                    <span>Đăng nhập</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="header-navigation">
          <div className="nav-content">
            <Link to="/" className="nav-link">
              TRANG CHỦ
            </Link>

            <div className="nav-item-with-dropdown">
              <Link to="/dienthoai" className="nav-link">
                ĐIỆN THOẠI
              </Link>
              {renderDropdown(dienthoaiMenuItems)}
            </div>

            <div className="nav-item-with-dropdown">
              <Link to="/may-tinh-bang" className="nav-link">
                MÁY TÍNH BẢNG
              </Link>
              {renderDropdown(tabletMenuItems)}
            </div>

            <div className="nav-item-with-dropdown">
              <Link to="/dong-ho-thong-minh" className="nav-link">
                ĐỒNG HỒ THÔNG MINH
              </Link>
              {renderDropdown(smartwatchMenuItems)}
            </div>

            <div className="nav-item-with-dropdown">
              <Link to="/phu-kien" className="nav-link">
                PHỤ KIỆN
              </Link>
              {renderDropdown(phukienMenuItems)}
            </div>

            <Link to="/promotions" className="nav-link">
              KHUYẾN MÃI
            </Link>
          </div>
        </nav>
      </header>

      <div className="header-placeholder" />
    </>
  );
};

export default Header;
