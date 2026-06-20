import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const jsonBase = import.meta.env.BASE_URL || "/";

const templates = {
  1: {
    display: { size: "", type: "", refreshRate: "", resolution: "", brightness: "" },
    processor: { chipset: "", cpu: "", gpu: "" },
    memory: { ram: "", rom: "", type: "" },
    camera: { main: "", ultrawide: "", telephoto: "", macro: "", front: "" },
    battery: { capacity: "", charging: "", wireless: "" },
    connectivity: { "5G": true, wifi: "", bluetooth: "", nfc: true },
    design: { weight: "", dimensions: "", material: "", waterResistance: "", colors: [] },
    software: { os: "", version: "" },
    security: { fingerprint: "", face: "" },
  },
  2: {
    display: { size: "", type: "", refreshRate: "", resolution: "", brightness: "" },
    processor: { chipset: "", cpu: "", gpu: "" },
    memory: { ram: "", rom: "", type: "" },
    camera: { main: "", front: "" },
    battery: { capacity: "", charging: "" },
    connectivity: { sim: "", wifi: "", bluetooth: "", usb: "" },
    design: { weight: "", dimensions: "", material: "", colors: [] },
    software: { os: "", version: "" },
    features: { stylus: false, keyboard: false, faceUnlock: false },
  },
  3: {
    display: { size: "", type: "", resolution: "", alwaysOn: false },
    battery: { capacity: "", batteryLife: "", charging: "" },
    health: { heartRate: true, spo2: true, sleep: true, stress: false, ecg: false, temperature: false },
    connectivity: { bluetooth: "", gps: false, nfc: false, wifi: false },
    design: { caseSize: "", caseThickness: "", weight: "", material: "", waterResistance: "", strapMaterial: "", strapWidth: "", colors: [] },
    compatibility: { android: "", ios: "" },
  },
  4: {
    audio: { driver: "", frequency: "", impedance: "", sensitivity: "" },
    battery: { earphone: "", case: "", total: "" },
    connectivity: { type: "", bluetooth: "", codec: [], multipoint: false },
    anc: { supported: false, transparency: false },
    design: { type: "", weight: "", waterResistance: "", colors: [] },
    features: { mic: true, touchControl: false, voiceAssistant: false, wirelessCharging: false },
  },
  5: {
    power: { maxWatt: 0, input: "", output: "" },
    ports: { usbc: 0, usba: 0, total: 0 },
    standard: { fastCharge: [], pd: false, qc: false },
    cable: { length: "", type: "", maxCurrent: "", material: "" },
    powerBank: { capacity: "", input: "", output: "", passthrough: false, display: false },
    design: { weight: "", dimensions: "", colors: [] },
    compatibility: [],
  },
  6: {
    material: { type: "", finish: "" },
    protection: { dropResistance: "", standard: "", thickness: "", hardness: "" },
    design: { colors: [], transparent: false, texture: "" },
    compatibility: { model: [], wirelessCharging: true, magsafe: false },
    features: { cardSlot: false, kickstand: false, antiyellow: false, antifingerprint: false },
  },
  7: {
    type: "",
    connectivity: { type: "", bluetooth: "", usb: "", multiDevice: false },
    battery: { capacity: "", batteryLife: "", charging: "" },
    stylus: { pressure: "", tilt: false, latency: "", shortcut: false },
    keyboard: { layout: "", backlight: false, switchType: "", travel: "" },
    design: { weight: "", dimensions: "", material: "", colors: [] },
    compatibility: [],
  },
  8: {
    type: "",
    gimbal: { axes: 0, payload: "", stabilization: "", range: { pan: "", tilt: "", roll: "" } },
    tripod: { maxHeight: "", minHeight: "", maxLoad: "", sections: 0, material: "" },
    mic: { pattern: "", frequency: "", snr: "", interface: "", range: "" },
    battery: { capacity: "", batteryLife: "", charging: "" },
    connectivity: { bluetooth: "", usb: "", jack: "" },
    design: { weight: "", foldedSize: "", material: "", colors: [] },
    compatibility: [],
  },
  9: {
    type: "",
    storage: { capacity: "", interface: "", standard: "", formFactor: "" },
    speed: { read: "", write: "", usbSpeed: "" },
    endurance: { tbw: "", mtbf: "" },
    design: { weight: "", dimensions: "", material: "", waterResistance: "", colors: [] },
    compatibility: { os: [], devices: [] },
    features: { encryption: false, retractable: false, led: false },
  },
  10: {
    type: "",
    camera: { resolution: "", fov: "", nightVision: false, ai: false },
    router: { standard: "", band: "", speed: "", ports: "", antennas: 0, mu_mimo: false, beamforming: false },
    smarthome: { protocol: [], hub: false, voice: [] },
    bulb: { watt: 0, lumen: 0, colorTemp: "", rgb: false, lifespan: "" },
    connectivity: { wifi: "", bluetooth: "", zigbee: false, thread: false, ethernet: false },
    power: { input: "", consumption: "" },
    design: { colors: [], dimensions: "", waterResistance: "", mountType: "" },
    compatibility: { platform: [], app: "" },
  },
  11: {
    type: "",
    hub: { totalPorts: 0, usbc: 0, usba: 0, hdmi: 0, sd: false, ethernet: false, pd: false, pdWatt: 0 },
    cooling: { type: "", fanSpeed: "", noiseLevel: "", airflow: "", tdp: "" },
    power: { input: "", output: "", maxWatt: 0 },
    design: { weight: "", dimensions: "", material: "", rgbLighting: false, colors: [] },
    compatibility: { devices: [], os: [] },
    features: { passthrough: false, display: false, foldable: false },
  },
};

