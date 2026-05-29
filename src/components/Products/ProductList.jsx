import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import { imageMap } from "../../utils/productImages";
import "./ProductList.css";

const PRODUCTS_PER_PAGE = 8;
const jsonBase = import.meta.env.BASE_URL || "/";

const DYNAMIC_FILTERS = [
  { id: "brandid",         label: "Thương hiệu",         path: "brandid",                               categories: "ALL" },
  { id: "chip",            label: "Chip xử lý",          path: "specifications.processor.chipset",      categories: [1, 2] },
  { id: "ram",             label: "Dung lượng RAM",      path: "specifications.memory.ram",             categories: [1, 2] },
  { id: "rom",             label: "Bộ nhớ trong",        path: "specifications.memory.rom",             categories: [1, 2] },
  { id: "hz",              label: "Tần số quét",         path: "specifications.display.refreshRate",    categories: [1, 2] },
  { id: "battery",         label: "Dung lượng pin",      path: "specifications.battery.capacity",       categories: [1, 2, 3] },
  { id: "waterResistance", label: "Kháng nước/bụi (IP)", path: "specifications.design.waterResistance", categories: [1, 3, 4] },
  { id: "bluetooth",       label: "Kết nối Bluetooth",   path: "specifications.connectivity.bluetooth", categories: [3, 4] },
  { id: "storage",         label: "Mức dung lượng",      path: "specifications.storage.capacity",       categories: [9] }
];

const CHIP_BRAND_MAP = [
  { keywords: ["snapdragon"], label: "Snapdragon" },
  { keywords: ["dimensity"],  label: "Dimensity" },
  { keywords: ["helio"],      label: "Helio" },
  { keywords: ["exynos"],     label: "Exynos" },
  { keywords: ["kirin"],      label: "Kirin" },
  { keywords: ["unisoc"],     label: "Unisoc" },
];

const getNestedVal = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

const fmtPrice = (val) => val.toLocaleString("vi-VN") + "đ";

const getChipBrand = (chipset) => {
  if (!chipset) return null;
  const lower = chipset.toLowerCase();
  for (const { keywords, label } of CHIP_BRAND_MAP) {
    if (keywords.some((k) => lower.includes(k))) return label;
  }
  return chipset;
};

const DualRangeSlider = ({ min, max, value, onChange, step = 500000 }) => {
  const [minVal, maxVal] = value;
  const rangeRef = useRef(null);

  const getPercent = useCallback(
    (val) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    if (rangeRef.current) {
      const minPct = getPercent(minVal);
      const maxPct = getPercent(maxVal);
      rangeRef.current.style.left  = `${minPct}%`;
      rangeRef.current.style.width = `${maxPct - minPct}%`;
    }
  }, [minVal, maxVal, getPercent]);

  return (
    <div className="dual-slider">
      <div className="dual-slider__track">
        <div className="dual-slider__range" ref={rangeRef} />
      </div>
      <input
        type="range"
        className="dual-slider__input dual-slider__input--min"
        min={min} max={max} step={step} value={minVal}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), maxVal - step);
          onChange([v, maxVal]);
        }}
      />
      <input
        type="range"
        className="dual-slider__input dual-slider__input--max"
        min={min} max={max} step={step} value={maxVal}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), minVal + step);
          onChange([minVal, v]);
        }}
      />
    </div>
  );
};

