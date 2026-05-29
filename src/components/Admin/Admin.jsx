import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminProduct from "./AdminProduct";
import AdminCategory from "./Admincategory";
import AdminCustomer from "./AdminCustomer";
import AdminEmployee from "./AdminEmployee";
import AdminBill from "./Adminbill";
import AdminInvoiceDetails from "./AdminInvoiceDetails";
import "./Admin.css";

const jsonBase = import.meta.env.BASE_URL || "/";

const SECTION_LABEL = {
  dashboard: "Dashboard",
  products: "Sản phẩm",
  category: "Danh mục",
  customer: "Khách hàng",
  employee: "Nhân viên",
  bill: "Hóa đơn",
  invoiceDetails: "Chi tiết hóa đơn",
};

// Format số 1,000,000
function fmtNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format tiền kèm chữ đ
function fmtCurrency(n) {
  return `${fmtNumber(Number(n) || 0)} đ`;
}

// Map màu trạng thái bill
const BILL_STATUS_MAP = {
  delivered: { label: "Đã giao hàng", cls: "done" },
  shipping: { label: "Vận chuyển", cls: "shipping" },
  pending: { label: "Chưa giải quyết", cls: "pending" },
  processing: { label: "Xử lý", cls: "processing" },
};

function billStatusFromJson(statusRaw) {
  const key = String(statusRaw || "")
    .trim()
    .toLowerCase();
  if (BILL_STATUS_MAP[key]) return { key, ...BILL_STATUS_MAP[key] };
  return {
    key: "unknown",
    label: key ? String(statusRaw).trim() : "Chưa xác định",
    cls: "unknown",
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [adminSection, setAdminSection] = useState("dashboard");
  const [selectedBillId, setSelectedBillId] = useState(null);
  const userMenuRef = useRef(null);

  // Check login quyền staff
  useEffect(() => {
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
  }, [navigate]);

  // 🔴 FIX LỖI SẬP WEB (Body stream already read): Đọc JSON 1 lần rồi mới check mảng
  useEffect(() => {
    if (!allowed) return;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [pRes, cRes, bRes, cuRes, eRes, iRes] = await Promise.all([
          fetch(`${jsonBase}products.json`),
          fetch(`${jsonBase}category.json`),
          fetch(`${jsonBase}bill.json`),
          fetch(`${jsonBase}customer.json`),
          fetch(`${jsonBase}employee.json`),
          fetch(`${jsonBase}invoicedetails.json`),
        ]);

        if (!pRes.ok) throw new Error("Không tải được products.json");
        const pdata = await pRes.json();
        setProducts(Array.isArray(pdata) ? pdata : []);

        if (cRes.ok) {
          const cdata = await cRes.json();
          setCategories(Array.isArray(cdata) ? cdata : []);
        }
        if (bRes.ok) {
          const bdata = await bRes.json();
          setBills(Array.isArray(bdata) ? bdata : []);
        }
        if (cuRes.ok) {
          const cudata = await cuRes.json();
          setCustomers(Array.isArray(cudata) ? cudata : []);
        }
        if (eRes.ok) {
          const edata = await eRes.json();
          setEmployees(Array.isArray(edata) ? edata : []);
        }
        if (iRes.ok) {
          const idata = await iRes.json();
          setInvoiceDetails(Array.isArray(idata) ? idata : []);
        }
      } catch (e) {
        setLoadError(e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [allowed]);

  // Click ra ngoài tự đóng menu user
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Tạo avatar chữ viết tắt
  const staffInitials = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return "AD";
      const u = JSON.parse(raw);
      const name = String(u.user || u.name || "Staff").trim();
      const parts = name.split(/\s+/).filter(Boolean);
      if (!parts.length) return "AD";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch {
      return "AD";
    }
  }, []);

  const staffDisplayName = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return "Administrator";
      const u = JSON.parse(raw);
      return String(u.user || u.name || "Staff").trim() || "Administrator";
    } catch {
      return "Administrator";
    }
  }, []);

  /* PHẦN 1: XỬ LÝ LOGIC DỮ LIỆU ĐỂ HIỂN THỊ LÊN DASHBOARD */

  // Tính 4 thẻ thống kê tổng quan
  const stats = useMemo(() => {
    const total = products.length;
    const soldSum = invoiceDetails.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const catCount = categories.length;
    const uncategorized = products.filter(p => p.categoryid == null || p.categoryid === "").length;
    const revenue = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
    const avgBill = bills.length ? revenue / bills.length : 0;
    return { total, soldSum, catCount, uncategorized, revenue, avgBill };
  }, [products, categories, invoiceDetails, bills]);

  // Lọc Top 5 sản phẩm bán chạy nhất
  const topSoldProducts = useMemo(() => {
    const byProduct = invoiceDetails.reduce((map, item) => {
      const pid = Number(item.product_id);
      if (isNaN(pid)) return map;
      const quantity = Number(item.quantity || 0);
      map.set(pid, (map.get(pid) || 0) + quantity);
      return map;
    }, new Map());

    return [...byProduct.entries()]
      .map(([id, sold]) => {
        const product = products.find(p => Number(p.id) === id);
        return { id, sold, name: product?.name || `Sản phẩm #${id}` };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map(p => {
        const sold = Number(p.sold || 0);
        const percent = Math.max(0, Math.min(100, Math.round((sold / 800) * 100)));
        return { id: p.id, name: p.name, sold, percent };
      });
  }, [products, invoiceDetails]);

  // Gom doanh thu cộng dồn theo ngày
  const revenueByDate = useMemo(() => {
    const grouped = bills.reduce((acc, bill) => {
      const key = String(bill.date || "").slice(0, 10);
      if (!key || key === "undefined" || key === "null") return acc;
      acc.set(key, (acc.get(key) || 0) + Number(bill.total || 0));
      return acc;
    }, new Map());

    const rows = [...grouped.entries()].map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
    const maxTotal = rows.reduce((m, row) => Math.max(m, row.total), 0);

    return rows.map(row => ({
      ...row,
      percent: maxTotal > 0 ? Math.max(8, Math.round((row.total / maxTotal) * 100)) : 0,
    }));
  }, [bills]);

  // Bảng Hóa Đơn: Render 6 hóa đơn mới nhất
  const billTableRows = useMemo(() => {
    const customerMap = new Map(customers.map(c => [Number(c.id), c.name]));
    const productMap = new Map(products.map(p => [Number(p.id), p.name]));
    const detailByBill = invoiceDetails.reduce((map, item) => {
      const key = Number(item.bill_id);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
      return map;
    }, new Map());

    return [...bills]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 6)
      .map(bill => {
        const details = detailByBill.get(Number(bill.id)) || [];
        const firstProduct = details[0];
        const itemName = firstProduct ? productMap.get(Number(firstProduct.product_id)) || `Sản phẩm #${firstProduct.product_id}` : "-";

        // 🔴 ĐÃ SỬA CHỖ NÀY: Bắt cả 'idcustomer' theo JSON
        const cid = Number(bill.idcustomer || bill.customer_id);
        const customerName = !isNaN(cid) && customerMap.has(cid) ? customerMap.get(cid) : isNaN(cid) ? "Khách lẻ" : `KH #${cid}`;

        return {
          id: bill.id,
          billCode: String(bill.id || "N/A"),
          customerName,
          itemName,
          status: billStatusFromJson(bill.status),
        };
      });
  }, [bills, customers, products, invoiceDetails]);

  // Lọc Top 5 khách hàng VIP chi đậm nhất
  const vipCustomers = useMemo(() => {
    if (!bills.length) return [];
    const validBills = bills.filter(b => b.date && String(b.date) !== "undefined");
    if (!validBills.length) return [];

    const latestDate = validBills
      .map(b => String(b.date))
      .sort()
      .slice(-1)[0];
    const targetMonth = latestDate.slice(0, 7);
    const customerMap = new Map(customers.map(c => [Number(c.id), c.name]));

    const grouped = validBills.reduce((map, bill) => {
      if (!String(bill.date).startsWith(targetMonth)) return map;

      // 🔴 ĐÃ SỬA CHỖ NÀY: Bắt cả 'idcustomer' để cộng dồn tiền cho VIP
      const cid = Number(bill.idcustomer || bill.customer_id);
      if (isNaN(cid)) return map;

      if (!map.has(cid)) {
        map.set(cid, { customerId: cid, total: 0, count: 0 });
      }
      const row = map.get(cid);
      row.total += Number(bill.total || 0);
      row.count += 1;
      return map;
    }, new Map());

    return [...grouped.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(row => ({
        ...row,
        name: customerMap.get(row.customerId) || `KH #${row.customerId}`,
        total: row.total,
        count: row.count,
      }));
  }, [bills, customers]);

  const goHome = () => navigate("/");

  const logout = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
    setLogoutModalOpen(false);
  };

  const closeMobileNav = () => setMobileSidebarOpen(false);

  if (!allowed) {
    return <div className="ruang-boot" aria-hidden />;
  }

  /* PHẦN 2: RENDER GIAO DIỆN HIỂN THỊ */

  return (
    <div className="ruang-layout">
      <div className={`ruang-overlay ${mobileSidebarOpen ? "is-visible" : ""}`} onClick={closeMobileNav} aria-hidden={!mobileSidebarOpen} />

      {/* Sidebar điều hướng */}
      <aside className={`ruang-sidebar ${mobileSidebarOpen ? "is-open" : ""}`}>
        <div className="ruang-sidebar_brand">
          <span className="ruang-sidebar_brand-icon">
            <i className="bi bi-stack" />
          </span>
          <span>TechShop</span>
        </div>
        <hr className="ruang-sidebar_divider" />
        <div className="ruang-sidebar_heading">Tiện ích</div>
        <ul className="ruang-sidebar_nav">
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "dashboard" ? "is-active" : ""}`}
              onClick={() => {
                setAdminSection("dashboard");
                closeMobileNav();
              }}
            >
              <i className="bi bi-speedometer2" />
              Trang chủ
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "products" ? "is-active" : ""}`}
              onClick={() => {
                setAdminSection("products");
                closeMobileNav();
              }}
            >
              <i className="bi bi-box-seam" />
              Sản phẩm
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "category" ? "is-active" : ""}`}
              onClick={() => {
                setAdminSection("category");
                closeMobileNav();
              }}
            >
              <i className="bi bi-tags" />
              Danh mục
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "customer" ? "is-active" : ""}`}
              onClick={() => {
                setAdminSection("customer");
                closeMobileNav();
              }}
            >
              <i className="bi bi-person-lines-fill" />
              Khách hàng
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "employee" ? "is-active" : ""}`}
              onClick={() => {
                setAdminSection("employee");
                closeMobileNav();
              }}
            >
              <i className="bi bi-person-badge" />
              Nhân viên
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "bill" ? "is-active" : ""}`}
              onClick={() => {
                setAdminSection("bill");
                closeMobileNav();
              }}
            >
              <i className="bi bi-receipt" />
              Hóa đơn
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === "invoiceDetails" ? "is-active" : ""}`}
              onClick={() => {
                setSelectedBillId(null);
                setAdminSection("invoiceDetails");
                closeMobileNav();
              }}
            >
              <i className="bi bi-file-earmark-text" />
              Chi tiết HĐ
            </button>
          </li>
        </ul>
      </aside>

      <div className="ruang-shell">
        <header className="ruang-topbar">
          <button type="button" className="ruang-topbar_toggle" onClick={() => setMobileSidebarOpen(v => !v)}>
            <i className="bi bi-list" />
          </button>
          <div className="ruang-breadcrumb-wrap"></div>
          <div className="ruang-topbar_right">
            <button type="button" className="ruang-notify">
              <i className="bi bi-chat-dots" />
              <span className="ruang-badge">{Math.min(9, stats.total)}+</span>
            </button>
            <button type="button" className="ruang-notify">
              <i className="bi bi-bell" />
              <span className="ruang-badge">3+</span>
            </button>
            <div className="ruang-user" ref={userMenuRef}>
              <button type="button" className="ruang-user_toggle" onClick={() => setUserMenuOpen(v => !v)}>
                <span className="ruang-user_avatar">{staffInitials}</span>
                <span className="ruang-user_name">{staffDisplayName}</span>
                <i className="bi bi-chevron-down" style={{ fontSize: "0.65rem", opacity: 0.6 }} />
              </button>
              {userMenuOpen && (
                <div className="ruang-user_menu" role="menu">
                  <div className="ruang-user_menu-title">Tài khoản</div>
                  <button type="button" role="menuitem" onClick={goHome}>
                    <i className="bi bi-house-door" /> Trang chủ
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                  >
                    <i className="bi bi-box-arrow-right" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ruang-main">
          {adminSection === "dashboard" && loadError && <div className="admin-msg admin-msg--error">{loadError}</div>}

          {adminSection === "products" ? (
            <AdminProduct embedded />
          ) : adminSection === "category" ? (
            <AdminCategory embedded />
          ) : adminSection === "customer" ? (
            <AdminCustomer embedded />
          ) : adminSection === "employee" ? (
            <AdminEmployee embedded />
          ) : adminSection === "bill" ? (
            <AdminBill embedded />
          ) : adminSection === "invoiceDetails" ? (
            <AdminInvoiceDetails embedded filterBillId={selectedBillId} clearFilter={() => setSelectedBillId(null)} />
          ) : loading ? (
            <div className="ruang-loading">Đang tải...</div>
          ) : (
            <>
              {/* Grid 4 thẻ thống kê đầu trang */}
              <div className="ruang-cards">
                <div className="ruang-stat-card">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Doanh thu</div>
                    <div className="ruang-stat-card_value">{fmtCurrency(stats.revenue)}</div>
                    <div className="ruang-stat-card_badge">{fmtNumber(bills.length)} hóa đơn</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="bi bi-cash-stack" />
                  </div>
                </div>
                <div className="ruang-stat-card ruang-stat-card--green">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Sản phẩm đã bán</div>
                    <div className="ruang-stat-card_value">{fmtNumber(stats.soldSum)}</div>
                    <div className="ruang-stat-card_badge">Từ invoice details</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="bi bi-cart3" />
                  </div>
                </div>
                <div className="ruang-stat-card ruang-stat-card--cyan">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Khách hàng</div>
                    <div className="ruang-stat-card_value">{fmtNumber(customers.length)}</div>
                    <div className="ruang-stat-card_badge">{fmtNumber(employees.length)} nhân viên</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="bi bi-people" />
                  </div>
                </div>
                <div className="ruang-stat-card ruang-stat-card--amber">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Danh mục / Bill TB</div>
                    <div className="ruang-stat-card_value">
                      {fmtNumber(stats.catCount)} / {fmtCurrency(stats.avgBill)}
                    </div>
                    <div className="ruang-stat-card_badge ruang-stat-card_badge--muted">{stats.uncategorized > 0 ? `${stats.uncategorized} SP chưa gán` : "Dữ liệu đồng bộ"}</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="bi bi-stack" />
                  </div>
                </div>
              </div>

              {/* Khu vực biểu đồ tiến độ */}
              <div className="ruang-dashboard-grid">
                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Doanh thu theo ngày</h6>
                  </div>
                  <div className="ruang-revenue-list">
                    {revenueByDate.length === 0 ? (
                      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Chưa có dữ liệu.</p>
                    ) : (
                      revenueByDate.map(row => (
                        <div className="ruang-revenue-item" key={row.date}>
                          <div className="ruang-revenue-item_head">
                            <span>{row.date}</span>
                            <strong>{fmtCurrency(row.total)}</strong>
                          </div>
                          <div className="ruang-revenue-item_bar">
                            <div className="ruang-revenue-item_fill" style={{ width: `${row.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Sản phẩm đã bán</h6>
                  </div>
                  <div className="ruang-sold-list">
                    {topSoldProducts.length === 0 ? (
                      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Chưa có dữ liệu.</p>
                    ) : (
                      topSoldProducts.map((item, idx) => (
                        <div className="ruang-sold-item" key={item.id}>
                          <div className="ruang-sold-item_head">
                            <span>{item.name}</span>
                            <strong>{item.sold} / 800</strong>
                          </div>
                          <div className="ruang-sold-item_bar">
                            <div className={`ruang-sold-item_fill ruang-sold-item_fill--${idx % 4}`} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Khu vực bảng biểu chi tiết dưới cùng */}
              <div className="ruang-bottom-grid">
                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Hóa đơn</h6>
                    <button type="button" className="ruang-mini-btn" onClick={() => {
                      setSelectedBillId(null);
                      setAdminSection("bill");
                    }}>
                      Xem thêm <i className="bi bi-chevron-right" />
                    </button>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Khách hàng</th>
                          <th>Mục</th>
                          <th>Trạng thái</th>
                          <th>Hoạt động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billTableRows.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                              Chưa có đơn hàng nào
                            </td>
                          </tr>
                        ) : (
                          billTableRows.map(row => (
                            <tr key={row.id}>
                              <td>#{row.billCode}</td>
                              <td>{row.customerName}</td>
                              <td>{row.itemName}</td>
                              <td>
                                <span className={`ruang-status ruang-status--${row.status.cls}`}>{row.status.label}</span>
                              </td>
                              <td>
                                <button type="button" className="ruang-detail-btn" onClick={() => {
                                  setSelectedBillId(row.id);
                                  setAdminSection("invoiceDetails");
                                }}>
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Khách hàng VIP tháng</h6>
                  </div>
                  <div className="ruang-vip-list">
                    {vipCustomers.length === 0 ? (
                      <p style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Chưa có khách VIP.</p>
                    ) : (
                      vipCustomers.map(vip => (
                        <div key={vip.customerId} className="ruang-vip-item">
                          <strong>{vip.name}</strong>
                          <small>{vip.count} đơn.</small>
                          {fmtCurrency(vip.total)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal báo Logout */}
      {logoutModalOpen && (
        <div className="ruang-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ruang-modal">
            <div className="ruang-modal_header">
              <h5>Ohh No!</h5>
              <button type="button" className="ruang-modal_close" onClick={() => setLogoutModalOpen(false)}>
                X
              </button>
            </div>
            <div className="ruang-modal_body">Bạn có chắc muốn đăng xuất?</div>
            <div className="ruang-modal_footer">
              <button type="button" className="ruang-modal_btn" onClick={() => setLogoutModalOpen(false)}>
                Hủy
              </button>
              <button type="button" className="ruang-modal_btn ruang-modal_btn--danger" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;