const emptyForm = () => ({
  id: "",
  name: "",
  imageKey: "",
  brandid: "",
  series: "",
  idcategory: "",
  currentPrice: "",
  originalPrice: "",
  discount: "",
  rating: "",
  sold: "",
  specifications: {},
});

function productToForm(p) {
  const catId = p.idcategory ?? p.categoryid ?? "";
  return {
    id: String(p.id ?? ""),
    name: p.name ?? "",
    imageKey: p.imageKey ?? "",
    brandid: p.brandid ?? "",
    series: p.series ?? "",
    idcategory: catId !== "" ? String(catId) : "",
    currentPrice: p.currentPrice != null ? String(p.currentPrice) : "",
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
    discount: p.discount ?? "",
    rating: p.rating ?? "",
    sold: p.sold ?? "",
    specifications: p.specifications ? JSON.parse(JSON.stringify(p.specifications)) : {},
  };
}

function formToProduct(form, nextId) {
  const id = form.id ? Number(form.id) : nextId;
  const o = {
    id,
    name: (form.name || "").trim(),
    imageKey: (form.imageKey || "").trim(),
    brandid: (form.brandid || "").trim(),
    series: (form.series || "").trim(),
    currentPrice: Number(form.currentPrice) || 0,
    originalPrice: Number(form.originalPrice) || 0,
    discount: (form.discount || "").trim(),
    rating: (form.rating || "").trim(),
    sold: (form.sold || "").trim(),
    specifications: form.specifications || {},
  };
  if (form.idcategory !== "" && form.idcategory != null) {
    o.idcategory = Number(form.idcategory);
    o.categoryid = Number(form.idcategory);
  }
  return o;
}

