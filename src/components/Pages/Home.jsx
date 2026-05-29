// 1. IMPORTS
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../Products/ProductCard";
import { imageMap } from "../../utils/productImages";
import "./Home.css";

const jsonBase = import.meta.env.BASE_URL || "/";

// 2. MAIN COMPONENT
const Home = () => {
  // 2.1 State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2.2 Load Data
  useEffect(() => {
    fetch(`${jsonBase}products.json`)
      .then(res => res.json())
      .then(data => {
        const rawProducts = Array.isArray(data) ? data : [];
        const mappedProducts = rawProducts.map(item => ({
          ...item,
          image: imageMap[item.imageKey] || item.image
        }));
        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải products.json", err);
        setLoading(false);
      });
  }, []);

  // 2.3 Derived Data
  const getNum = (val) => parseInt(val, 10) || 0;

  const bestSellers = [...products]
    .sort((a, b) => getNum(b.sold) - getNum(a.sold))
    .slice(0, 10);

  const getDiscountPercent = (p) => {
    const o = getNum(p.originalPrice);
    const c = getNum(p.currentPrice);
    if (o > 0 && c > 0 && o > c) {
      return (o - c) / o;
    }
    return 0;
  };
  const discounted = [...products]
    .filter(p => getDiscountPercent(p) > 0)
    .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
    .slice(0, 10);

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const phones = React.useMemo(() => {
    const list = products.filter(p => getNum(p.idcategory || p.categoryid) === 1);
    return shuffle(list).slice(0, 10);
  }, [products]);

  const tablets = React.useMemo(() => {
    const list = products.filter(p => getNum(p.idcategory || p.categoryid) === 2);
    return shuffle(list).slice(0, 10);
  }, [products]);

  const validAccessoryCats = [3, 4, 7, 8, 9, 11];
  const accessories = React.useMemo(() => {
    const list = products.filter(p => validAccessoryCats.includes(getNum(p.idcategory || p.categoryid)));
    return shuffle(list).slice(0, 10);
  }, [products]);

  // 3. RENDER
  if (loading) return <div className="home-loading">Đang tải trang chủ...</div>;

  const renderSection = (title, items, linkAll) => {
    if (!items || items.length === 0) return null;
    return (
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">{title}</h2>
          {linkAll && (
            <span className="home-section-link" style={{ cursor: 'pointer' }} onClick={(e) => e.preventDefault()}>
              Xem tất cả <i className="bi bi-chevron-right"></i>
            </span>
          )}
        </div>
        <div className="home-product-grid">
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {renderSection(
          <><i className="bi bi-fire text-danger"></i> Sản Phẩm Bán Chạy</>,
          bestSellers,
          "/products"
        )}
        {renderSection(
          <><i className="bi bi-lightning-charge-fill text-warning"></i> Khuyến Mãi Hot</>,
          discounted,
          "/promotions"
        )}
        {renderSection(
          <><i className="bi bi-phone-fill text-primary"></i> Điện Thoại Nổi Bật</>,
          phones,
          "/dienthoai"
        )}
        {renderSection(
          <><i className="bi bi-tablet-landscape-fill text-info"></i> Máy Tính Bảng</>,
          tablets,
          "/may-tinh-bang"
        )}
        {renderSection(
          <><i className="bi bi-headset text-secondary"></i> Phụ Kiện Công Nghệ</>,
          accessories,
          "/phu-kien"
        )}
      </div>
    </div>
  );
};

export default Home;
