import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const jsonBase = import.meta.env.BASE_URL || '/';

const STATUS_OPTIONS = [
  { value: 'delivered', label: 'Đã giao hàng' },
  { value: 'shipping', label: 'Vận chuyển' },
  { value: 'pending', label: 'Chưa giải quyết' },
  { value: 'processing', label: 'Xử lý' },
];

const emptyForm = () => ({
  id: '',
  customer_id: '',
  employee_id: '',
  date: '',
  total: '',
  status: 'delivered',
});

function rowToForm(b) {
  const d = String(b.date || '').slice(0, 10);
  const cid = b.idcustomer ?? b.customer_id ?? b.customerid ?? '';
  const eid = b.idemployee ?? b.employee_id ?? b.employeeid ?? '';
  const stat = b.status ?? b.trangthai ?? 'delivered';
  return {
    id: String(b.id),
    customer_id: cid !== '' ? String(cid) : '',
    employee_id: eid !== '' ? String(eid) : '',
    date: d,
    total: b.total !== null && b.total !== undefined ? String(b.total) : '',
    status: String(stat).toLowerCase(),
  };
}

function formToRow(form, nextId) {
  const cid = form.customer_id ? Number(form.customer_id) : 0;
  const eid = form.employee_id ? Number(form.employee_id) : 0;
  const stat = String(form.status || 'delivered').trim().toLowerCase();
  return {
    id: form.id ? Number(form.id) : nextId,
    customer_id: cid,
    idcustomer: cid,
    customerid: cid,
    employee_id: eid,
    idemployee: eid,
    employeeid: eid,
    date: form.date.trim(),
    total: Number(form.total),
    status: stat,
    trangthai: stat,
  };
}

function validateRow(built) {
  if (!Number.isFinite(built.customer_id)) return 'customer_id phải là số';
  if (!Number.isFinite(built.employee_id)) return 'employee_id phải là số';
  if (!Number.isFinite(built.total)) return 'total phải là số';
  if (!built.date) return 'Vui lòng chọn ngày';
  return null;
}

