import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError("Không được để trống email và mật khẩu");
      return;
    }

    try {
      const response = await fetch("/account.json");
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu tài khoản");
      }

      const accounts = await response.json();

      const matchedAccount = accounts.find(acc => {
        const accUser = String(acc.user || "")
          .trim()
          .toLowerCase();
        const accEmail = String(acc.email || "")
          .trim()
          .toLowerCase();
        const accPass = String(acc.pass || "").trim();
        return (accUser === trimmedEmail.toLowerCase() || accEmail === trimmedEmail.toLowerCase()) && accPass === trimmedPass;
      });

      if (!matchedAccount) {
        setError("Sai tài khoản hoặc mật khẩu");
        return;
      }

      const publicInfo = { ...matchedAccount };
      delete publicInfo.pass;
      localStorage.setItem("currentUser", JSON.stringify(publicInfo));

      window.dispatchEvent(new Event("userUpdated"));

      if (matchedAccount.role === "staff" || matchedAccount.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi, vui lòng thử lại sau");
    }
  };

  const handleGoogleLogin = () => {
    alert("Chưa có API Google thật đâu nha!");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="title">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="form">
          <div className="input-group">
            <label className="label">Email / Username</label>
            <input type="text" placeholder="Nhập email hoặc username..." value={email} onChange={e => setEmail(e.target.value)} className="input" />
          </div>
          <div className="input-group">
            <label className="label">Mật khẩu</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input" />
            <Link to="/ForgotPassword" className="link">
              Quên mật khẩu?
            </Link>
          </div>

          {error && <div style={{ color: "red", fontSize: "14px", marginBottom: "10px", marginTop: "-10px" }}>{error}</div>}

          <button type="submit" className="btn-Login">
            Đăng nhập
          </button>
        </form>

        <button type="button" onClick={handleGoogleLogin} className="btn-google">
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>G</span> Đăng nhập bằng Google
        </button>

        <div className="footer">
          Chưa có tài khoản?{" "}
          <Link to="/signup" className="link">
            Đăng ký
          </Link>
          <div style={{ marginTop: "15px" }}>
            <Link to="/" className="link" style={{ textDecoration: "underline" }}>
              <i className="bi bi-arrow-left"></i> Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
