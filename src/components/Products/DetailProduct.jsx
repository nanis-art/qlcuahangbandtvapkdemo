import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { imageMap } from "../../utils/productImages";
import "./DetailProduct.css";

const DetailProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Quý khách");

  useEffect(() => {
    
    setError(null);

    if (location.state?.product && String(location.state.product.id) === String(id)) {
      const found = location.state.product;
      setProduct({ ...found, image: imageMap[found.imageKey] || found.image });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setProduct(null);
    const fetchProduct = async () => {
      try {
        const response = await fetch("/products.json");
        if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm");
        const data = await response.json();
        const found = data.find(item => String(item.id) === String(id));
        if (!found) throw new Error("Sản phẩm không tồn tại");
        setProduct({ ...found, image: imageMap[found.imageKey] || found.image });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, location.state]); 

  useEffect(() => {
    if (!product) return;
    const spec = product.specifications;
    const colors = spec?.design?.colors || [];
    const ram = spec?.memory?.ram;
    const rom = spec?.memory?.rom;
    if (colors.length > 0) setSelectedColor(colors[0]);
    if (ram || rom) setSelectedMemory(`${ram || ""}${rom ? `/${rom}` : ""}`);
  }, [product]);

  const checkAuth = () => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setIsLoggedIn(true);
      try {
        const parsed = JSON.parse(savedUser);
        setUserName(parsed.name || parsed.user || "Admin");
      } catch {
        setUserName(savedUser);
      }
    } else {
      setIsLoggedIn(false);
      setUserName("Quý khách");
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("userUpdated", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("userUpdated", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  if (isLoading)
    return (
      <div className="detail-loading">
        <div className="loading-spinner" />
        <span>Đang tải sản phẩm...</span>
      </div>
    );
  if (error) return <div className="detail-error">{error}</div>;
  if (!product) return null;

  const spec = product.specifications || {};
  const colors = spec.design?.colors || [];

  const memoryOptions = [];
  if (spec.memory?.ram || spec.memory?.rom) {
    memoryOptions.push(`${spec.memory.ram || ""}${spec.memory.rom ? `/${spec.memory.rom}` : ""}`);
  }
  if (spec.storage?.capacity) {
    memoryOptions.push(spec.storage.capacity);
  }

  const discountPercent = product.originalPrice && product.currentPrice ? Math.round((1 - product.currentPrice / product.originalPrice) * 100) : null;

  const getAllSpecs = () => {
    if (!spec) return [];
    const rows = [];

    const addGroup = (label, lines) => {
      const validLines = lines.filter(line => line !== null && line !== undefined && String(line).trim() !== "");
      if (validLines.length > 0) {
        rows.push({
          label,
          value: (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", lineHeight: "1.5" }}>
              {validLines.map((text, idx) => (
                <div key={idx}>{text}</div>
              ))}
            </div>
          )
        });
      }
    };

    if (spec.display) {
      addGroup("Màn hình", [
        [spec.display.type, spec.display.refreshRate, spec.display.brightness ? `Độ sáng ${spec.display.brightness}` : null].filter(Boolean).join(", "),
        [spec.display.size, spec.display.resolution].filter(Boolean).join(" - "),
        spec.display.alwaysOn !== undefined ? (spec.display.alwaysOn ? "Hỗ trợ Always On Display" : "Không hỗ trợ Always On Display") : null
      ]);
    }

    if (spec.software || spec.security) {
      addGroup("Hệ điều hành", [
        spec.software ? [spec.software.os, spec.software.version].filter(Boolean).join(" ") : null,
        spec.security?.fingerprint ? `Cảm biến vân tay: ${spec.security.fingerprint}` : null,
        spec.security?.face ? `Nhận diện khuôn mặt: ${spec.security.face}` : null
      ]);
    }

    if (spec.camera && (spec.camera.main || spec.camera.ultrawide || spec.camera.telephoto || spec.camera.macro || spec.camera.resolution)) {
      const camLines = [];
      if (spec.camera.resolution) camLines.push(`Độ phân giải: ${spec.camera.resolution}`);
      if (spec.camera.main) camLines.push(`${spec.camera.main} (Góc rộng, OIS)`);
      if (spec.camera.ultrawide) camLines.push(`${spec.camera.ultrawide} (Góc siêu rộng)`);
      if (spec.camera.telephoto) camLines.push(`${spec.camera.telephoto} (Telephoto)`);
      if (spec.camera.macro) camLines.push(`${spec.camera.macro} (Macro)`);
      addGroup("Camera sau", camLines);
    }

    if (spec.camera?.front) {
      addGroup("Camera trước", [`Độ phân giải: ${spec.camera.front}`]);
    }

    if (spec.processor) {
      addGroup("CPU / Cấu hình", [
        spec.processor.chipset,
        spec.processor.cpu ? `Số nhân: ${spec.processor.cpu}` : null,
        spec.processor.gpu ? `Đồ họa (GPU): ${spec.processor.gpu}` : null
      ]);
    }

    if (spec.memory?.ram) {
      addGroup("RAM", [[spec.memory.ram, spec.memory.type ? `Loại RAM: ${spec.memory.type}` : null].filter(Boolean).join(", ")]);
    }

    if (spec.memory?.rom || spec.storage?.capacity) {
      addGroup("Bộ nhớ trong", [
        [spec.memory?.rom || spec.storage?.capacity, spec.storage?.standard ? `Chuẩn tốc độ: ${spec.storage.standard}` : null].filter(Boolean).join(", "),
        spec.storage?.interface ? `Giao tiếp: ${spec.storage.interface}` : null
      ]);
    }

    if (spec.battery || spec.power || spec.powerBank || spec.cable) {
      const pLines = [];
      const dungLuong = spec.battery?.capacity || spec.powerBank?.capacity;
      if (dungLuong) pLines.push(`Dung lượng: ${dungLuong}`);

      const congSuat = spec.battery?.charging || (spec.power?.maxWatt ? `${spec.power.maxWatt}W` : null);
      if (congSuat) pLines.push(`Sạc nhanh công suất: ${congSuat}`);
      if (spec.battery?.wireless) pLines.push(`Sạc không dây: ${spec.battery.wireless}`);
      if (spec.battery?.total || spec.battery?.batteryLife) pLines.push(`Thời lượng pin: ${spec.battery.total || spec.battery.batteryLife}`);
      if (spec.battery?.earphone || spec.battery?.case) pLines.push(`Tai nghe: ${spec.battery.earphone} / Hộp sạc: ${spec.battery.case}`);

      if (spec.power?.input || spec.power?.output || spec.powerBank?.input || spec.powerBank?.output) {
        pLines.push(`Đầu vào (Input): ${spec.power?.input || spec.powerBank?.input || "--"}`);
        pLines.push(`Đầu ra (Output): ${spec.power?.output || spec.powerBank?.output || "--"}`);
      }
      if (spec.cable) pLines.push(`Cáp đi kèm: Dài ${spec.cable.length || "--"}, Loại ${spec.cable.type || "--"}`);
      addGroup("Dung lượng pin", pLines);
    }

    if (spec.design || spec.protection) {
      const dLines = [];
      if (spec.design?.material) dLines.push(`Chất liệu: ${spec.design.material}`);
      if (spec.design?.dimensions || spec.design?.weight) dLines.push(`Kích thước: ${spec.design.dimensions || "--"} / Trọng lượng: ${spec.design.weight || "--"}`);
      if (spec.design?.waterResistance || spec.protection?.standard) dLines.push(`Kháng nước, bụi: ${spec.design?.waterResistance || spec.protection?.standard}`);
      if (spec.design?.colors) dLines.push(`Màu sắc có sẵn: ${Array.isArray(spec.design.colors) ? spec.design.colors.join(", ") : spec.design.colors}`);
      if (spec.design?.caseSize) dLines.push(`Mặt đồng hồ: ${spec.design.caseSize}`);
      if (spec.protection?.dropResistance || spec.protection?.thickness || spec.protection?.hardness) {
        dLines.push(`Độ bảo vệ: Kính cường lực cứng ${spec.protection.hardness || "--"}, Dày ${spec.protection.thickness || "--"}`);
      }
      addGroup("Thiết kế", dLines);
    }

    if (spec.connectivity || spec.router) {
      const cLines = [];
      if (spec.connectivity?.sim) cLines.push(`Thẻ SIM: ${spec.connectivity.sim}`);
      if (spec.connectivity?.["5G"] !== undefined) cLines.push(spec.connectivity["5G"] ? "Hỗ trợ mạng 5G" : "Mạng di động 4G LTE");
      if (spec.connectivity?.wifi || spec.router?.standard) cLines.push(`Chuẩn WiFi: ${spec.connectivity?.wifi || spec.router?.standard || "--"}`);
      if (spec.connectivity?.bluetooth) cLines.push(`Kết nối Bluetooth: ${spec.connectivity.bluetooth}`);
      if (spec.connectivity?.usb) cLines.push(`Cổng giao tiếp USB: ${spec.connectivity.usb}`);
      if (spec.router) {
        cLines.push(`Băng tần phát sóng: ${spec.router.band || "--"} (Tốc độ tối đa: ${spec.router.speed || "--"})`);
        if (spec.router.antennas) cLines.push(`Số lượng Ăng-ten: ${spec.router.antennas} râu`);
      }
      addGroup("Kết nối mạng", cLines);
    }

    if (spec.audio || spec.anc || spec.health || spec.hub || spec.gimbal || spec.tripod || spec.mic || spec.speed) {
      const fLines = [];
      if (spec.audio) fLines.push(`Âm thanh: Màng loa ${spec.audio.driver || "--"}, Tần số ${spec.audio.frequency || "--"}, Trở kháng ${spec.audio.impedance || "--"}`);
      if (spec.anc) fLines.push(`Khử tiếng ồn ANC: ${spec.anc.supported ? "Có" : "Không"} / Xuyên âm: ${spec.anc.transparency ? "Có" : "Không"}`);
      if (spec.health) {
        const hList = [spec.health.heartRate ? "Nhịp tim" : null, spec.health.spo2 ? "SpO2" : null, spec.health.sleep ? "Theo dõi giấc ngủ" : null, spec.health.ecg ? "ECG" : null].filter(Boolean);
        if (hList.length) fLines.push(`Theo dõi sức khỏe: ${hList.join(", ")}`);
      }
      if (spec.hub) fLines.push(`Cổng Hub: Chia ${spec.hub.totalPorts} cổng (Type-C: ${spec.hub.usbc || 0}, USB-A: ${spec.hub.usba || 0}, HDMI: ${spec.hub.hdmi || 0})`);
      if (spec.gimbal) fLines.push(`Gimbal: ${spec.gimbal.axes || "--"} trục, Tải trọng tối đa ${spec.gimbal.payload || "--"}`);
      if (spec.tripod) fLines.push(`Tripod: Cao tối đa ${spec.tripod.maxHeight || "--"}, Chịu tải ${spec.tripod.maxLoad || "--"}`);
      if (spec.mic) fLines.push(`Microphone: Hướng thu ${spec.mic.pattern || "--"}, Khoảng cách hoạt động ${spec.mic.range || "--"}`);
      if (spec.speed?.read || spec.speed?.write) fLines.push(`Tốc độ ổ cứng: Đọc ${spec.speed.read || "--"} / Ghi ${spec.speed.write || "--"}`);
      addGroup("Tính năng khác", fLines);
    }

    if (rows.length === 0 && product.thongSo) {
      Object.entries(product.thongSo).forEach(([k, v]) => {
        if (v && typeof v !== "object") rows.push({ label: k, value: String(v) });
      });
    }
    return rows;
  };

  const allSpecs = getAllSpecs();

  const handleAddToCart = e => {
    e.stopPropagation();
    const savedCart = localStorage.getItem("cart");
    let cartItems = savedCart ? JSON.parse(savedCart) : [];
    const idx = cartItems.findIndex(item => item.id === product.id);
    if (idx !== -1) cartItems[idx].quantity += 1;
    else cartItems.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cartItems));
    setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 0);
  };

  const handleBuyNow = () => {
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx < 0) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
    navigate("/cart");
  };

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="detail-top">
        
        <div className="detail-image-col">
          {discountPercent && <span className="img-discount-badge">-{discountPercent}%</span>}
          <img src={imageMap[product?.imageKey] || "https://dummyimage.com/500x500/f8fafc/475569&text=Chưa+có+ảnh"} alt={product?.name || "Sản phẩm"} />
        </div>

        <div className="detail-info-col">
          
          <div className="detail-price-row">
  <h1 className="detail-product-name">{product.name}</h1>
            <span className="detail-stock-badge">
              <i className="bi bi-check2-circle" /> Còn hàng
            </span>
          </div>

          <div className="detail-price-block">
              <span className="detail-current-price">{product.currentPrice ? product.currentPrice.toLocaleString("vi-VN") + " ₫" : "Đang cập nhật"}</span>
              {product.originalPrice && <span className="detail-original-price">{product.originalPrice.toLocaleString("vi-VN")}₫</span>}
            </div>

          {(product.rating || product.sold) && (
            <div className="detail-meta-row">
              {product.rating && (
                <span className="detail-rating">
                  <i className="bi bi-star-fill" /> {product.rating}
                </span>
              )}
              {product.sold && <span className="detail-sold">Đã bán: {product.sold}</span>}
            </div>
          )}

          {(colors.length > 0 || memoryOptions.length > 0) && (
            <>
              <p className="detail-variant-label">Chọn phiên bản để xem giá:</p>

              {colors.length > 0 && (
                <div className="detail-variant-row">
                  <span className="variant-key">Màu sắc</span>
                  <div className="variant-chips">
                    {colors.map((color, i) => (
                      <button key={i} className={`variant-chip ${selectedColor === color ? "active" : ""}`} onClick={() => setSelectedColor(color)}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {memoryOptions.length > 0 && (
                <div className="detail-variant-row">
                  <span className="variant-key">Bộ nhớ</span>
                  <div className="variant-chips">
                    {memoryOptions.map((mem, i) => (
                      <button key={i} className={`variant-chip ${selectedMemory === mem ? "active" : ""}`} onClick={() => setSelectedMemory(mem)}>
                        {mem}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="detail-divider" />

          <div className="detail-policy-list">
            <div className="policy-item">
              <i className="bi bi-shield-check" />
              Thời gian bảo hành: <strong>BH Thường 12 Tháng Chính Hãng</strong>
            </div>
            <div className="policy-item">
              <i className="bi bi-truck" />
              Giao hàng tận nơi miễn phí trong 30 phút
            </div>
          </div>

          <div className="detail-promo-box">
            <div className="promo-title">Khuyến mãi</div>
            <ul className="promo-list">
              {isLoggedIn ? (
                <li>
                  Xin chào <strong>{userName}</strong>! Bạn có thể kiểm tra trạng thái đơn hàng trong trang cá nhân.
                </li>
              ) : (
                <li>
                  Quý khách{" "}
                  <Link to="/login" style={{ color: "inherit", textDecoration: "underline" }}>
                    <strong>Đăng nhập</strong>
                  </Link>{" "}
                  để kiểm tra đơn hàng
                </li>
              )}
              <li>Chat online hỗ trợ 24/7</li>
              <li>Đổi trả miễn phí trong 30 ngày</li>
              {(product?.categoryid === 1 || product?.categoryid === 2 || product?.idcategory === 1 || product?.idcategory === 2) && (
                <li>Tặng thêm 1 ốp lưng từ nhà sản xuất</li>
              )}
            </ul>
          </div>

          <div className="detail-actions">
            <button className="btn-add-cart" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus" />
              Thêm vào giỏ
            </button>
            <button className="btn-buy-now" onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {allSpecs.length > 0 && (
        <div className="detail-full-specs">
          <div className="full-specs-title">Thông số kỹ thuật</div>
          <div className="full-specs-table">
            {allSpecs.map((row, i) => (
              <div key={i} className={`full-specs-row ${i % 2 === 0 ? "even" : "odd"}`}>
                <span className="full-specs-label">{row.label}</span>
                <span className="full-specs-value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProduct;