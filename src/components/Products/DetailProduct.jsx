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
        const response = await fetch("/products.json");
        if (!response.ok) {
          throw new Error("Không thể tải thông tin sản phẩm");
        }
        const data = await response.json();
        const found = data.find(item => String(item.id) === String(id));
        if (!found) {
          throw new Error("Sản phẩm không tồn tại");
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
  const getQuickSpecs = (item) => {
    const spec = item.specifications || item.thongSo || item.specs;
    if (!spec) return [];
    const row = (label, value) => {
      if (!value) return null;
      if (Array.isArray(value)) return value.length ? { label, value: value.join(', ') } : null;
      if (typeof value === 'object') return null;
      return { label, value: String(value) };
    };

    switch (Number(item.idcategory)) {
      case 1: // Điện thoại
      case 2: // Máy tính bảng
        return [
          row("Màn hình", spec.display?.size || spec.manHinh),
          row("Chipset", spec.processor?.chipset || spec.chip),
          row("RAM", spec.memory?.ram || spec.ram),
          row("Bộ nhớ trong", spec.memory?.rom || spec.rom),
          row("Pin", spec.battery?.capacity || spec.pin),
          row("Camera", spec.camera?.main || spec.camera),
        ].filter(Boolean);

      case 3: // Đồng hồ & Vòng đeo tay
        return [
          row("Màn hình", spec.display?.size || spec.manHinh),
          row("Thời lượng pin", spec.battery?.batteryLife || spec.pin),
          row("Chống nước", spec.design?.waterResistance || spec.chongNuoc),
          row("Kết nối", spec.connectivity?.bluetooth || spec.ketNoi),
          row("Chất liệu", spec.design?.material || spec.tinhNang),
        ].filter(Boolean);

      case 4: // Âm thanh
        return [
          row("Kiểu dáng", spec.design?.type || spec.kieuDang),
          row("Kết nối", spec.connectivity?.bluetooth || spec.connectivity?.type || spec.ketNoi),
          row("Driver âm thanh", spec.audio?.driver || spec.congSuat),
          row("Thời lượng pin", spec.battery?.total || spec.battery?.earphone || spec.thoiLuongPin || spec.pin),
          row("Chống ồn", spec.anc?.supported ? "Có ANC" : spec.chongOn),
        ].filter(Boolean);

      case 5: // Sạc - Cáp - Pin dự phòng
        return [
          row("Dung lượng pin", spec.powerBank?.capacity || spec.dungLuong),
          row("Công suất tối đa", spec.power?.maxWatt ? `${spec.power.maxWatt}W` : spec.congSuat),
          row("Đầu vào (Input)", spec.power?.input || spec.powerBank?.input || spec.congSuat),
          row("Đầu ra (Output)", spec.power?.output || spec.powerBank?.output || spec.congSuatRa),
          row("Chiều dài cáp", spec.cable?.length || spec.chieuDai),
        ].filter(Boolean);

      case 6: // Ốp lưng - Kính cường lực
        return [
          row("Chất liệu", spec.material?.type || spec.chatLieu),
          row("Màu sắc", spec.design?.colors || spec.mauSac),
          row("Độ dày/Cứng", spec.protection?.thickness || spec.protection?.hardness || spec.doDay),
        ].filter(Boolean);

      case 7: // Bút - Bàn phím
        return [
          row("Kiểu kết nối", spec.connectivity?.bluetooth || spec.connectivity?.type || spec.ketNoi),
          row("Thời lượng pin", spec.battery?.batteryLife || spec.pin),
          row("Loại Switch", spec.keyboard?.switchType || spec.kieuDang),
        ].filter(Boolean);

      case 8: // Gimbal - Tripod - Mic
        return [
          row("Tải trọng tối đa", spec.gimbal?.payload || spec.tripod?.maxLoad || spec.taiTrong),
          row("Chiều cao tối đa", spec.tripod?.maxHeight || spec.chieuCao),
          row("Thời lượng pin", spec.battery?.batteryLife || spec.thoiLuongPin),
          row("Giao tiếp", spec.connectivity?.bluetooth || spec.mic?.interface || spec.ketNoi),
        ].filter(Boolean);

      case 9: // Thẻ nhớ - USB - SSD
        return [
          row("Dung lượng", spec.storage?.capacity || spec.dungLuong),
          row("Tốc độ đọc", spec.speed?.read || spec.tocDoDoc),
          row("Tốc độ ghi", spec.speed?.write || spec.tocDoGhi),
          row("Chuẩn giao tiếp", spec.storage?.interface || spec.chuanGiaoTiep),
        ].filter(Boolean);

      case 10: // Smart Home - Network
        return [
          row("Độ phân giải", spec.camera?.resolution || spec.doPhanGiai),
          row("Chuẩn Wifi", spec.router?.standard || spec.chuanWifi),
          row("Băng tần", spec.router?.band || spec.bangTan),
          row("Tốc độ mạng", spec.router?.speed || spec.tocDo),
          row("Kết nối", spec.connectivity?.wifi || spec.ketNoi),
        ].filter(Boolean);

      case 11: // Phụ kiện khác
        return [
          row("Số cổng chia", spec.hub?.totalPorts ? `${spec.hub.totalPorts} cổng` : spec.congKetNoi),
          row("Tốc độ quạt", spec.cooling?.fanSpeed),
          row("Công suất", spec.power?.maxWatt ? `${spec.power.maxWatt}W` : spec.congSuat),
          row("Chất liệu", spec.design?.material || spec.chatLieu),
        ].filter(Boolean);

      default:
        if (item.thongSo) {
          return Object.entries(item.thongSo)
            .filter(([, v]) => v && typeof v !== 'object')
            .map(([k, v]) => ({ label: k, value: String(v) }));
        }
        return [];
    }
  };

  //THÊM VÀO GIỎ HÀNG
  const handleAddToCart = e => {
    e.stopPropagation();
    const savedCart = localStorage.getItem("cart");
    let cartItems = savedCart ? JSON.parse(savedCart) : [];
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        ...product,
        quantity: 1,
      });
    }

    // 3. Lưu lại vào kho
    localStorage.setItem("cart", JSON.stringify(cartItems));
    setTimeout(() => {
      window.dispatchEvent(new Event("cartUpdated"));
    }, 0);
  };

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="detail-card">
        <div className="detail-image">
        <img
    src={imageMap[product?.imageKey] || "https://dummyimage.com/500x500/f8fafc/475569&text=Chưa+có+ảnh"}
    alt={product?.name || "Sản phẩm"}
  />
        </div>

        <div className="detail-info">
          {/* Tên sản phẩm */}
          <h2>{product.name}</h2>

          {/* Thông số kỹ thuật dạng bảng 2 cột */}
          <div className="product-specs-table">
            <div className="specs-header">Thông số kỹ thuật</div>
            {getQuickSpecs(product)?.map((spec, index) => (
              <div key={index} className="specs-row">
                <span className="specs-label">{spec.label}</span>
                <span className="specs-value">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Giá chi tiết (có giá gốc + discount) */}
          <p className="detail-price">
            <span className="current-price">{product.currentPrice ? product.currentPrice.toLocaleString("vi-VN") + " ₫" : "Đang cập nhật"}</span>
            {product.originalPrice && <span className="original-price">{product.originalPrice.toLocaleString("vi-VN")}&#8363;</span>}
            {product.discount && <span className="discount">{product.discount}</span>}
          </p>

          {/* Đánh giá & lượt bán */}
          <div className="detail-meta">
            {product.rating && <span>{product.rating}</span>}
            {product.sold && <span>Đã bán {product.sold}</span>}
          </div>

          {/* Hành động: thêm giỏ hàng + mua ngay */}
          <div className="product-actions">
            {/* Thêm vào giỏ hàng */}
            <button className="add-to-cart-btn" onClick={handleAddToCart} title="Thêm vào giỏ hàng">
              <i className="bi bi-cart-plus"></i>
            </button>

            {/* Mua ngay */}
            <button
              className="buy-now-button"
              onClick={() => {
                const savedCart = localStorage.getItem("cart");
                const cart = savedCart ? JSON.parse(savedCart) : [];
                const existingItemIndex = cart.findIndex(item => item.id === product.id);
                if (existingItemIndex >= 0) {
                  navigate("/cart");
                } else {
                  cart.push({ ...product, quantity: 1 });
                  localStorage.setItem("cart", JSON.stringify(cart));
                  window.dispatchEvent(new Event("cartUpdated"));
                  navigate("/cart");
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
