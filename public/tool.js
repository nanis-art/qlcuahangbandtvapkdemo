import fs from 'fs';

// Đường dẫn file của ní (để cùng chỗ với tool.js nha)
const fileName = 'products.json';

console.log("⏳ Đang dùng pháp thuật phân loại để buff giá gốc, đợi xíu nha ní...");

try {
  // 1. Mở kho lấy data
  const rawData = fs.readFileSync(fileName, 'utf-8');
  const products = JSON.parse(rawData);

  // 2. Chạy bùa buff giá tùy theo loại hàng
  const updatedProducts = products.map((item) => {
    let fakeOriginalPrice = null;

    if (item.currentPrice) {
      // Nhóm 1: Thiết bị chính (Điện thoại, Tablet, Watch) -> Giá gốc cao hơn tầm 15%
      if ([1, 2, 3].includes(item.idcategory)) {
        fakeOriginalPrice = Math.round((item.currentPrice * 1.15) / 10000) * 10000;
      }
      // Nhóm 2: Phụ kiện xịn (Tai nghe, Sạc, SmartHome, Hub) -> Giá gốc cao hơn tầm 30%
      else if ([4, 5, 10, 11].includes(item.idcategory)) {
        fakeOriginalPrice = Math.round((item.currentPrice * 1.30) / 10000) * 10000;
      }
      // Nhóm 3: Phụ kiện siêu lợi nhuận (Ốp lưng, Cường lực) -> Giá gốc gấp đôi
      else if ([6].includes(item.idcategory)) {
          fakeOriginalPrice = Math.round((item.currentPrice * 2) / 10000) * 10000;
      }
      // Các nhóm còn lại (như Dịch vụ - id 12): Không tính sale, giá gốc = giá bán
      else {
          fakeOriginalPrice = null;
      }
    }

    return {
      ...item,
      // Nét chấm phá nè: nếu file JSON đã có originalPrice rồi thì giữ, không có thì xài số fake vừa tính.
      // Nếu giá gốc bằng y xì giá bán (hoặc rỗng) thì xóa luôn trường này.
      originalPrice: item.originalPrice || fakeOriginalPrice
    };
  });

  // 3. Đóng gói cất vào kho lại, format ngay ngắn
  fs.writeFileSync(fileName, JSON.stringify(updatedProducts, null, 2), 'utf-8');

  console.log(`✅ Khét lẹt! Đã thêm giá gốc siêu thực cho ${updatedProducts.length} sản phẩm rồi nha! 💸`);

} catch (error) {
  console.error("❌ Cứu cứu, có lỗi xảy ra:", error.message);
}

const updateCartCount = () => {
  // 1. Lấy giỏ hàng từ kho (nhớ là "card" chữ d cho khớp với file Cart của ní nha)
  const savedCart = localStorage.getItem("card");

  if (!savedCart) {
    setCartCount(0);
  } else {
    try {
      const cart = JSON.parse(savedCart);

      // 2. Đây chính là đoạn code "đếm lại" id và quantity này:
      // Nó cộng dồn tất cả field quantity của từng món lại với nhau
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

      setCartCount(totalItems);
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng:", error);
      setCartCount(0);
    }
  }
};