const AccordionSection = ({ title, isOpen, onToggle, children, badge }) => (
  <div className="acc-section">
    <button type="button" className="acc-header" onClick={onToggle}>
      <span className="acc-header-label">
        {title}
        {badge > 0 && <span className="acc-badge">{badge}</span>}
      </span>
      <svg
        className={`acc-chevron ${isOpen ? "acc-chevron--open" : ""}`}
        width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <div className={`acc-body ${isOpen ? "acc-body--open" : ""}`}>
      <div className="acc-body-inner">{children}</div>
    </div>
  </div>
);

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedidcategory, setSelectedidcategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilters, setActiveFilters] = useState({});
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [priceActive, setPriceActive] = useState(false);
  const [globalMaxPrice, setGlobalMaxPrice] = useState(50000000);

  const location = useLocation();

  useEffect(() => {
    let id = null;
    if (category === "dienthoai") id = 1;
    else if (category === "tablet") id = 2;
    else if (category === "smartwatch") id = 3;

    const params = new URLSearchParams(location.search);
    const catQuery = params.get("cat");
    if (catQuery) {
      id = Number(catQuery);
    }
    setSelectedidcategory(id);

    const brandQuery = params.get("brand");
    if (brandQuery) {
      setActiveFilters({ brandid: [brandQuery] });
    } else {
      setActiveFilters({});
    }
  }, [category, location.search]);

  const [openSections, setOpenSections] = useState({ price: true });

  const toggleSection = (id) => {
    setOpenSections((prev) => {
      if (id === "price") {
        return { ...prev, price: !prev.price };
      }
      return {
        price: prev.price,
        ...(prev[id] ? {} : { [id]: true })
      };
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${jsonBase}products.json`),
          fetch(`${jsonBase}category.json`),
        ]);
        if (!productsRes.ok) throw new Error("Không thể tải dữ liệu sản phẩm");

        const data = await productsRes.json();
        const mapped = data.map((item) => ({
          ...item,
          image: imageMap[item.imageKey] || item.image,
        }));
        setProducts(mapped);

        const maxP = Math.max(...mapped.map((p) => p.currentPrice || 0), 5000000);
        const rounded = Math.ceil(maxP / 1000000) * 1000000;
        setGlobalMaxPrice(rounded);
        setPriceRange([0, rounded]);

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const baseProducts = useMemo(() => {
    if (selectedidcategory != null) {
      return products.filter((p) => String(p.idcategory) === String(selectedidcategory));
    }
    if (category === "accessory") {

      return products.filter((p) => Number(p.idcategory || p.categoryid) >= 4);
    }
    return products;
  }, [products, selectedidcategory, category]);

  const availableFilters = useMemo(
    () =>
      DYNAMIC_FILTERS
        .filter((f) => {
          if (f.categories === "ALL") return true;
          if (selectedidcategory == null) return false;
          return f.categories.includes(selectedidcategory);
        })
        .map((f) => {
          const rawVals = baseProducts
            .map((p) => getNestedVal(p, f.path))
            .filter((v) => v != null && v !== "");

          const options =
            f.id === "chip"
              ? [...new Set(rawVals.map(getChipBrand))].sort()
              : [...new Set(rawVals)].sort();

          return { ...f, options };
        })
        .filter((f) => f.options.length > 0),
    [baseProducts, selectedidcategory]
  );

  const filteredProducts = useMemo(
    () =>
      baseProducts.filter((p) => {
        if (priceActive) {
          const price = p.currentPrice || 0;
          if (price < priceRange[0] || price > priceRange[1]) return false;
        }
        for (const [key, selected] of Object.entries(activeFilters)) {
          if (!selected || selected.length === 0) continue;
          const filterDef = DYNAMIC_FILTERS.find((f) => f.id === key);
          if (!filterDef) continue;
          const val = getNestedVal(p, filterDef.path);
          if (key === "chip") {
            if (!selected.includes(getChipBrand(val))) return false;
          } else {
            if (!selected.includes(val)) return false;
          }
        }
        return true;
      }),
    [baseProducts, priceRange, priceActive, activeFilters]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedidcategory]);

  useEffect(() => {
    setPriceRange([0, globalMaxPrice]);
  }, [globalMaxPrice]);

  const safePage = Math.min(currentPage, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  const toggleFilter = (filterId, value) => {
    setActiveFilters((prev) => {
      const cur = prev[filterId] || [];
      return {
        ...prev,
        [filterId]: cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value],
      };
    });
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setActiveFilters({});
    setPriceRange([0, globalMaxPrice]);
    setPriceActive(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    priceActive || Object.values(activeFilters).some((v) => v && v.length > 0);
  const countActive = (id) => (activeFilters[id] || []).length;

  if (isLoading) return <div className="product-list-container">Đang tải sản phẩm...</div>;
  if (error) return <div className="product-list-container">Lỗi: {error}</div>;

  return (
    <div className="product-list-container">
      <div className="product-list-layout">
        <aside className="product-list-sidebar">
          <div className="sidebar-category-wrap">
            <p className="sidebar-category-label">Danh mục</p>
            <select
              className="category-select"
              value={selectedidcategory ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedidcategory(val === "" ? null : Number(val));
              }}
            >
              <option value="">Tất cả sản phẩm</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-divider" />

          <AccordionSection
            title="Khoảng giá"
            isOpen={!!openSections.price}
            onToggle={() => toggleSection("price")}
          >
            <div className="price-labels-row">
              <span className="price-label-box">{fmtPrice(priceRange[0])}</span>
              <span className="price-dash">–</span>
              <span className="price-label-box">{fmtPrice(priceRange[1])}</span>
            </div>

            <DualRangeSlider
              min={0}
              max={globalMaxPrice}
              step={500000}
              value={priceRange}
              onChange={(range) => {
                setPriceRange(range);
                setPriceActive(range[0] !== 0 || range[1] !== globalMaxPrice);
                setCurrentPage(1);
              }}
            />

            {priceActive && (
              <button
                type="button"
                className="btn-clear-tag"
                onClick={() => {
                  setPriceRange([0, globalMaxPrice]);
                  setPriceActive(false);
                  setCurrentPage(1);
                }}
              >
                ✕ Xoá lọc giá
              </button>
            )}
          </AccordionSection>

          {availableFilters.map((filter) => (
            <AccordionSection
              key={filter.id}
              title={filter.label}
              isOpen={!!openSections[filter.id]}
              onToggle={() => toggleSection(filter.id)}
              badge={countActive(filter.id)}
            >
              <div className="filter-options">
                {filter.options.map((opt, idx) => (
                  <label key={idx} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(activeFilters[filter.id] || []).includes(opt)}
                      onChange={() => toggleFilter(filter.id, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </AccordionSection>
          ))}

          {hasActiveFilters && (
            <button type="button" className="btn-reset-all" onClick={resetAllFilters}>
              Xoá tất cả bộ lọc
            </button>
          )}
        </aside>

        <div className="product-list-main">
          {/* <div className="product-list-header">
            <strong>Tìm thấy {filteredProducts.length} sản phẩm</strong>
          </div> */}

          {filteredProducts.length === 0 ? (
            <div className="product-list-empty">
              Không tìm thấy sản phẩm nào phù hợp với tiêu chí lọc.
            </div>
          ) : (
            <div className="product-list">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {filteredProducts.length > PRODUCTS_PER_PAGE && (
            <div className="product-list-pagination">
              <button
                type="button" className="btn-page"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >← Trang trước</button>
              <span className="page-info">{safePage} / {totalPages}</span>
              <button
                type="button" className="btn-page"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >Trang sau →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;