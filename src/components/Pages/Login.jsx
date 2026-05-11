import { useState } from "react";
import "./Login.css";
import { Link } from 'react-router-dom';
function Login() {
  // 1. Quản lý trạng thái (State) cho các ô nhập liệu
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2. Hàm xử lý khi bấm nút Đăng nhập
  const handleLogin = (e) => {
    e.preventDefault(); // Ngăn trang bị load lại
    console.log("Dữ liệu đăng nhập:", { email, password });
    alert("Đang xử lý đăng nhập...");
  };

  // 3. Hàm xử lý Đăng nhập bằng Google
  const handleGoogleLogin = () => {
    alert("Chuyển hướng sang Google Login...");
  };

  return (
    <div className="login-container">
      <div className="login-box">


        <h2 className="title">Đăng nhập</h2>

        <form onSubmit={handleLogin} className="form">
          {/* Ô Gmail */}
          <div className="input-group">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          {/* Ô Mật khẩu */}
          <div className="input-group">
            <label className="label">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
            {/* <a href="/ForgotPassword" className="link">Quên mật khẩu?</a> */}
          <Link to="/ForgotPassword" className="link">Quên mật khẩu?</Link>
          </div>

          {/* Nút Đăng nhập chính */}
          <button type="submit" className="btn-Login">
            Đăng nhập
          </button>
        </form>

        {/* Nút Đăng nhập bằng Google */}

        <button type="button" onClick={handleGoogleLogin} className="btn-google">
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>G</span> Đăng nhập bằng Google
        </button>

        {/* Link chuyển sang trang Đăng ký */}
        <div className="footer">
          Chưa có tài khoản? <Link to="/signup" className="link">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;