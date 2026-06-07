import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const jsonBase = import.meta.env.BASE_URL || "/";

const emptyForm = () => ({
  id: "",
  idbill: "",
  idproducts: "",
  quantity: "",
  unit_price: "",
  price: "",
});

function rowToForm(r) {
  const idVal = r.id ?? r.idinvoicedetails ?? "";
  const bid = r.idbill ?? "";
  const pid = r.idproducts ?? r.SanPham_id ?? "";
  return {
    id: String(idVal),
    idbill: bid !== "" ? String(bid) : "",
    idproducts: pid !== "" ? String(pid) : "",
    quantity: r.quantity != null ? String(r.quantity) : "",
    unit_price: r.unit_price != null ? String(r.unit_price) : "",
    price: r.price != null ? String(r.price) : "",
  };
}

function formToRow(form, nextId) {
  const idNum = form.id ? Number(form.id) : nextId;
  const bid = Number(form.idbill);
  const pid = Number(form.idproducts);
  return {
    id: idNum,
    idinvoicedetails: idNum,
    idbill: bid,
    idproducts: pid,
    quantity: Number(form.quantity),
    unit_price: Number(form.unit_price),
    price: Number(form.price),
  };
}

function validateNums(built) {
  const keys = ["idbill", "idproducts", "quantity", "unit_price", "price"];
  for (const k of keys) {
    if (!Number.isFinite(built[k])) {
      return `Trường ${k} phải là số hợp lệ`;
    }
  }
  return null;
}

