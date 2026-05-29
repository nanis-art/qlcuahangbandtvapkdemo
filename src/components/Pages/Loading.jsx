import "./Loading.css";

function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Đang tải dữ liệu...</p>
    </div>
  );
}

export default Loading;