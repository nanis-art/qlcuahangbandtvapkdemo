import React, { useState, useEffect } from "react";
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
import Admin from "./components/Admin/Admin";
import Banner from "./components/Banner/Banner";
import ProductCompare from "./components/Products/ProductCompare";
import Profile from "./components/Pages/Profile";
import Home from "./components/Pages/Home";
import "./App.css";

function App() {
  const location = useLocation();
  const hideChrome =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/ForgotPassword" ||
    location.pathname.startsWith("/admin");
  return (
    <>
      {!hideChrome && <Header />}
      <Routes>
        <Route path="/" element={<><Banner /><Home /></>} />
        <Route path="/products" element={<><Banner /><ProductList category="all" /></>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorite />} />
        <Route path="/product/:id" element={<DetailProduct />} />
        <Route path="/promotions" element={<div>Khuyến mãi</div>} />
        <Route path="/about" element={<div>Về chúng tôi</div>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/compare" element={<ProductCompare />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/bill" element={<Admin />} />
        <Route path="/admin/category" element={<Admin />} />
        <Route path="/admin/customer" element={<Admin />} />
        <Route path="/admin/employee" element={<Admin />} />
        <Route path="/admin/invoicedetails" element={<Admin />} />
        <Route path="/admin/product" element={<Admin />} />

        <Route path="/dienthoai" element={<ProductList category="dienthoai" />} />
        <Route path="/may-tinh-bang" element={<ProductList category="tablet" />} />
        <Route path="/dong-ho-thong-minh" element={<ProductList category="smartwatch" />} />
        <Route path="/phu-kien" element={<ProductList category="accessory" />} />
      </Routes>

      {!hideChrome && <Footer />}
    </>
  );
}

export default App;