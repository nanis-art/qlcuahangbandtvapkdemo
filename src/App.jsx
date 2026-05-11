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

function App() {
  const location = useLocation();
  const hideChrome = 
  // location.pathname ==='/login'||
  location.pathname ==='/signup'||
  location.pathname ==='/admin';
  return (
    <>
    {!hideChrome && <Header/>}
    <Routes>
  <Route path="/" element={<ProductList category="all" />} />
  <Route path="/products" element={<ProductList category="all" />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/product/:id" element={<DetailProduct />} />
  <Route path="/promotions" element={<div>Khuyến mãi</div>} />
  <Route path="/about" element={<div>Về chúng tôi</div>} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/ForgotPassword" element={<ForgotPassword />} />

  <Route path="/dienthoai" element={<ProductList category="dienthoai" />} />
  <Route path="/may-tinh-bang" element={<ProductList category="tablet" />} />
  <Route path="/dong-ho-thong-minh" element={<ProductList category="smartwatch" />} />
  <Route path="/phu-kien" element={<ProductList category="accessory" />} />
</Routes>
      {!hideChrome && <Footer/>}
    </>
  );
}

export default App; 