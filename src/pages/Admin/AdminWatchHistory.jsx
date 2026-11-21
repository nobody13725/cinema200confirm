import React, { useEffect, useState } from "react";
import { dbService, subscribeDb } from "../../lib/supabaseClient.js";

export default function AdminWatchHistory({ isFullAdmin }) {
  const [history, setHistory] = useState([]);
  const [films, setFilms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filmFilter, setFilmFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all"); // all | reviewed | unreviewed

  const loadData = () => {
    setHistory(dbService.getAllWatchHistory());
    setFilms(dbService.getFilms());
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const filtered = history.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.userName?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.ticketCode?.toLowerCase().includes(q) ||
      item.filmTitle?.toLowerCase().includes(q);
    const matchFilm = filmFilter === "all" || item.filmId === filmFilter;
    const matchReview =
      reviewFilter === "all" ||
      (reviewFilter === "reviewed" && Boolean(item.review)) ||
      (reviewFilter === "unreviewed" && !item.review);
    return matchSearch && matchFilm && matchReview;
  });

  const uniqueViewersCount = new Set(
    history.map((h) => h.userId || h.email || h.phone || h.userName).filter(Boolean)
  ).size;
  const reviewedCount = history.filter((h) => Boolean(h.review)).length;
  const checkedInCount = history.filter((h) => h.orderStatus === "used").length;

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Lịch sử người xem phim</h2>
          <p className="admin-subtitle">
            Danh sách khán giả đã được tính là đã xem phim (sau khi nhân viên duyệt vé hoặc soát vé check-in) và trạng thái đánh giá
          </p>
        </div>
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            background: isFullAdmin ? "#eef2ff" : "#f5f3ff",
            color: isFullAdmin ? "#3730a3" : "#6d28d9",
            border: `1px solid ${isFullAdmin ? "#c7d2fe" : "#ddd6fe"}`,
          }}
        >
          {isFullAdmin ? "🛡️ Quản trị viên" : "💼 Nhân viên rạp"}
        </div>
      </div>

      {/* Thẻ thống kê lượt xem (không chứa doanh thu để bảo mật với tài khoản nhân viên) */}
      <div className="admin-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-title">Tổng lượt đã xem</div>
          <div className="stat-number" style={{ color: "var(--brand-600)" }}>{history.length}</div>
          <div className="stat-sub">Vé đã duyệt hoặc check-in</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Khán giả đã xem</div>
          <div className="stat-number" style={{ color: "#059669" }}>{uniqueViewersCount}</div>
          <div className="stat-sub">Tài khoản đủ quyền đánh giá</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đã soát vào rạp</div>
          <div className="stat-number" style={{ color: "#7c3aed" }}>{checkedInCount}</div>
          <div className="stat-sub">Hoàn tất check-in tại quầy</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đã gửi đánh giá</div>
          <div className="stat-number" style={{ color: "var(--amber-500)" }}>{reviewedCount}</div>
          <div className="stat-sub">Đánh giá từ người đã xem</div>
        </div>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <div className="admin-card" style={{ marginTop: 16, padding: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          className="input-control"
          style={{ flex: 1, minWidth: 220 }}
          placeholder="Tìm theo tên khán giả, SĐT, mã vé hoặc tên phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="input-control"
          style={{ width: 220 }}
          value={filmFilter}
          onChange={(e) => setFilmFilter(e.target.value)}
        >
          <option value="all">Tất cả phim</option>
          {films.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
        <select
          className="input-control"
          style={{ width: 190 }}
          value={reviewFilter}
          onChange={(e) => setReviewFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái đánh giá</option>
          <option value="reviewed">Đã viết đánh giá</option>
          <option value="unreviewed">Chưa viết đánh giá</option>
        </select>
      </div>

      {/* Bảng lịch sử người xem phim */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người xem phim</th>
              <th>Bộ phim &amp; Ghế</th>
              <th>Rạp &amp; Suất chiếu</th>
              <th>Mã vé &amp; Duyệt vé</th>
              <th>Thời gian ghi nhận</th>
              <th>Đánh giá của người xem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const seatText = Array.isArray(item.seats)
                ? item.seats.map((s) => s.seatKey || s).join(", ")
                : "—";
              return (
                <tr key={item.orderId}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink-900)" }}>{item.userName}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {item.phone || item.email || "Thành viên Movix"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.filmTitle}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Ghế: {seatText}</div>
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    <div>{item.cinemaName}</div>
                    <div style={{ color: "var(--ink-500)" }}>
                      {item.showtimeTime} · {item.showtimeDate}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--brand-700)" }}>
                      #{item.ticketCode}
                    </div>
                    <span
                      className={`badge ${item.orderStatus === "used" ? "badge-purple" : "badge-green"}`}
                      style={{ marginTop: 3 }}
                    >
                      {item.orderStatus === "used" ? "Đã check-in · Đã xem" : "Đã duyệt vé · Đã xem"}
                    </span>
                    {(item.checkedInBy || item.approvedBy) && (
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>
                        Bởi: {item.checkedInBy || item.approvedBy}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--ink-600)" }}>
                    {item.watchedAt ? new Date(item.watchedAt).toLocaleString("vi-VN") : "—"}
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    {item.review ? (
                      <div>
                        <span style={{ color: "var(--amber-500)", fontWeight: 700, fontSize: 13 }}>
                          {"★".repeat(item.review.rate || 5)} ({item.review.rate}/5)
                        </span>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--ink-600)",
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={item.review.content}
                        >
                          {item.review.content}
                        </div>
                      </div>
                    ) : (
                      <span className="badge badge-gray">Đủ quyền · Chưa đánh giá</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
                  Chưa có lượt xem phim nào khớp với điều kiện lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
