import { useState } from "react";
import { Link } from 'react-router-dom';
import "./Signup.css";
function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    agreed: false
  });

  // Hàm xử lý khi gõ phím, tự động cập nhật đúng ô đang gõ
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    console.log("Dữ liệu đăng ký:", formData);
    alert("Đăng ký thành công!");
  };

  return (
    <div className="signup-container">
      <div className="signup-box">


        <h2 className="title">Đăng ký tài khoản</h2>

        <form onSubmit={handleSignup} className="form-grid">
          {/* Hàng 1: Cột 1 & Cột 2 */}
          <div className="input-group">
            <label>Họ và tên</label>
            <input type="text" name="fullName" placeholder="VD: Nguyễn Văn A" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Ngày sinh</label>
            <input type="date" name="dob" onChange={handleChange} required />
          </div>

          {/* Hàng 2: Tràn viền */}
          <div className="input-group full-width">
            <label>Email</label>
            <input type="email" name="email" placeholder="example@gmail.com" onChange={handleChange} required />
          </div>

          {/* Hàng 3: Cột 1 & Cột 2 */}
          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Xác nhận mật khẩu</label>
            <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
          </div>

          {/* Hàng 5: Tràn viền */}
          <div className="input-group full-width">
            <label>Địa chỉ</label>
            <input type="text" name="address" placeholder="Nhập địa chỉ giao hàng..." onChange={handleChange} required />
          </div>

          {/* Hàng 6: Checkbox điều khoản */}
          <div className="full-width terms-box">
            <input type="checkbox" name="agreed" id="terms" onChange={handleChange} required />
            <label htmlFor="terms">
              Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>.
            </label>
          </div>

          {/* Nút Đăng ký */}
          <button type="submit" className="btn-submit full-width">
            Đăng ký
          </button>
        </form>

        {/* Cụm Đăng nhập Google & Link Đăng nhập */}
        <div className="footer-actions">
          <button type="button" className="btn-google">
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>G</span> Đăng ký bằng Google
          </button>

          {/* <div className="login-link-su">
            Đã có tài khoản? <a href="/Login">Đăng nhập</a>
          </div> */}
          <div className="login-link-su">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;