function AdminBill({ embedded = false, onViewDetails = null }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(embedded);
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [searchIdInput, setSearchIdInput] = useState('');
  const [appliedSearchId, setAppliedSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBillId, setExpandedBillId] = useState(null);

  const ITEMS_PER_PAGE = 20;

  const displayedRows = useMemo(() => {
    const q = appliedSearchId.trim();
    if (!q) return rows;
    return rows.filter((r) => String(r.id) === q);
  }, [rows, appliedSearchId]);

  const totalPages = Math.ceil(displayedRows.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedRows.slice(start, start + ITEMS_PER_PAGE);
  }, [displayedRows, currentPage]);

  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [Number(c.id ?? c.idcustomer), c.name]));
  }, [customers]);

  const employeeMap = useMemo(() => {
    return new Map(employees.map((e) => [Number(e.id ?? e.idemployee), e.name]));
  }, [employees]);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [Number(p.id), p.name]));
  }, [products]);

  const persist = useCallback(async (nextList) => {
    setSaving(true);
    setSaveError('');
    try {
      await axios.put('/api/bill', nextList, {
        headers: { 'Content-Type': 'application/json' },
      });
      setRows(nextList);
      setView('list');
      setForm(emptyForm());
      setIsNew(false);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' || err.response?.status === 404
          ? 'Chỉ lưu được khi chạy npm run dev hoặc npm run preview (API Vite).'
          : null) ||
        'Không lưu được dữ liệu.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (embedded) {
      setAllowed(true);
      return;
    }
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'staff') {
        navigate('/');
        return;
      }
      setAllowed(true);
    } catch {
      navigate('/login');
    }
  }, [navigate, embedded]);

  useEffect(() => {
    if (!allowed) return;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [bRes, cRes, eRes, idRes, pRes] = await Promise.all([
          fetch(`${jsonBase}bill.json`),
          fetch(`${jsonBase}customer.json`),
          fetch(`${jsonBase}employee.json`),
          fetch(`${jsonBase}invoicedetails.json`),
          fetch(`${jsonBase}products.json`),
        ]);
        if (!bRes.ok) throw new Error('Không tải được bill.json');
        const bdata = await bRes.json();
        setRows(Array.isArray(bdata) ? bdata : []);

        if (cRes.ok) {
          const cdata = await cRes.json();
          setCustomers(Array.isArray(cdata) ? cdata : []);
        }
        if (eRes.ok) {
          const edata = await eRes.json();
          setEmployees(Array.isArray(edata) ? edata : []);
        }
        if (idRes.ok) {
          const idData = await idRes.json();
          setInvoiceDetails(Array.isArray(idData) ? idData : []);
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(Array.isArray(pData) ? pData : []);
        }
      } catch (e) {
        setLoadError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [allowed]);

  const goHome = () => navigate('/');
  const logout = () => {
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/login');
  };

  const openCreate = () => {
    setIsNew(true);
    setForm(emptyForm());
    setView('form');
    setSaveError('');
  };

  const openEdit = (b) => {
    setIsNew(false);
    setForm(rowToForm(b));
    setView('form');
    setSaveError('');
  };

  const cancelForm = () => {
    setView('list');
    setForm(emptyForm());
    setIsNew(false);
    setSaveError('');
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const nextId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
    const built = formToRow(form, nextId);
    const invalid = validateRow(built);
    if (invalid) {
      setSaveError(invalid);
      return;
    }
    let nextList;
    if (isNew) {
      nextList = [...rows, built];
    } else {
      const idx = rows.findIndex((r) => String(r.id) === String(form.id));
      if (idx === -1) {
        setSaveError('Không tìm thấy bản ghi để cập nhật');
        return;
      }
      nextList = rows.map((r) => (String(r.id) === String(form.id) ? built : r));
    }
    persist(nextList);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Xóa hóa đơn này?')) return;
    persist(rows.filter((r) => String(r.id) !== String(id)));
  };

  const applyIdSearch = () => {
    setAppliedSearchId(searchIdInput.trim());
    setCurrentPage(1);
  };
  const clearIdSearch = () => {
    setSearchIdInput('');
    setAppliedSearchId('');
    setCurrentPage(1);
  };

  const statusLabel = (v) => STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;

  const bodyContent = (
    <>
      {loadError && <div className="admin-msg admin-msg--error">{loadError}</div>}
      {saveError && <div className="admin-msg admin-msg--error">{saveError}</div>}
      <div className="admin-row">
        {loading ? (
          <p>Đang tải...</p>
        ) : view === 'list' ? (
          <>
            <div className="admin-toolbar admin-toolbar--row">
              <button type="button" className="admin-btn" onClick={openCreate} disabled={saving}>
                + Thêm hóa đơn
              </button>
              <div className="admin-toolbar-search">
                <label htmlFor="admin-bill-search-id">Tìm kiếm: </label>
                <input
                  id="admin-bill-search-id"
                  type="text"
                  inputMode="numeric"
                  value={searchIdInput}
                  onChange={(e) => setSearchIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyIdSearch();
                    }
                  }}
                />
                <button type="button" className="admin-btn" onClick={applyIdSearch} disabled={saving}>
                  Tìm
                </button>
                {appliedSearchId.trim() !== '' && (
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
                    <th>KH (Khách hàng)</th>
                    <th>NV (Nhân viên)</th>
                    <th>Ngày</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table_empty">
                        {appliedSearchId.trim() ? `Không có hóa đơn với ID "${appliedSearchId.trim()}".` : 'Chưa có hóa đơn.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((r) => {
                      const cid = Number(r.idcustomer ?? r.customer_id ?? r.customerid);
                      const eid = Number(r.idemployee ?? r.employee_id ?? r.employeeid);
                      const stat = r.status ?? r.trangthai ?? '';
                      const cName = customerMap.get(cid) || 'Chưa rõ';
                      const eName = employeeMap.get(eid) || 'Chưa rõ';
                      const isExpanded = expandedBillId === r.id;
                      const billDetails = invoiceDetails.filter(d => Number(d.idbill) === Number(r.id));

                      return (
                        <React.Fragment key={r.id}>
                          <tr>
                            <td>{r.id}</td>
                            <td>{cid ? `${cid} - ${cName}` : '-'}</td>
                            <td>{eid ? `${eid} - ${eName}` : '-'}</td>
                            <td>{r.date}</td>
                            <td>{r.total}</td>
                            <td>{statusLabel(String(stat).toLowerCase()) || 'Chưa xác định'}</td>
                            <td>
                              <div className="admin-table_actions" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                                <button type="button" className="ruang-mini-btn" onClick={() => setExpandedBillId(isExpanded ? null : r.id)} disabled={saving} style={{ color: isExpanded ? '#ef4444' : '#2563eb', borderColor: isExpanded ? '#fca5a5' : '#bfdbfe', padding: '0.35rem 0.6rem', whiteSpace: 'nowrap' }}>
                                  {isExpanded ? 'Đóng' : 'Chi tiết'}
                                </button>
                                <button type="button" className="ruang-mini-btn" onClick={() => openEdit(r)} disabled={saving} style={{ padding: '0.35rem 0.6rem', whiteSpace: 'nowrap' }}>
                                  Sửa
                                </button>
                                <button type="button" className="admin-table_link admin-table_link--danger" onClick={() => handleDelete(r.id)} disabled={saving} style={{ padding: '0.35rem 0.6rem', whiteSpace: 'nowrap', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fff' }}>
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} style={{ padding: '0', backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                <div className="animate-slide-down" style={{ padding: '15px', borderLeft: '4px solid #3b82f6', overflowX: 'auto' }}>
                                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Sản phẩm trong hóa đơn:</h4>
                                  {billDetails.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Không có sản phẩm nào.</p>
                                  ) : (
                                    <div style={{ minWidth: '400px' }}>
                                      <table className="admin-table" style={{ margin: 0, boxShadow: 'none', border: '1px solid #e2e8f0', width: '100%', tableLayout: 'fixed' }}>
                                        <thead>
                                          <tr>
                                          <th style={{ backgroundColor: '#f1f5f9' }}>SP</th>
                                          <th style={{ backgroundColor: '#f1f5f9' }}>SL</th>
                                          <th style={{ backgroundColor: '#f1f5f9' }}>Đơn giá</th>
                                          <th style={{ backgroundColor: '#f1f5f9' }}>Thành tiền</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {billDetails.map(detail => {
                                          const pid = Number(detail.idproducts ?? detail.SanPham_id);
                                          const pName = productMap.get(pid) || 'Chưa rõ';
                                          return (
                                            <tr key={detail.id ?? detail.idinvoicedetails}>
                                              <td>{pid ? `${pid} - ${pName}` : '-'}</td>
                                              <td>{detail.quantity}</td>
                                              <td>{detail.unit_price}</td>
                                              <td>{detail.price}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="admin-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                <button 
                  className="admin-btn" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || saving}
                >
                  Trước
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500' }}>Trang {currentPage} / {totalPages}</span>
                <button 
                  className="admin-btn" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || saving}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <form className="admin-form-card admin-form-card--wide" onSubmit={handleSubmitForm}>
            <h2>{isNew ? 'Thêm hóa đơn' : 'Sửa hóa đơn'}</h2>
            <div className="admin-form-grid">
              {!isNew && (
                <label>
                  ID
                  <input value={form.id} readOnly />
                </label>
              )}
              <label>
                Khách (customer_id)
                <input
                  type="number"
                  min="1"
                  value={form.customer_id}
                  onChange={(e) => handleFormChange('customer_id', e.target.value)}
                  required
                />
              </label>
              <label>
                Nhân viên (employee_id)
                <input
                  type="number"
                  min="1"
                  value={form.employee_id}
                  onChange={(e) => handleFormChange('employee_id', e.target.value)}
                  required
                />
              </label>
              <label>
                Ngày
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  required
                />
              </label>
              <label>
                Tổng tiền
                <input
                  type="number"
                  min="0"
                  value={form.total}
                  onChange={(e) => handleFormChange('total', e.target.value)}
                  required
                />
              </label>
              <label className="admin-form-grid_full">
                Trạng thái
                <select value={form.status} onChange={(e) => handleFormChange('status', e.target.value)}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} ({o.value})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
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
        <h1 className="admin-topbar_title">Quản trị hóa đơn</h1>
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

export default AdminBill;