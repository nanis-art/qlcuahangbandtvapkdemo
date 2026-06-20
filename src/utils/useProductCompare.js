import {
    useState,
    useEffect,
    useMemo,
    useRef
} from "react";
import {
    useLocation
} from "react-router-dom";

const jsonBase =
    import.meta.env.BASE_URL || "/";
const sid = v => String(v);

export function useProductCompare() {
    const location = useLocation();
    const processedStateKey = useRef(null);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pRes, cRes] = await Promise.all([fetch(`${jsonBase}products.json`), fetch(`${jsonBase}category.json`)]);
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
        if (products.length > 0 && location.state && location.state.items) {
            const incomingItems = location.state.items;

            const stateKey = JSON.stringify(incomingItems.map(i => i.id));
            if (processedStateKey.current === stateKey) return;

            const incomingIds = incomingItems.map(item => sid(item.id));
            const firstItem = incomingItems[0];
            const pFirst = products.find(p => sid(p.id) === sid(firstItem.id));

            let fCat = "";
            if (pFirst && pFirst.idcategory) fCat = pFirst.idcategory;
            else if (pFirst && pFirst.categoryid) fCat = pFirst.categoryid;
            else if (firstItem.idcategory) fCat = firstItem.idcategory;
            else if (firstItem.categoryid) fCat = firstItem.categoryid;

            const firstCat = sid(fCat);

            const validIds = incomingIds.filter(id => {
                const p = products.find(prod => sid(prod.id) === id);
                if (!p) return false;

                let pCat = "";
                if (p.idcategory) pCat = p.idcategory;
                else if (p.categoryid) pCat = p.categoryid;

                return sid(pCat) === firstCat;
            });

            let finalIds = [...new Set(validIds)];

            if (finalIds.length > 4) {
                alert("Chỉ so sánh tối đa 4 sản phẩm. Hệ thống tự động chọn 4 sản phẩm đầu tiên.");
                finalIds = finalIds.slice(0, 4);
            }

            if (finalIds.length > 0) setSelectedIds(finalIds);

            if (validIds.length < incomingIds.length) {
                alert("Một số sản phẩm bị loại bỏ do khác danh mục. Chỉ so sánh các sản phẩm cùng loại.");
            }

            processedStateKey.current = stateKey;
        }
    }, [products, location.state]);

    const selectedProducts = useMemo(() => {
        return selectedIds.map(id => products.find(p => sid(p.id) === id)).filter(Boolean);
    }, [selectedIds, products]);

    const currentCategory = useMemo(() => {
        if (selectedProducts.length === 0) return null;

        let cat = "";
        if (selectedProducts[0].idcategory) cat = selectedProducts[0].idcategory;
        else if (selectedProducts[0].categoryid) cat = selectedProducts[0].categoryid;

        return sid(cat);
    }, [selectedProducts]);

    const availableProducts = useMemo(() => {
        if (!currentCategory) return products;
        return products.filter(p => {
            let pCat = "";
            if (p.idcategory) pCat = p.idcategory;
            else if (p.categoryid) pCat = p.categoryid;
            return sid(pCat) === currentCategory;
        });
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

    const handleSelectProduct = idStr => {
        if (!idStr) return;
        if (selectedIds.length >= 4) {
            alert("Chỉ so sánh tối đa 4 sản phẩm.");
            return;
        }
        const id = sid(idStr);
        if (selectedIds.includes(id)) return;
        const targetProd = products.find(p => sid(p.id) === id);
        if (!targetProd) return;

        let tCat = "";
        if (targetProd.idcategory) tCat = targetProd.idcategory;
        else if (targetProd.categoryid) tCat = targetProd.categoryid;

        const targetCat = sid(tCat);
        if (currentCategory && currentCategory !== targetCat) {
            alert("Chỉ so sánh các sản phẩm cùng danh mục.");
            return;
        }
        setSelectedIds(prev => [...prev, id]);
    };

    const handleRemoveProduct = id => {
        setSelectedIds(prev => prev.filter(item => item !== sid(id)));
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
        handleClearAll,
    };
}