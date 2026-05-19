import React from "react";
import { useNavigate } from "react-router-dom";
import { useProductCompare } from "../../utils/useProductCompare";
import "./ProductCompare.css";

function fmtCurrency(n) {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ`;
}

const ProductCompare = () => {
  const navigate = useNavigate();
  const {
    selectedIds,
    selectedProducts,
    specStructure,
    loading,
    error,
    handleRemoveProduct,
    handleClearAll
  } = useProductCompare();

  if (loading) return (
    <div className="compare-status">
      <i className="bi bi-arrow-repeat compare-spin" />
      Đang tải dữ liệu so sánh...
    </div>
  );

  if (error) return (
    <div className="compare-status compare-status--error">
      <i className="bi bi-exclamation-triangle-fill" />
      Lỗi: {error}
    </div>
  );

  return (
    <div className="compare-page">

      {/* HEADER */}
      <div className="compare-header">
        <h1 className="compare-title">
          <i className="bi bi-bar-chart-line" />
          So sánh sản phẩm
        </h1>
        <div className="compare-header-actions">
          <button
            type="button"
            className="compare-btn compare-btn--back"
            onClick={() => navigate("/favorites")}
          >
            <i className="bi bi-heart" />
            Quay lại Yêu thích
          </button>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className="compare-btn compare-btn--danger"
              onClick={handleClearAll}
            >
              <i className="bi bi-trash3" />
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {selectedProducts.length === 0 ? (
        <div className="compare-empty">
          <i className="bi bi-inbox compare-empty__icon" />
          <p>Chưa có sản phẩm nào được chọn.</p>
          <p className="compare-empty__sub">Hãy quay lại trang Yêu thích để chọn thiết bị lên thớt so hàng nha ní!</p>
          <button
            type="button"
            className="compare-btn compare-btn--back"
            onClick={() => navigate("/favorites")}
          >
            <i className="bi bi-heart" />
            Đến trang Yêu thích
          </button>
        </div>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-th compare-th--label">Thông tin chính</th>
                {selectedProducts.map(p => (
                  <th key={p.id} className="compare-th compare-th--product">
                    <button
                      type="button"
                      className="compare-remove-btn"
                      onClick={() => handleRemoveProduct(p.id)}
                      title="Xóa sản phẩm"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                    <div className="compare-product-name">{p.name}</div>
                    <div className="compare-product-meta">
                      <i className="bi bi-upc-scan" /> {p.id} &nbsp;|&nbsp;
                      <i className="bi bi-building" /> {p.brandid}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* GIÁ */}
              <tr>
                <td className="compare-td compare-td--label">
                  <i className="bi bi-tag" /> Giá bán hiện tại
                </td>
                {selectedProducts.map(p => (
                  <td key={p.id} className="compare-td compare-td--price">
                    {p.currentPrice ? fmtCurrency(p.currentPrice) : "Liên hệ"}
                  </td>
                ))}
              </tr>

              {/* SERIES */}
              <tr>
                <td className="compare-td compare-td--label">
                  <i className="bi bi-layers" /> Dòng sản phẩm
                </td>
                {selectedProducts.map(p => (
                  <td key={p.id} className="compare-td">{p.series || "—"}</td>
                ))}
              </tr>

              {/* RATING */}
              <tr>
                <td className="compare-td compare-td--label">
                  <i className="bi bi-star" /> Đánh giá / Đã bán
                </td>
                {selectedProducts.map(p => (
                  <td key={p.id} className="compare-td compare-td--rating">
                    <i className="bi bi-star-fill compare-star" /> {p.rating || "0"}
                    &nbsp;&nbsp;
                    <i className="bi bi-bag-check" /> {p.sold || "0"}
                  </td>
                ))}
              </tr>

              {/* SPECS SECTIONS */}
              {Object.keys(specStructure).map(sectionKey => (
                <React.Fragment key={sectionKey}>
                  <tr>
                    <td
                      colSpan={selectedProducts.length + 1}
                      className="compare-section-header"
                    >
                      <i className="bi bi-chevron-right" /> {sectionKey}
                    </td>
                  </tr>
                  {[...specStructure[sectionKey]].map((fieldKey, idx) => (
                    <tr key={fieldKey} className={idx % 2 === 0 ? "compare-row-even" : "compare-row-odd"}>
                      <td className="compare-td compare-td--label">
                        {fieldKey}
                      </td>
                      {selectedProducts.map(p => {
                        const val = p.specifications?.[sectionKey]?.[fieldKey];
                        let renderedVal = "—";
                        if (typeof val === "boolean") {
                          renderedVal = val
                            ? <span className="compare-bool compare-bool--yes"><i className="bi bi-check-circle-fill" /> Có</span>
                            : <span className="compare-bool compare-bool--no"><i className="bi bi-x-circle-fill" /> Không</span>;
                        } else if (Array.isArray(val)) {
                          renderedVal = val.length ? val.join(", ") : "—";
                        } else if (val != null && val !== "") {
                          renderedVal = String(val);
                        }
                        return (
                          <td key={p.id} className="compare-td">
                            {renderedVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductCompare;