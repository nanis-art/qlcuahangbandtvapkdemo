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

  return (
    <div className="product-card">
      
      <button className="favorite-btn" title="yêu thích sp">
        <i className="bi bi-heart"></i>
      </button>

      <div className="product-image-container">
        <img src={product.image || "https://via.placeholder.com/300x200"} alt={product.name} className="product-image" />
      </div>
      <h3 className="product-name">{product.name}</h3>

      <div className="product-pricing">
        <div className="current-price">
          
          {product.currentPrice ? product.currentPrice.toLocaleString("vi-VN") + " ₫" : "Đang cập nhật"}
        </div>

        <div className="original-price-section">
          
          {product.originalPrice && <span className="original-price">{product.originalPrice.toLocaleString("vi-VN")}₫</span>}
          {product.discount && <span className="discount">{product.discount}</span>}
        </div>
      </div>
      <div className="product-rating-sales">
        <span className="rating">{product.rating}</span>
        <span className="sales">Đã bán {product.sold}</span>
      </div>

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
