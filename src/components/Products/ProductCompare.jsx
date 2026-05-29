import React from "react";
import { useNavigate } from "react-router-dom";
import { useProductCompare } from "../../utils/useProductCompare";
import "./ProductCompare.css";
import { imageMap } from "../../utils/productImages";

const SECTION_MAP = {
  display: { label: "Màn hình hiển thị", icon: "bi-phone-landscape" },
  processor: { label: "Hiệu năng & CPU", icon: "bi-cpu-fill" },
  memory: { label: "Bộ nhớ & Lưu trữ", icon: "bi-memory" },
  camera: { label: "Hệ thống Camera", icon: "bi-camera-fill" },
  battery: { label: "Pin & Công nghệ sạc", icon: "bi-battery-charging" },
  connectivity: { label: "Kết nối mạng", icon: "bi-wifi" },
  design: { label: "Thiết kế tổng thể", icon: "bi-rulers" },
  software: { label: "Phần mềm", icon: "bi-android2" },
  security: { label: "Bảo mật", icon: "bi-shield-lock-fill" },
  audio: { label: "Âm thanh", icon: "bi-volume-up-fill" },
};

const FIELD_VI = {
  size: "Kích thước màn",
  type: "Tấm nền / Loại",
  refreshRate: "Tần số quét",
  resolution: "Độ phân giải",
  brightness: "Độ sáng tối đa",
  chipset: "Chipset (SoC)",
  cpu: "Nhân CPU",
  gpu: "Chip đồ họa (GPU)",
  ram: "Dung lượng RAM",
  rom: "Bộ nhớ trong",
  main: "Camera chính",
  ultrawide: "Camera góc siêu rộng",
  telephoto: "Camera Zoom (Tele)",
  macro: "Camera Cận cảnh",
  front: "Camera Selfie",
  capacity: "Dung lượng pin",
  charging: "Sạc nhanh",
  wireless: "Sạc không dây",
  "5G": "Hỗ trợ 5G",
  wifi: "Công nghệ Wi-Fi",
  bluetooth: "Chuẩn Bluetooth",
  nfc: "NFC",
  weight: "Trọng lượng",
  dimensions: "Kích thước (Dày)",
  material: "Chất liệu",
  waterResistance: "Kháng nước/bụi",
  colors: "Màu sắc",
  os: "Hệ điều hành / Phiên bản",
};

const vi = key => FIELD_VI[key] || key.charAt(0).toUpperCase() + key.slice(1);

