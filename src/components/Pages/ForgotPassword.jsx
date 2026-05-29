import { useState } from "react";
import "./ForgotPassword.css";
import { Link } from 'react-router-dom';
function ForgotPassword({ onBackToforgot }) {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Gửi mã khôi phục đến:", email);
    setIsSent(true);
  };

  return (
    <div className="fg-container">
      <div className="forgot-box">
        <h2 className="title">Quên mật khẩu?</h2>

        {!isSent ? (
          <>
            <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "20px" }}>
              Nhập email của bạn vào đây, hệ thống sẽ gửi mã khôi phục ngay.
            </p>
            <form onSubmit={handleReset} className="form">
              <div className="input-group">
                <label className="label">Email đã đăng ký</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <button type="submit" className="btn-forgot">
                Gửi mã xác nhận
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h3 style={{ color: "#10b981", margin: "0 0 10px 0" }}>Kiểm tra email nhé!</h3>
            <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.5" }}>
              Chúng tôi đã gửi hướng dẫn lấy lại mật khẩu vào mail <br /><b>{email}</b>
            </p>
            <button
              className="btn-forgot"
              style={{ backgroundColor: "#10b981", marginTop: "15px" }}
              onClick={() => alert("Chuyển hướng mở tab Gmail...")}
            >
              Mở ứng dụng Mail
            </button>
          </div>
        )}

        {/* Nút Quay xe về Đăng nhập */}
        {/* <div className="footer">
          <span className="link" onClick={onBackToforgot} style={{ cursor: "pointer" }}>
            <i className="bi bi-arrow-left" style={{ marginRight: "6px" }}></i>
            Quay lại Đăng nhập
          </span>
        </div> */}
        <div className="footer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
  {/* Đổi span thành Link, xài 'to' thay vì 'onClick' */}
  <Link to="/login" className="link" style={{ textDecoration: "none", cursor: "pointer" }}>
    <i className="bi bi-arrow-left" style={{ marginRight: "6px" }}></i> 
    Quay lại Đăng nhập
  </Link>
  <Link to="/" className="link" style={{ textDecoration: "underline" }}>
    <i className="bi bi-house" style={{ marginRight: "6px" }}></i> Quay về trang chủ
  </Link>
</div>
      </div>
    </div>
  );
}

export default ForgotPassword;