function AdminInvoiceDetails({ embedded = false, filterBillId = null, clearFilter = null }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(embedded);
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [searchIdInput, setSearchIdInput] = useState("");
  const [appliedSearchId, setAppliedSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const displayedRows = useMemo(() => {
    const q = appliedSearchId.trim();
    if (q) return rows.filter(r => String(r.id ?? r.idinvoicedetails) === q);
    if (filterBillId) {
      return rows.filter(r => Number(r.idbill) === Number(filterBillId));
    }
    return rows;
  }, [rows, appliedSearchId, filterBillId]);

  const totalPages = useMemo(() => {
    return Math.ceil(displayedRows.length / itemsPerPage) || 1;
  }, [displayedRows]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedRows.slice(start, start + itemsPerPage);
  }, [displayedRows, currentPage]);

  const productMap = useMemo(() => {
    return new Map(products.map(p => [Number(p.id), p.name]));
  }, [products]);

  const persist = useCallback(async nextList => {
    setSaving(true);
    setSaveError("");
    try {
      await axios.put("/api/invoicedetails", nextList, {
        headers: { "Content-Type": "application/json" },
      });
      setRows(nextList);
      setView("list");
      setForm(emptyForm());
      setIsNew(false);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === "ERR_NETWORK" || err.response?.status === 404 ? "Chỉ lưu được khi chạy npm run dev hoặc npm run preview (API Vite)." : null) ||
        "Không lưu được dữ liệu.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchId, filterBillId]);

  useEffect(() => {
    if (embedded) {
      setAllowed(true);
      return;
    }
    const raw = localStorage.getItem("currentUser");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "staff") {
        navigate("/");
        return;
      }
      setAllowed(true);
    } catch {
      navigate("/login");
    }
  }, [navigate, embedded]);

  useEffect(() => {
    if (!allowed) return;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [idRes, pRes] = await Promise.all([fetch(`${jsonBase}invoicedetails.json`), fetch(`${jsonBase}products.json`)]);
        if (!idRes.ok) throw new Error("Không tải được invoicedetails.json");
        const idData = await idRes.json();
        setRows(Array.isArray(idData) ? idData : []);

        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(Array.isArray(pData) ? pData : []);
        }
      } catch (e) {
        setLoadError(e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [allowed]);

  const goHome = () => navigate("/");
  const logout = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  const openCreate = () => {
    setIsNew(true);
    setForm(emptyForm());
    setView("form");
    setSaveError("");
  };

  const openEdit = r => {
    setIsNew(false);
    setForm(rowToForm(r));
    setView("form");
    setSaveError("");
  };

  const cancelForm = () => {
    setView("list");
    setForm(emptyForm());
    setIsNew(false);
    setSaveError("");
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmitForm = e => {
    e.preventDefault();
    const nextId = rows.reduce((m, r) => Math.max(m, Number(r.id ?? r.idinvoicedetails) || 0), 0) + 1;
    const built = formToRow(form, nextId);
    const invalid = validateNums(built);
    if (invalid) {
      setSaveError(invalid);
      return;
    }
    let nextList;
    if (isNew) {
      nextList = [...rows, built];
    } else {
      const idx = rows.findIndex(r => String(r.id ?? r.idinvoicedetails) === String(form.id));
      if (idx === -1) {
        setSaveError("Không tìm thấy bản ghi để cập nhật");
        return;
      }
      nextList = rows.map(r => (String(r.id ?? r.idinvoicedetails) === String(form.id) ? built : r));
    }
    persist(nextList);
  };

  const handleDelete = id => {
    if (!window.confirm("Xóa dòng chi tiết này?")) return;
    persist(rows.filter(r => String(r.id ?? r.idinvoicedetails) !== String(id)));
  };

  const applyIdSearch = () => setAppliedSearchId(searchIdInput.trim());
  const clearIdSearch = () => {
    setSearchIdInput("");
    setAppliedSearchId("");
  };

  const bodyContent = (
    <>
      {loadError && <div className="admin-msg admin-msg--error">{loadError}</div>}
      {saveError && <div className="admin-msg admin-msg--error">{saveError}</div>}
      <div className="admin-row">
        {loading ? (
          <p>Đang tải...</p>
        ) : view === "list" ? (
          <>
            <div className="admin-toolbar admin-toolbar--row">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="admin-btn" onClick={openCreate} disabled={saving}>
                  + Thêm dòng
                </button>
                {filterBillId && !appliedSearchId.trim() && clearFilter && (
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={clearFilter} disabled={saving}>
                    Bỏ lọc HĐ {filterBillId}
                  </button>
                )}
              </div>
              <div className="admin-toolbar-search">
                <label htmlFor="admin-invoicedetails-search-id">Tìm kiếm: </label>
                <input
                  id="admin-invoicedetails-search-id"
                  type="text"
                  inputMode="numeric"
                  value={searchIdInput}
                  onChange={e => setSearchIdInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyIdSearch();
                    }
                  }}
                />
                <button type="button" className="admin-btn" onClick={applyIdSearch} disabled={saving}>
                  Tìm
                </button>
                {appliedSearchId.trim() !== "" && (
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={clearIdSearch} disabled={saving}>
                    Hiện tất cả
                  </button>
                )}
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Bill</th>
                    <th>SP (Sản phẩm)</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table_empty">
                        {appliedSearchId.trim() ? `Không có dòng chi tiết với ID "${appliedSearchId.trim()}".` : "Chưa có dòng chi tiết."}
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map(r => {
                      const bid = r.idbill ?? "-";
                      const pid = Number(r.idproducts ?? r.SanPham_id);
                      const pName = productMap.get(pid) || "Chưa rõ";
                      return (
                        <tr key={r.id ?? r.idinvoicedetails}>
                          <td>{r.id ?? r.idinvoicedetails}</td>
                          <td>{bid}</td>
                          <td>{pid ? `${pid} - ${pName}` : "-"}</td>
                          <td>{r.quantity}</td>
                          <td>{r.unit_price}</td>
                          <td>{r.price}</td>
                          <td>
                            <div className="admin-table_actions">
                              <button type="button" className="admin-table_link" onClick={() => openEdit(r)} disabled={saving}>
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="admin-table_link admin-table_link--danger"
                                onClick={() => handleDelete(r.id ?? r.idinvoicedetails)}
                                disabled={saving}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || saving}>
                  Trước
                </button>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#475569" }}>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || saving}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <form className="admin-form-card admin-form-card--wide" onSubmit={handleSubmitForm}>
            <h2>{isNew ? "Thêm chi tiết hóa đơn" : "Sửa chi tiết hóa đơn"}</h2>
            <div className="admin-form-grid">
              {!isNew && (
                <label>
                  ID
                  <input value={form.id} readOnly />
                </label>
              )}
              <label>
                Mã hóa đơn (idbill)
                <input type="number" value={form.idbill} onChange={e => handleFormChange("idbill", e.target.value)} required />
              </label>
              <label>
                Mã sản phẩm (idproducts)
                <input type="number" value={form.idproducts} onChange={e => handleFormChange("idproducts", e.target.value)} required />
              </label>
              <label>
                Số lượng
                <input type="number" min="1" value={form.quantity} onChange={e => handleFormChange("quantity", e.target.value)} required />
              </label>
              <label>
                Đơn giá
                <input type="number" min="0" value={form.unit_price} onChange={e => handleFormChange("unit_price", e.target.value)} required />
              </label>
              <label>
                Thành tiền (price)
                <input type="number" min="0" value={form.price} onChange={e => handleFormChange("price", e.target.value)} required />
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={cancelForm} disabled={saving}>
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );

  if (embedded) return <div className="admin-product-embed">{bodyContent}</div>;
  if (!allowed) return <div className="admin-page" />;

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <h1 className="admin-topbar_title">Quản trị chi tiết hóa đơn</h1>
        <div className="admin-topbar_actions">
          <button type="button" className="admin-topbar_btn" onClick={goHome}>
            Trang chủ
          </button>
          <button type="button" className="admin-topbar_btn admin-topbar_btn--primary" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="admin-body">{bodyContent}</div>
    </div>
  );
}

export default AdminInvoiceDetails;