function fmtCurrency(n) {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ`;
}

const ProductCompare = () => {
  const navigate = useNavigate();
  const { selectedIds, selectedProducts, specStructure, loading, error, handleRemoveProduct, handleClearAll } = useProductCompare();

  if (loading)
    return (
      <div className="compare-status">
        <i className="bi bi-arrow-repeat compare-spin" />
        Đang tải dữ liệu so sánh...
      </div>
    );

  if (error)
    return (
      <div className="compare-status compare-status--error">
        <i className="bi bi-exclamation-triangle-fill" />
        Lỗi: {error}
      </div>
    );

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1 className="compare-title">
          <i className="bi bi-bar-chart-line" /> Bảng So Sánh Kỹ Thuật
        </h1>
        <div className="compare-header-actions">
          <button type="button" className="compare-btn compare-btn--back" onClick={() => navigate("/favorites")}>
            <i className="bi bi-heart" /> Quay lại Yêu thích
          </button>
          {selectedIds.length > 0 && (
            <button type="button" className="compare-btn compare-btn--danger" onClick={handleClearAll}>
              <i className="bi bi-trash3" /> Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {selectedProducts.length === 0 && (
        <div className="compare-empty">
          <i className="bi bi-clipboard2-x compare-empty__icon" />
          <p className="compare-empty__title">Chưa có sản phẩm nào để so sánh</p>
          <p className="compare-empty__sub">Vào trang Yêu thích, chọn tối đa 4 sản phẩm cùng danh mục rồi nhấn "So sánh" nhé!</p>
          <button type="button" className="compare-btn compare-btn--back" onClick={() => navigate("/favorites")}>
            <i className="bi bi-heart" /> Đến trang Yêu thích
          </button>
        </div>
      )}

      {selectedProducts.length === 1 && (
        <div className="compare-warning">
          <i className="bi bi-exclamation-circle-fill" />
          Bạn mới chọn <strong>1 sản phẩm</strong> cần thêm thiết bị cùng danh mục!
        </div>
      )}

      {selectedProducts.length >= 2 && (
        <div className="compare-table-wrap">
          <div className="compare-table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-th compare-th--label">Tiêu chí</th>
                  {selectedProducts.map(p => (
                    <th key={p.id} className="compare-th compare-th--product">
                      <button type="button" className="compare-remove-btn" onClick={() => handleRemoveProduct(p.id)}>
                        <i className="bi bi-x-lg" />
                      </button>
                      <div className="compare-product-name  compare-td--center">{p.name}</div>
                      <div className="compare-product-meta">
                        <i className="bi bi-upc-scan" /> {p.id} &nbsp;|&nbsp; <i className="bi bi-building" /> {p.brandid}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="compare-td compare-td--label"><i className="bi bi-image-fill"></i> Hình ảnh sản phẩm</th>
                  {selectedProducts.map(p => (
                    <th key={`img-${p.id}`} className="compare-td " style={{ textAlign: "center", paddingBottom: "16px" }}>
                      <img 
                        src={imageMap[p.imageKey] || p.image} 
                        alt={p.name} 
                        className="compare-product-img"/>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="compare-td compare-td--label">
                    <i className="bi bi-tag" /> Giá bán hiện tại
                  </td>
                  {selectedProducts.map(p => (
                    <td key={p.id} className="compare-td compare-td--price compare-td--center">
                      {p.currentPrice ? fmtCurrency(p.currentPrice) : "Liên hệ"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-td compare-td--label ">
                    <i className="bi bi-star" /> Đánh giá / Đã bán
                  </td>
                  {selectedProducts.map(p => (
                    <td key={p.id} className="compare-td compare-td--center">
                      <i className="bi bi-star-fill compare-star" /> {p.rating || "0"}
                      &nbsp;&nbsp;
                      <i className="bi bi-bag-check" /> Bán: {p.sold || "0"}
                    </td>
                  ))}
                </tr>
                {Object.keys(specStructure).map(sectionKey => {
                  const secMap = SECTION_MAP[sectionKey] || { label: sectionKey, icon: "bi-gear-fill" };
                  return (
                    <React.Fragment key={sectionKey}>
                      <tr>
                        <td colSpan={selectedProducts.length + 1} className="compare-section-header">
                          <i className={`bi ${secMap.icon}`} style={{ marginRight: "6px" }} /> {secMap.label}
                        </td>
                      </tr>
                      {[...specStructure[sectionKey]].map((fieldKey, idx) => {
                        const rawVals = selectedProducts.map(p => p.specifications?.[sectionKey]?.[fieldKey]);

                        return (
                          <tr key={fieldKey} className={idx % 2 === 0 ? "compare-row-even" : "compare-row-odd"}>
                            <td className="compare-td compare-td--label">{vi(fieldKey)}</td>
                            {selectedProducts.map((p, i) => {
                              const raw = rawVals[i];
                              let display = "—";
                              if (typeof raw === "boolean") {
                                display = raw ? (
                                  <span className="compare-bool compare-bool--yes ">
                                    <i className="bi bi-check-circle-fill" /> Có
                                  </span>
                                ) : (
                                  <span className="compare-bool compare-bool--no">
                                    <i className="bi bi-x-circle-fill" /> Không
                                  </span>
                                );
                              } else if (Array.isArray(raw)) {
                                display = raw.length ? raw.join(", ") : "—";
                              } else if (raw != null && raw !== "") {
                                display = String(raw);
                              }

                              return (
                                <td key={p.id} className="compare-td  compare-td--center">
                                  {display}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCompare;