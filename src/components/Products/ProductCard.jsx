import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const productsUrl = `${import.meta.env.BASE_URL}products.json`;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(productsUrl);
      if (!response.ok) {
        throw new Error("Không thể tải thông tin sản phẩm");
      }
      const data = await response.json();
      const matchedProduct = data.find(item => item.id === product.id);

      if (!matchedProduct) {
        throw new Error("Sản phẩm không tồn tại");
      }

      navigate(`/product/${product.id}`, {
        state: { product: { ...matchedProduct, image: product.image } },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isFavorite, setIsFavorite] = useState(false);
  React.useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("Favorite") || "[]");
    setIsFavorite(favorites.some(item => item.id === product.id));
  }, [product.id]);
  const toggleFavorite = e => {
    e.stopPropagation();
    let favorites = JSON.parse(localStorage.getItem("Favorite") || "[]");

    if (isFavorite) {
      favorites = favorites.filter(item => item.id !== product.id);
    } else {
      favorites.push({
        id: product.id,
        name: product.name,
        currentPrice: product.currentPrice,
        originalPrice: product.originalPrice,
        image: product.image,
        imageKey: product.imageKey || "",
        rating: product.rating,
        sold: product.sold,
      });
    }

    localStorage.setItem("Favorite", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event("FavoriteUpdated"));
  };

  return (
    <div className="product-card">
      {/*NÚT YÊU THÍCH CHUẨN SHOPEE*/}
      <button className={`favorite-btn ${isFavorite ? "active" : ""}`} onClick={toggleFavorite} title={isFavorite ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}>
        <i className={`bi ${isFavorite ? "bi-heart-fill" : "bi-heart"}`}></i>
      </button>

      <div className="product-image-container">
        <img src={product.image || "https://via.placeholder.com/300x200"} alt={product.name} className="product-image" loading="lazy"/>
      </div>
      <h3 className="product-name">{product.name}</h3>

      {/* <div className="product-ram-ssd">
        <button className="ram-ssd-tag">{product.sizeS}</button>
        <button className="ram-ssd-tag">{product.sizeM}</button>
        <button className="ram-ssd-tag">{product.sizeL}</button>
      </div> */}

      {/* code cũ  */}
      {/* <div className="product-pricing">
        <div className="current-price">{product.currentPrice}</div>
        <div className="original-price-section">
          <span className="original-price">{product.originalPrice}</span>
          {product.discount && <span className="discount">{product.discount}</span>}
        </div>
      </div> */}

      <div className="product-pricing">
        <div className="current-price">
          {/* thêm dấu chấm phân cách hàng nghìn và chữ ₫ */}
          {product.currentPrice ? product.currentPrice.toLocaleString("vi-VN") + " ₫" : "Đang cập nhật"}
        </div>

        <div className="original-price-section">
          {/* thêm dấu chấm phân cách hàng nghìn và chữ ₫ */}
          {product.originalPrice && <span className="original-price">{product.originalPrice.toLocaleString("vi-VN")}₫</span>}
          {product.discount && <span className="discount">{product.discount}</span>}
        </div>
      </div>
      <div className="product-rating-sales">
        <span className="rating">{product.rating}</span>
        <span className="sales">Đã bán {product.sold}</span>
      </div>

      {/* KHU VỰC NÚT BẤM KÉP */}
      <div className="product-actions">
        <button className="compare-button" onClick={handleBuy} disabled={isLoading}>
          {isLoading ? "Đang mở..." : "Mua ngay"}
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default ProductCard;
