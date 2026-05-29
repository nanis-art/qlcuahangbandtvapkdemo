
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Profile = () => {
  
  const navigate = useNavigate();
  const [user] = useState(() => readStoredUser());
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [delPass, setDelPass] = useState('');
  const [delErr, setDelErr] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [navigate, user]);

  const clearPasswordForm = () => {
    setCurPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr('');
    setPwMsg('');
    const c = curPass.trim();
    const n1 = newPass.trim();
    const n2 = confirmPass.trim();

    if (!c || !n1) {
      setPwErr('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.');
      return;
    }
    if (n1 !== n2) {
      setPwErr('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    if (n1.length < 3) {
      setPwErr('Mật khẩu mới phải có tối thiểu 3 ký tự.');
      return;
    }

    try {
      const { data } = await axios.post('/api/change-password', {
        id: user.id,
        currentPass: c,
        newPass: n1,
      });
      setPwMsg(data.message || 'Đổi mật khẩu thành công.');
      clearPasswordForm();
    } catch (err) {
      setPwMsg('');
      setPwErr(
        err.response?.data?.error ||
        'Không thể đổi mật khẩu. Vui lòng thử lại sau.'
      );
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDelErr('');
    const p = delPass.trim();

    if (!p) {
      setDelErr('Vui lòng nhập mật khẩu để xác nhận xóa.');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      await axios.post('/api/delete-account', {
        id: user.id,
        password: p,
      });
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new Event('userUpdated'));
      navigate('/', { replace: true });
    } catch (err) {
      setDelErr(
        err.response?.data?.error ||
        'Không thể xóa tài khoản. Vui lòng thử lại sau.'
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header-area">
        <h1 className="profile-title">Hồ sơ của bạn</h1>
        <p className="profile-subtitle">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="profile-grid">
        
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-icon-wrapper blue-icon">
              <i className="bi bi-person"></i>
            </div>
            <h2 className="profile-card-title">Thông tin cá nhân</h2>
          </div>
          <div className="profile-card-body">
            <div className="info-row">
              <span className="info-label">Tên đăng nhập</span>
              <span className="info-value">{user.user || '-'}</span>
            </div>
            {user.name && (
              <div className="info-row">
                <span className="info-label">Tên hiển thị</span>
                <span className="info-value">{user.name}</span>
              </div>
            )}
            {user.role && (
              <div className="info-row">
                <span className="info-label">Vai trò</span>
                <span className="info-value badge-role">{user.role}</span>
              </div>
            )}
            {user.id != null && (
              <div className="info-row">
                <span className="info-label">Mã tài khoản</span>
                <span className="info-value code-value">#{user.id}</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-icon-wrapper indigo-icon">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h2 className="profile-card-title">Đổi mật khẩu</h2>
          </div>
          <div className="profile-card-body">
            <form className="profile-form" onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={curPass}
                  onChange={(e) => setCurPass(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu mới"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              {pwErr && <div className="alert-box error-alert"><i className="bi bi-exclamation-circle"></i> {pwErr}</div>}
              {pwMsg && <div className="alert-box success-alert"><i className="bi bi-check-circle"></i> {pwMsg}</div>}

              <button type="submit" className="btn-primary">
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </div>

        <div className="profile-card danger-zone">
          <div className="profile-card-header">
            <div className="profile-icon-wrapper red-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2 className="profile-card-title text-danger">Xóa tài khoản</h2>
          </div>
          <div className="profile-card-body">
            <p className="danger-description">
              Hành động này sẽ xóa vĩnh viễn tài khoản của bạn khỏi hệ thống. Vui lòng nhập mật khẩu để xác nhận.
            </p>
            <form className="profile-form" onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input danger-input"
                  placeholder="Nhập mật khẩu để xác nhận"
                  value={delPass}
                  onChange={(e) => setDelPass(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {delErr && <div className="alert-box error-alert"><i className="bi bi-exclamation-circle"></i> {delErr}</div>}

              <button type="submit" className="btn-danger">
                Xóa tài khoản
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;