import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const jsonBase = import.meta.env.BASE_URL || "/";

export function useProductCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateProcessed = useRef(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`${jsonBase}products.json`),
          fetch(`${jsonBase}category.json`)
        ]);
        if (!pRes.ok) throw new Error("Không tải được products.json");
        const pData = await pRes.json();
        setProducts(Array.isArray(pData) ? pData : []);

        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(Array.isArray(cData) ? cData : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (products.length > 0 && location.state?.items && !stateProcessed.current) {
      const incomingItems = location.state.items;
      const incomingIds = incomingItems.map(item => Number(item.id));

      const firstItem = incomingItems[0];
      const pFirst = products.find(p => Number(p.id) === Number(firstItem.id));
      const firstCat = pFirst?.idcategory ?? pFirst?.categoryid ?? firstItem.idcategory ?? firstItem.categoryid;

      const validIds = incomingIds.filter(id => {
        const p = products.find(prod => Number(prod.id) === id);
        if (!p) return false;
        const cat = p.idcategory ?? p.categoryid;
        return Number(cat) === Number(firstCat);
      });

      let finalIds = [...new Set(validIds)];

      // CHẶN SỐ LƯỢNG TỪ TRANG YÊU THÍCH: Tối đa 4 sản phẩm
      if (finalIds.length > 4) {
        alert("Bàn cân đầy rồi! Chỉ chứa được tối đa 4 máy thôi nha ní. Tui tự động lấy 4 máy đầu tiên lên sàn nha!");
        finalIds = finalIds.slice(0, 4);
      }

      if (finalIds.length > 0) {
        setSelectedIds(finalIds);
      }

      if (validIds.length < incomingIds.length) {
        alert("Một số thiết bị đã bị loại khỏi bàn cân vì không cùng danh mục (Điện thoại chỉ so với Điện thoại)!");
      }

      stateProcessed.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [products, location, navigate]);

  const selectedProducts = useMemo(() => {
    return selectedIds.map(id => products.find(p => p.id === id)).filter(Boolean);
  }, [selectedIds, products]);

  const currentCategory = useMemo(() => {
    if (selectedProducts.length === 0) return null;
    return selectedProducts[0].idcategory ?? selectedProducts[0].categoryid;
  }, [selectedProducts]);

  const availableProducts = useMemo(() => {
    if (!currentCategory) return products;
    return products.filter(p => Number(p.idcategory ?? p.categoryid) === Number(currentCategory));
  }, [products, currentCategory]);

  const specStructure = useMemo(() => {
    if (selectedProducts.length === 0) return {};
    const structure = {};
    selectedProducts.forEach(p => {
      const specs = p.specifications || {};
      Object.keys(specs).forEach(sectionKey => {
        if (!structure[sectionKey]) structure[sectionKey] = new Set();
        const sectionValue = specs[sectionKey];
        if (typeof sectionValue === "object" && !Array.isArray(sectionValue) && sectionValue !== null) {
          Object.keys(sectionValue).forEach(fieldKey => structure[sectionKey].add(fieldKey));
        }
      });
    });
    return structure;
  }, [selectedProducts]);

  const handleSelectProduct = (idStr) => {
    if (!idStr) return;

    // CHẶN SỐ LƯỢNG KHI THÊM THỦ CÔNG
    if (selectedIds.length >= 4) {
      alert("Tối đa 4 sản phẩm");
      return;
    }

    const id = Number(idStr);
    if (selectedIds.includes(id)) return;
    const targetProd = products.find(p => p.id === id);
    if (!targetProd) return;
    const targetCat = targetProd.idcategory ?? targetProd.categoryid;
    if (currentCategory && Number(currentCategory) !== Number(targetCat)) {
      alert("Ủa ní ơi lệch danh mục rồi! Điện thoại phải so với điện thoại, tablet với tablet chứ!");
      return;
    }
    setSelectedIds(prev => [...prev, id]);
  };

  const handleRemoveProduct = (id) => {
    setSelectedIds(prev => prev.filter(item => item !== id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  return {
    categories,
    selectedIds,
    selectedProducts,
    currentCategory,
    availableProducts,
    specStructure,
    loading,
    error,
    handleSelectProduct,
    handleRemoveProduct,
    handleClearAll
  };
}