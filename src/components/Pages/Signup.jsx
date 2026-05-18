import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    agreed: false
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = formData.email.trim();
    const trimmedPass = formData.password.trim();
    const trimmedConfirm = formData.confirmPassword.trim();

    if (trimmedPass !== trimmedConfirm) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (trimmedPass.length < 3) {
      setError("Mật khẩu tối thiểu 3 ký tự");
      return;
    }

    if (!formData.agreed) {
      setError("Bạn chưa đồng ý với điều khoản dịch vụ");
      return;
    }

    try {
      await axios.post("/api/register", {
        user: trimmedEmail,
        pass: trimmedPass,
        fullName: formData.fullName,
        dob: formData.dob,
        address: formData.address
      });
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 404 ? "Chỉ hoạt động khi chạy npm run dev (API ghi file)." : null) ||
        "Đã xảy ra lỗi, vui lòng thử lại sau";
      setError(msg);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="title">Đăng ký tài khoản</h2>
        <form onSubmit={handleSignup} className="form-grid">
          <div className="input-group">
            <label>Họ và tên</label>
            <input type="text" name="fullName" placeholder="VD: Nguyễn Văn A" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Ngày sinh</label>
            <input type="date" name="dob" onChange={handleChange} required />
          </div>

          <div className="input-group full-width">
            <label>Email</label>
            <input type="text" name="email" placeholder="example@gmail.com" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Xác nhận mật khẩu</label>
            <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className="input-group full-width">
            <label>Địa chỉ</label>
            <input type="text" name="address" placeholder="Nhập địa chỉ giao hàng..." onChange={handleChange} required />
          </div>

          <div className="full-width terms-box">
            <input type="checkbox" name="agreed" id="terms" onChange={handleChange} />
            <label htmlFor="terms">
              Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>.
            </label>
          </div>

          {error && <div className="full-width" style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>{error}</div>}

          <button type="submit" className="btn-submit full-width">
            Đăng ký
          </button>
        </form>

        <div className="footer-actions">
          <button type="button" className="btn-google">
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>G</span> Đăng ký bằng Google
          </button>

          <div className="login-link-su">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;