function AdminProduct({ embedded = false }) {
  const navigate = useNavigate();

  const [allowed, setAllowed] = useState(embedded);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const displayedProducts = useMemo(() => {
    const q = appliedSearchId.trim();
    if (!q) return products;
    return products.filter(p => String(p.id) === q);
  }, [products, appliedSearchId]);

  const totalPages = useMemo(() => {
    return Math.ceil(displayedProducts.length / itemsPerPage) || 1;
  }, [displayedProducts]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedProducts.slice(start, start + itemsPerPage);
  }, [displayedProducts, currentPage]);

  const persistProducts = useCallback(async nextList => {
    setSaving(true);
    setSaveError("");
    setProducts(nextList);
    try {
      await axios.put("/api/products", nextList, {
        headers: { "Content-Type": "application/json" },
      });
      setView("list");
      setForm(emptyForm());
      setIsNew(false);
    } catch (err) {
      console.error(err);
      setSaveError("Lỗi hệ thống ghi file.");
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchId]);

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
        const [pRes, cRes] = await Promise.all([fetch(`${jsonBase}products.json`), fetch(`${jsonBase}category.json`)]);
        if (!pRes.ok) throw new Error("Không tải được products.json");
        const pdata = await pRes.json();
        setProducts(Array.isArray(pdata) ? pdata : []);
        if (cRes.ok) {
          const cdata = await cRes.json();
          setCategories(Array.isArray(cdata) ? cdata : []);
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

  const openEdit = p => {
    setIsNew(false);
    setForm(productToForm(p));
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

  const handleCategoryChange = catId => {
    setForm(f => {
      const updated = { ...f, idcategory: catId };
      if (!f.id || Object.keys(f.specifications || {}).length === 0) {
        updated.specifications = templates[Number(catId)] ? JSON.parse(JSON.stringify(templates[Number(catId)])) : {};
      }
      return updated;
    });
  };

  const handleNestedChange = (path, value) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmitForm = e => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) {
      setSaveError("Vui lòng nhập tên sản phẩm");
      return;
    }
    let nextList;
    if (isNew) {
      const nextId = products.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
      const built = formToProduct(form, nextId);
      nextList = [...products, built];
    } else {
      nextList = products.map(p => {
        if (String(p.id) === String(form.id)) {
          const catId = form.idcategory !== "" && form.idcategory != null ? Number(form.idcategory) : p.idcategory;
          return {
            ...p,
            name: (form.name || "").trim(),
            imageKey: (form.imageKey || "").trim(),
            brandid: (form.brandid || "").trim(),
            series: (form.series || "").trim(),
            currentPrice: Number(form.currentPrice) || 0,
            originalPrice: Number(form.originalPrice) || 0,
            discount: (form.discount || "").trim(),
            rating: (form.rating || "").trim(),
            sold: (form.sold || "").trim(),
            specifications: form.specifications || {},
            idcategory: catId,
            categoryid: catId,
          };
        }
        return p;
      });
    }
    persistProducts(nextList);
  };

  const handleDelete = id => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    const nextList = products.filter(p => String(p.id) !== String(id));
    persistProducts(nextList);
  };

  const applyIdSearch = () => setAppliedSearchId(searchIdInput.trim());
  const clearIdSearch = () => {
    setSearchIdInput("");
    setAppliedSearchId("");
  };

  const renderSpecsForm = () => {
    const specs = form.specifications;
    if (!specs) return null;

    return Object.keys(specs).map(sectionKey => {
      const sectionValue = specs[sectionKey];
      if (typeof sectionValue === "object" && !Array.isArray(sectionValue) && sectionValue !== null) {
        return (
          <div key={sectionKey} className="admin-form-grid_full" style={{ marginTop: "1rem", borderTop: "1px dashed #cbd5e1", paddingTop: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "#2563eb", marginBottom: "0.75rem" }}>{sectionKey}</h3>
            <div className="admin-form-grid">
              {Object.keys(sectionValue).map(fieldKey => {
                const val = sectionValue[fieldKey];
                if (typeof val === "boolean") {
                  return (
                    <label key={fieldKey} style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e => handleNestedChange(["specifications", sectionKey, fieldKey], e.target.checked)}
                        style={{ width: "auto" }}
                      />
                      {fieldKey}
                    </label>
                  );
                }
                return (
                  <label key={fieldKey}>
                    {fieldKey}
                    <input
                      value={Array.isArray(val) ? val.join(", ") : (val ?? "")}
                      onChange={e =>
                        handleNestedChange(["specifications", sectionKey, fieldKey], Array.isArray(val) ? e.target.value.split(",").map(x => x.trim()) : e.target.value)
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>
        );
      }
      if (typeof sectionValue === "boolean") {
        return (
          <label key={sectionKey} style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={sectionValue} onChange={e => handleNestedChange(["specifications", sectionKey], e.target.checked)} style={{ width: "auto" }} />
            {sectionKey}
          </label>
        );
      }
      return (
        <label key={sectionKey}>
          {sectionKey}
          <input
            value={Array.isArray(sectionValue) ? sectionValue.join(", ") : (sectionValue ?? "")}
            onChange={e => handleNestedChange(["specifications", sectionKey], Array.isArray(sectionValue) ? e.target.value.split(",").map(x => x.trim()) : e.target.value)}
          />
        </label>
      );
    });
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
              <button type="button" className="admin-btn" onClick={openCreate} disabled={saving}>
                <i className="bi bi-plus-lg"></i> Thêm sản phẩm
              </button>
              <div className="admin-toolbar-search">
                <label htmlFor="admin-product-search-id">Tìm kiếm: </label>
                <input
                  id="admin-product-search-id"
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
                    <th>Tên</th>
                    <th>Ảnh (key)</th>
                    <th>Thương hiệu</th>
                    <th>Giá</th>
                    <th>Danh mục</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table_empty">
                        {appliedSearchId.trim() ? `Không có sản phẩm với ID "${appliedSearchId.trim()}".` : "Chưa có sản phẩm."}
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map(p => {
                      const catId = p.idcategory ?? p.categoryid;
                      return (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.name}</td>
                          <td>{p.imageKey}</td>
                          <td>{p.brandid}</td>
                          <td>{p.currentPrice}</td>
                          <td>{catId != null ? (categories.find(c => Number(c.id ?? c.idcategory) === Number(catId))?.name ?? catId) : ""}</td>
                          <td>
                            <div className="admin-table_actions">
                              <button type="button" className="admin-table_link" onClick={() => openEdit(p)} disabled={saving}>
                                Sửa
                              </button>
                              <button type="button" className="admin-table_link admin-table_link--danger" onClick={() => handleDelete(p.id)} disabled={saving}>
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
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || saving}>
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <form className="admin-form-card" onSubmit={handleSubmitForm}>
            <h2>{isNew ? "Thêm sản phẩm" : "Sửa sản phẩm"}</h2>
            <div className="admin-form-grid">
              {!isNew && (
                <label>
                  ID
                  <input value={form.id} readOnly />
                </label>
              )}
              <label className="admin-form-grid_full">
                Tên sản phẩm
                <input value={form.name} onChange={e => handleFormChange("name", e.target.value)} required />
              </label>
              <label>
                imageKey
                <input value={form.imageKey} onChange={e => handleFormChange("imageKey", e.target.value)} />
              </label>
              <label>
                Danh mục công nghệ
                <select value={form.idcategory} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="">- Chọn danh mục để lên khuôn mẫu -</option>
                  {categories.map(c => (
                    <option key={c.id ?? c.idcategory} value={String(c.id ?? c.idcategory)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Thương hiệu (brandid)
                <input value={form.brandid} onChange={e => handleFormChange("brandid", e.target.value)} />
              </label>
              <label>
                Dòng máy (series)
                <input value={form.series} onChange={e => handleFormChange("series", e.target.value)} />
              </label>
              <label>
                Giá hiện tại
                <input value={form.currentPrice} onChange={e => handleFormChange("currentPrice", e.target.value)} />
              </label>
              <label>
                Giá gốc
                <input value={form.originalPrice} onChange={e => handleFormChange("originalPrice", e.target.value)} />
              </label>
              <label>
                Giảm giá
                <input value={form.discount} onChange={e => handleFormChange("discount", e.target.value)} />
              </label>
              <label>
                Đánh giá
                <input value={form.rating} onChange={e => handleFormChange("rating", e.target.value)} />
              </label>
              <label>
                Đã bán
                <input value={form.sold} onChange={e => handleFormChange("sold", e.target.value)} />
              </label>

              {renderSpecsForm()}
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
        <h1 className="admin-topbar_title">Quản trị sản phẩm</h1>
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

export default AdminProduct;