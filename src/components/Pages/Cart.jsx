import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { imageMap } from "../../utils/productImages";
import { isEligibleItem, getEligibleSubTotal, calculateCartTotals } from "../../utils/cartUtils";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [vouchersData, setVouchersData] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState({ type: "", text: "" });
  const [showVoucherList, setShowVoucherList] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)); } catch (e) { setCartItems([]); }
    }

    fetch('/vouchers.json')
      .then(res => res.json())
      .then(data => setVouchersData(data))
      .catch(err => console.error(err));
  }, []);

  const updateCart = newCart => {
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));

    const validIds = selectedIds.filter(id => newCart.some(item => item.id === id));
    setSelectedIds(validIds);
  };

  const toggleSelect = id => setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length && cartItems.length > 0) setSelectedIds([]);
    else setSelectedIds(cartItems.map(item => item.id));
  };

  const increaseQuantity = productId => updateCart(cartItems.map(item => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)));

  const decreaseQuantity = productId => {
    updateCart(cartItems.map(item => {
      if (item.id === productId) return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : null;
      return item;
    }).filter(Boolean));
  };

  const removeItem = productId => updateCart(cartItems.filter(item => item.id !== productId));

  const removeSelected = () => {
    if (selectedIds.length === 0) return;
    updateCart(cartItems.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    const foundVoucher = vouchersData.find(v => v.code === code);
    if (!foundVoucher) {
      setAppliedVoucher(null);
      setVoucherMessage({ type: "error", text: "Mã không tồn tại hoặc hết hạn!" });
      return;
    }

    const eligibleSub = getEligibleSubTotal(cartItems, selectedIds, foundVoucher.applicableBrands);
    if (eligibleSub < foundVoucher.minOrderValue) {
      setAppliedVoucher(null);
      setVoucherMessage({ type: "error", text: `Đơn sản phẩm hợp lệ chưa đạt ${new Intl.NumberFormat("vi-VN").format(foundVoucher.minOrderValue)}đ` });
      return;
    }

    setAppliedVoucher(foundVoucher);
    setVoucherMessage({ type: "success", text: "Áp dụng thành công!" });
  };

  useEffect(() => {
    if (appliedVoucher) {
      const eligibleSub = getEligibleSubTotal(cartItems, selectedIds, appliedVoucher.applicableBrands);
      if (eligibleSub < appliedVoucher.minOrderValue) {
        setAppliedVoucher(null);
        setVoucherMessage({ type: "error", text: "Giỏ hàng thay đổi, không đủ điều kiện áp dụng mã!" });
      }
    }
  }, [cartItems, selectedIds]);

  const { subTotal, shippingFee, productDiscount, shippingDiscount, finalTotal } = useMemo(() => {
    return calculateCartTotals(cartItems, selectedIds, appliedVoucher);
  }, [cartItems, selectedIds, appliedVoucher]);

  const formatPrice = price => new Intl.NumberFormat("vi-VN").format(price) + "đ";

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
          <button className="continue-shopping-btn" onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header-top">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
      </div>

      <div className="cart-content">
        <div className="cart-main">
          {cartItems.length > 0 && (
            <div className="cart-list-header">
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                onChange={toggleSelectAll}
              />
              <span className="select-all-text">Chọn tất cả ({cartItems.length} sản phẩm)</span>
            </div>
          )}

          <div className="cart-items">
            {cartItems.map(item => {
              const price = parseFloat(String(item.currentPrice).replace(/[^\d]/g, "")) || 0;
              const isSelected = selectedIds.includes(item.id);

              return (
                <div key={item.id} className={`cart-item ${isSelected ? "selected" : ""}`}>
                  <div className="cart-item-select">
                    <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} />
                  </div>
                  <div className="cart-item-image">
                    <img src={item.image || imageMap[item.imageKey] || "https://via.placeholder.com/150"} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">{formatPrice(price)}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button className="quantity-btn minus" onClick={() => decreaseQuantity(item.id)}>-</button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button className="quantity-btn plus" onClick={() => increaseQuantity(item.id)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    <p className="item-total-price">{formatPrice(price * item.quantity)}</p>
                  </div>
                  <button className="remove-item-btn" onClick={() => removeItem(item.id)} title="Xóa sản phẩm">
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Tổng kết đơn hàng</h2>
          <div className="summary-row">
            <span>Đã chọn:</span>
            <span className="summary-count">{selectedIds.length} mục</span>
          </div>
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{formatPrice(subTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>

          <div className="voucher-section">
            <div className="voucher-input-group">
              <input
                type="text"
                placeholder="Mã giảm giá..."
                value={voucherCode}
                onChange={(e) => { setVoucherCode(e.target.value); if(voucherMessage.text) setVoucherMessage({ type: "", text: "" }); }}
                className="voucher-input"
              />
              <button onClick={handleApplyVoucher} disabled={!voucherCode.trim()} className="voucher-apply-btn">Áp dụng</button>
              <button onClick={() => setShowVoucherList(!showVoucherList)} className="voucher-list-btn">🎟️ Chọn</button>
            </div>

            {showVoucherList && (
              <div className="voucher-dropdown-list">
                <div className="voucher-header">
                  <h4>Mã giảm giá có sẵn</h4>
                  <button onClick={() => setShowVoucherList(false)}>✕</button>
                </div>
                <div className="voucher-items">
                  {vouchersData.length > 0 ? vouchersData.map(v => {
                    const elSub = getEligibleSubTotal(cartItems, selectedIds, v.applicableBrands);
                    const isEligible = elSub >= v.minOrderValue;
                    const brandsText = v.applicableBrands && v.applicableBrands.length > 0 ? v.applicableBrands.join(', ') : "Tất cả sản phẩm";

                    return (
                      <div key={v.code} className={`v-card ${isEligible ? 'eligible' : 'disabled'}`}>
                        <div className="v-icon">🎟️</div>
                        <div className="v-info">
                          <p className="v-code">{v.code}</p>
                          <p className="v-desc">{v.description}</p>
                          <p className="v-cond">
                            Đơn {brandsText} từ {new Intl.NumberFormat("vi-VN").format(v.minOrderValue)}đ
                          </p>
                        </div>
                        <button
                          className="v-use-btn"
                          disabled={!isEligible}
                          onClick={() => {
                            setVoucherCode(v.code); setAppliedVoucher(v); setVoucherMessage({ type: "success", text: "Áp dụng thành công!" }); setShowVoucherList(false);
                          }}
                        >
                          Dùng
                        </button>
                      </div>
                    );
                  }) : <p className="voucher-loading">Đang tải mã...</p>}
                </div>
              </div>
            )}

            {voucherMessage.text && (
              <p className={`voucher-message ${voucherMessage.type}`}>{voucherMessage.text}</p>
            )}
          </div>

          {productDiscount > 0 && (
            <div className="summary-row discount-row">
              <span>Giảm giá sản phẩm:</span>
              <span className="discount-amount">-{formatPrice(productDiscount)}</span>
            </div>
          )}

          {shippingDiscount > 0 && (
            <div className="summary-row discount-row">
              <span>Giảm phí vận chuyển:</span>
              <span className="discount-amount">-{formatPrice(shippingDiscount)}</span>
            </div>
          )}

          <div className="summary-row total-row">
            <span>Tổng tiền:</span>
            <span className="total-price">{formatPrice(finalTotal)}</span>
          </div>

          <div className="summary-actions-grid">
            <button className="checkout-btn" disabled={selectedIds.length === 0}>Thanh toán</button>
            <button className="remove-selected-btn" onClick={removeSelected} disabled={selectedIds.length === 0}>Xóa đã chọn</button>
          </div>

          <button className="continue-shopping-btn" onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;