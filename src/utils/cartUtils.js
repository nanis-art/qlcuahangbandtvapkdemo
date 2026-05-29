export const isEligibleItem = (itemName, applicableBrands) => {
    if (!applicableBrands || applicableBrands.length === 0) return true;
    const nameLower = itemName.toLowerCase();
    return applicableBrands.some(brand => nameLower.includes(brand.toLowerCase()));
  };

  export const getEligibleSubTotal = (cartItems, selectedIds, brands) => {
    return cartItems.reduce((acc, item) => {
      if (selectedIds.includes(item.id) && isEligibleItem(item.name, brands)) {
        const price = parseFloat(String(item.currentPrice).replace(/[^\d]/g, "")) || 0;
        return acc + price * item.quantity;
      }
      return acc;
    }, 0);
  };

  export const calculateCartTotals = (cartItems, selectedIds, appliedVoucher) => {
    let subTotal = 0;
    let eligibleSub = 0;
    let shippingFee = selectedIds.length > 0 ? 30000 : 0;

    cartItems.forEach(item => {
      if (selectedIds.includes(item.id)) {
        const price = parseFloat(String(item.currentPrice).replace(/[^\d]/g, "")) || 0;
        subTotal += price * item.quantity;

        if (appliedVoucher && isEligibleItem(item.name, appliedVoucher.applicableBrands)) {
          eligibleSub += price * item.quantity;
        }
      }
    });

    let productDiscount = 0;
    let shippingDiscount = 0;

    if (appliedVoucher && eligibleSub >= appliedVoucher.minOrderValue) {
      if (appliedVoucher.type === "freeship") {
        shippingDiscount = Math.min(shippingFee, appliedVoucher.value || appliedVoucher.maxDiscount);
      } else if (appliedVoucher.type === "fixed") {
        productDiscount = Math.min(subTotal, appliedVoucher.value);
      } else if (appliedVoucher.type === "percent") {
        productDiscount = eligibleSub * (appliedVoucher.value / 100);
        if (appliedVoucher.maxDiscount && productDiscount > appliedVoucher.maxDiscount) {
          productDiscount = appliedVoucher.maxDiscount;
        }
      }
    }

    const finalTotal = Math.max(0, subTotal - productDiscount) + Math.max(0, shippingFee - shippingDiscount);

    return {
      subTotal,
      shippingFee,
      productDiscount,
      shippingDiscount,
      finalTotal
    };
  };