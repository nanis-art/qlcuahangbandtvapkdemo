
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { imageMap } from "../../utils/productImages";
import "./Favorites.css";

const Favorite = () => {
  
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem("Favorite") || "[]");
    setFavorites(data);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("FavoriteUpdated", loadData);
    return () => window.removeEventListener("FavoriteUpdated", loadData);
  }, []);

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === favorites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map(p => p.id)));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Xóa ${selectedIds.size} mục đã chọn?`)) {
      const updated = favorites.filter(p => !selectedIds.has(p.id));
      localStorage.setItem("Favorite", JSON.stringify(updated));
      setSelectedIds(new Set());
      window.dispatchEvent(new Event("FavoriteUpdated"));
    }
  };

  const handleAddToCartSelected = () => {
    if (selectedIds.size === 0) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const currentFavs = JSON.parse(localStorage.getItem("Favorite") || "[]");
    const itemsToAdd = favorites.filter(p => selectedIds.has(p.id));

    itemsToAdd.forEach(item => {
      const index = cart.findIndex(c => c.id === item.id);
      if (index > -1) {
        cart[index].quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    const remainingFavs = currentFavs.filter(p => !selectedIds.has(p.id));
    localStorage.setItem("Favorite", JSON.stringify(remainingFavs));

    setFavorites(remainingFavs);
    setSelectedIds(new Set());
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("FavoriteUpdated"));
    alert(`Đã thêm ${itemsToAdd.length} sản phẩm vào giỏ hàng.`);
  };

  const handleCompare = () => {
    if (selectedIds.size < 2) {
      alert("Vui lòng chọn tối thiểu 2 sản phẩm để so sánh.");
      return;
    }
    const itemsToCompare = favorites.filter(p => selectedIds.has(p.id));
    navigate("/compare", { state: { items: itemsToCompare } });
  };

  const totalPrice = favorites.filter(p => selectedIds.has(p.id)).reduce((sum, p) => sum + (p.currentPrice || 0), 0);

  return (
    <div className="fav-container">
      <div className="fav-content-layout">
        <div className="fav-main">
          
          <div className="fav-header-box">
            <h1 className="fav-title">
              <i className="bi bi-heart-fill"></i> YÊU THÍCH
            </h1>
            <label className="select-all-label">
              <input type="checkbox" checked={selectedIds.size === favorites.length && favorites.length > 0} onChange={toggleSelectAll} />
              Chọn tất cả
            </label>
          </div>

          {favorites.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-heartbreak" style={{ fontSize: "48px", color: "#ccc" }}></i>
              <p>Trống như cái ví của bạn...</p>
              <button onClick={() => navigate("/")}>Đi mua sắm ngay</button>
            </div>
          ) : (
            <div className="fav-grid">
              {favorites.map(item => (
                <div key={item.id} className={`fav-card ${selectedIds.has(item.id) ? "active" : ""}`} onClick={e => toggleSelect(item.id, e)}>
                  <input type="checkbox" className="card-checkbox" checked={selectedIds.has(item.id)} readOnly />
                  <div className="fav-img-box">
                    <img src={imageMap[item.imageKey] || item.image} alt={item.name} />
                  </div>
                  <div className="fav-info">
                    <div className="fav-name">{item.name}</div>
                    <button
                      className="fav-detail-link"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/product/${item.id}`);
                      }}
                    >
                      Chi tiết sản phẩm <i className="bi bi-chevron-right"></i>
                    </button>
                    <div className="fav-price">{item.currentPrice?.toLocaleString("vi-VN")}₫</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="fav-sidebar">
          <div className="action-panel">
            <h3>Thao tác nhanh</h3>
            <div className="summary-row">
              <span>Đã chọn:</span>
              <strong>{selectedIds.size} sản phẩm</strong>
            </div>
            <div className="summary-row total">
              <span>Tạm tính:</span>
              <strong className="price-total">{totalPrice.toLocaleString("vi-VN")}₫</strong>
            </div>

            <button className="btn-compare-all" disabled={selectedIds.size < 2} onClick={handleCompare}>
              <i className="bi bi-arrow-left-right"></i> So sánh sản phẩm
            </button>

            <div className="action-group-row">
              <button className="btn-delete-all" disabled={selectedIds.size === 0} onClick={handleRemoveSelected}>
                <i className="bi bi-trash"></i> Xóa
              </button>
              <button className="btn-add-all" disabled={selectedIds.size === 0} onClick={handleAddToCartSelected}>
                <i className="bi bi-cart-plus"></i> Thêm vào giỏ
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Favorite;
