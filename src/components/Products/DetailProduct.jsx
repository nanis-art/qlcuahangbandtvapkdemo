import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { imageMap } from "../../utils/productImages";
import "./DetailProduct.css";

const DetailProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [isLoading, setIsLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) return;
    const fetchProduct = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }
        const data = await response.json();
        const found = data.find(item => String(item.id) === String(id));
        if (!found) {
          throw new Error('Sản phẩm không tồn tại');
        }
        setProduct({
          ...found,
          image: imageMap[found.imageKey] || found.image,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, product]);

  if (isLoading) {
    return <div className="detail-container">Đang tải chi tiết sản phẩm...</div>;
  }
  
  if (error) {
    return <div className="detail-container">Lỗi: {error}</div>;
  }
  
  if (!product) {
    return null;
  }

  //THÊM VÀO GIỎ HÀNG
  const handleAddToCart = e => {
    e.stopPropagation();

    // 1. Lôi giỏ hàng cũ từ kho ra
    const savedCart = localStorage.getItem("cart");
    let cartItems = savedCart ? JSON.parse(savedCart) : [];

    // 2. Check có trong giỏ chưa
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingItemIndex !== -1) {
      // Có thì tăng số lượng
      cartItems[existingItemIndex].quantity += 1;
    } else {
      // Chưa có thì thêm mới, set số lượng = 1
      cartItems.push({
        ...product,
        quantity: 1,
      });
    }

    // 3. Lưu lại vào kho
    localStorage.setItem("cart", JSON.stringify(cartItems));
    setTimeout(() => {
      window.dispatchEvent(new Event("cartUpdated"));
      // alert("Thêm vào giỏ hàng thành công!");
    }, 0);
  };

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>
      
      <div className="detail-card">
        <div className="detail-image">
          <img src={product.image || 'https://via.placeholder.com/500x350'} alt={product.name} />
        </div>
        
        <div className="detail-info">
          {/* Tên sản phẩm */}
          <h2>{product.name}</h2>
          
          {/* Giá */}
          <p className="detail-price">
            <span className="current-price">          {product.currentPrice ? product.currentPrice.toLocaleString("vi-VN") + " ₫" : "Đang cập nhật"}</span>
            {product.originalPrice && <span className="original-price">{product.originalPrice.toLocaleString("vi-VN")}₫</span>}
            {product.discount && <span className="discount">{product.discount}</span>}
          </p>
          {/* Đánh giá */}
          <div className="detail-meta">
            {product.rating && <span> {product.rating}</span>}
            {product.sold && <span>Đã bán {product.sold}</span>}
          </div>
          
          <div className="product-actions">
            {/* Thêm vào giỏ hàng */}
            <button className="add-to-cart-btn" onClick={handleAddToCart} title="Thêm vào giỏ hàng">
              <i className="bi bi-cart-plus"></i>
            </button>
            {/* Mua Ngay */}
            <button
              className="buy-now-button"
              onClick={() => {
                const savedCart = localStorage.getItem("cart");
                const cart = savedCart ? JSON.parse(savedCart) : [];
                const existingItemIndex = cart.findIndex(item => item.id === product.id);
                if (existingItemIndex >= 0) {
                  // cart[existingItemIndex].quantity += selectedQuantity;
                  navigate('/cart');
                } else {
                  cart.push({
                    ...product,
                    // quantity: selectedQuantity,
                    quantity: 1, 
                  });
                  localStorage.setItem('cart', JSON.stringify(cart));
                  window.dispatchEvent(new Event('cartUpdated'));
                  navigate('/cart');
                }
              }}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;