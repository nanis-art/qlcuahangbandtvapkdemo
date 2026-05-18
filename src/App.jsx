import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ProductList from "./components/Products/ProductList";
import DetailProduct from "./components/Products/DetailProduct";
import Cart from "./components/Pages/Cart";
import Login from "./components/Pages/Login";
import Signup from "./components/Pages/Signup";
import ForgotPassword from "./components/Pages/ForgotPassword";
import Favorite from "./components/Pages/Favorites";
import Admin from "./components/Pages/Admin";
function App() {
  const location = useLocation();

  // Logic ẩn Header/Footer ở các trang login/signup/admin
  // const hideChrome =
  //   location.pathname === '/signup' ||
  //   location.pathname === '/admin' ||
  //   location.pathname === '/login';
  const hideChrome =
  location.pathname === '/admin';
  return (
    <>
      {/* Chỉ hiện Header nếu không thuộc danh sách hideChrome */}
      {!hideChrome && <Header />}
      <Routes>
        {/* Trang chủ và danh sách sản phẩm */}
        <Route path="/" element={<ProductList category="all" />} />
        <Route path="/products" element={<ProductList category="all" />} />

        {/* Giỏ hàng và Yêu thích */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorite />} />

        {/* Chi tiết sản phẩm */}
        <Route path="/product/:id" element={<DetailProduct />} />

        {/* Các trang thông tin khác */}
        <Route path="/promotions" element={<div>Khuyến mãi</div>} />
        <Route path="/about" element={<div>Về chúng tôi</div>} />

        {/* Xác thực người dùng */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        {/* Danh mục sản phẩm cụ thể */}
        <Route path="/dienthoai" element={<ProductList category="dienthoai" />} />
        <Route path="/may-tinh-bang" element={<ProductList category="tablet" />} />
        <Route path="/dong-ho-thong-minh" element={<ProductList category="smartwatch" />} />
        <Route path="/phu-kien" element={<ProductList category="accessory" />} />
      </Routes>
      {/* Chỉ hiện Footer nếu không thuộc danh sách hideChrome */}
      {!hideChrome && <Footer />}
    </>
  );
}

export default App;