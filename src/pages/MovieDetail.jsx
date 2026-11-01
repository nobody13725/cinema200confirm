import React, { useState, useEffect } from "react";
import { dbService, subscribeDb } from "../lib/supabaseClient.js";
import { FALLBACK_POSTER, FALLBACK_BACKDROP, handleImageError } from "../utils/imageFallback";

function buildDateStrip() {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dow = i === 0 ? "Hôm nay" : days[d.getDay()];
    const dm = `${d.getDate()}/${d.getMonth() + 1}`;
    out.push({ key, dow, dm });
  }
  return out;
}

// BUG_DTL_01: Kiểm tra suất chiếu đã qua giờ
export function isPastShowtime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const now = new Date();
  const currentYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr < currentYMD) return true;
  if (dateStr > currentYMD) return false;
  const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return timeStr <= currentHM;
}

export default function MovieDetail({ go, goBack, params, user }) {
  const [film, setFilm] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [commentContent, setCommentContent] = useState("");
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("Ngôn từ xúc phạm, thiếu văn hóa");
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const dates = buildDateStrip();
  // TC_DTL_03: Lịch chiếu mặc định theo ngày hiện tại
  const [activeDate, setActiveDate] = useState(dates[0].key);

  const loadData = () => {
    const films = dbService.getFilms();
    const found = films.find((f) => f.id === params?.id) || films[0];
    setFilm(found);
    setCinemas(dbService.getCinemas());
    setShowtimes(dbService.getShowtimes());
    if (found) {
      const allComments = dbService.getComments();
      setComments(allComments.filter((c) => c.filmId === found.id));
    }
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, [params?.id]);

  if (!film) return null;

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    dbService.addComment({
      userId: user?.id || `usr-${Date.now()}`,
      userName: user?.fullName || user?.name || "Khán giả Movix",
      filmId: film.id,
      filmTitle: film.title,
      rate: Number(userRating),
      content: commentContent.trim(),
    });

    setCommentContent("");
    setShowCommentForm(false);
  };

  const handleReportComment = (e) => {
    e.preventDefault();
    if (!reportModal) return;

    dbService.reportComment(
      reportModal.id,
      reportReason,
      user?.fullName || user?.name || "Người dùng ẩn danh"
    );
    alert("Đã gửi báo cáo vi phạm tới ban quản trị! Cảm ơn bạn.");
    setReportModal(null);
  };

  // TC_DTL_07 & TC_DTL_08: Chọn suất chiếu
  const handleSelectShowtime = (cinema, st) => {
    // BUG_DTL_01: Chặn chọn suất đã qua giờ
    if (isPastShowtime(activeDate, st.startTime)) {
      alert("Suất chiếu này đã bắt đầu hoặc kết thúc, không thể chọn đặt vé!");
      return;
    }

    // TC_DTL_06: Chặn suất hết vé
    const isSoldOut = (st.seatsBooked?.length || 0) >= (st.totalSeats || 96);
    if (isSoldOut) {
      alert("Suất chiếu này đã hết vé!");
      return;
    }

    // TC_DTL_07: Yêu cầu đăng nhập nếu chưa đăng nhập
    if (!user) {
      alert("Vui lòng đăng nhập tài khoản để tiếp tục chọn ghế và đặt vé!");
      go("login", {
        redirect: "seatSelect",
        redirectParams: {
          movieId: film.id,
          cinemaId: cinema.id,
          showtimeId: st.id,
          time: st.startTime,
          date: activeDate,
          promoCode: params?.promoCode,
        },
      });
      return;
    }

    // TC_DTL_08: Đã đăng nhập -> Chuyển đến trang chọn ghế của đúng suất
    go("seatSelect", {
      movieId: film.id,
      cinemaId: cinema.id,
      showtimeId: st.id,
      time: st.startTime,
      date: activeDate,
      promoCode: params?.promoCode,
    });
  };

  // Lọc các suất chiếu của phim này theo ngày đã chọn
  const filmShowtimes = showtimes.filter((st) => {
    if (st.filmId !== film.id) return false;
    if (st.date && st.date !== activeDate) return false;
    return true;
  });

  return (
    <section className="section container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => (typeof goBack === "function" ? goBack() : go("movies"))}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}
        >
          ← Quay lại
        </button>
        <div className="breadcrumb" style={{ margin: 0 }}>
          <button onClick={() => go("home")}>Trang chủ</button>
          <span className="sep">/</span>
          <button onClick={() => go("movies")}>Phim</button>
          <span className="sep">/</span>
          <span>{film.title}</span>
        </div>
      </div>

      {/* Hero Movie Detail (UC04, Figure 8) */}
      <div
        className="detail-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          background: film.backdropUrl
            ? `linear-gradient(to right, rgba(16, 17, 34, 0.95) 25%, rgba(20, 21, 43, 0.85) 60%, rgba(20, 21, 43, 0.75) 100%), url(${film.backdropUrl}) center/cover no-repeat`
            : `linear-gradient(to right, rgba(16, 17, 34, 0.95) 25%, rgba(20, 21, 43, 0.85) 60%, rgba(20, 21, 43, 0.75) 100%), url(${FALLBACK_BACKDROP}) center/cover no-repeat`,
        }}
      >
        <div
          className="detail-poster"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, var(--brand-700), var(--purple-600))",
            boxShadow: "0 16px 36px rgb(0, 0, 0)",
          }}
        >
          <img
            src={film.posterUrl || film.thumbnail || FALLBACK_POSTER}
            alt={film.title}
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, FALLBACK_POSTER)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              inset: 0,
            }}
          />
        </div>
        <div>
          <div className="rating-badge">⭐ {film.rating || 8.5} / 10</div>
          {/* TC_DTL_01: Tên phim hiển thị đúng */}
          <h1
            style={{
              color: "white",
              fontSize: "40px",
            }}
          >
            {film.title}
          </h1>
          <div className="detail-tags">
            <span className="tag">{film.ageRating || "T13"}</span>
            <span className="tag">{film.format || "2D, 3D"}</span>
            <span className="tag">{film.duration} phút</span>
            <span className="tag" style={{ background: "rgba(34,197,94,0.25)" }}>
              {film.status || "Đang chiếu"}
            </span>
          </div>
          <div className="detail-meta-row">
            <span>🎞️ Định dạng: {film.format || "2D, 3D, IMAX"}</span>
            <span>📅 Khởi chiếu: {film.releaseDate || "Đang chiếu"}</span>
          </div>
          <p className="detail-desc">{film.description}</p>

          {params?.promoCode && (
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(6px)",
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px dashed rgba(255,255,255,0.5)",
                color: "#fef08a",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span>🏷️</span> Đang kèm voucher: {params.promoCode}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                const el = document.getElementById("movie-showtimes-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              🎟️ Đặt vé theo suất chiếu
            </button>
            {/* TC_DTL_02: Xem trailer */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              onClick={() => setShowTrailerModal(true)}
            >
              ▶ Xem trailer
            </button>
          </div>
        </div>
      </div>

      {/* Lịch chiếu theo ngày trực tiếp trên trang chi tiết phim (TC_DTL_03 đến TC_DTL_08) */}
      <div id="movie-showtimes-section" className="card" style={{ marginTop: 28, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 18, margin: 0 }}>Lịch chiếu & Đặt vé: {film.title}</h3>
            <p style={{ fontSize: 13, color: "var(--ink-500)", margin: "4px 0 0" }}>
              Chọn ngày xem và khung giờ để chuyển đến sơ đồ chọn ghế
            </p>
          </div>
          <span className="badge badge-purple" style={{ padding: "4px 10px" }}>
            {film.format || "2D, 3D"} · {film.duration} phút
          </span>
        </div>

        {/* TC_DTL_04: Đổi ngày xem lịch chiếu */}
        <div className="date-strip" style={{ marginBottom: 20 }}>
          {dates.map((d) => (
            <button
              key={d.key}
              className={`date-chip ${activeDate === d.key ? "active" : ""}`}
              onClick={() => setActiveDate(d.key)}
            >
              <div className="dow">{d.dow}</div>
              <div>{d.dm}</div>
            </button>
          ))}
        </div>

        {/* Danh sách rạp & suất chiếu */}
        {(() => {
          if (filmShowtimes.length === 0) {
            return (
              <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--ink-500)" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
                <h4 style={{ color: "var(--ink-800)", marginBottom: 4 }}>Chưa có suất chiếu vào ngày đã chọn</h4>
                <p style={{ fontSize: 13.5 }}>
                  Vui lòng chọn ngày khác trên thanh ngày ở trên để xem các suất chiếu khả dụng.
                </p>
              </div>
            );
          }

          // Gom nhóm theo rạp
          const cinemaMap = {};
          filmShowtimes.forEach((st) => {
            if (!cinemaMap[st.cinemaId]) cinemaMap[st.cinemaId] = [];
            cinemaMap[st.cinemaId].push(st);
          });

          return Object.entries(cinemaMap).map(([cId, stList]) => {
            const cinema = cinemas.find((c) => c.id === cId) || { name: "Rạp Movix Cinema" };

            return (
              <div
                key={cId}
                style={{
                  border: "1px solid var(--ink-100)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 14,
                  background: "var(--ink-50)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink-900)", marginBottom: 10 }}>
                  🏢 {cinema.name}
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-500)", marginLeft: 8 }}>
                    {cinema.address}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {stList.map((st) => {
                    const past = isPastShowtime(activeDate, st.startTime);
                    const isSoldOut = (st.seatsBooked?.length || 0) >= (st.totalSeats || 96);

                    // TC_DTL_05: BUG_DTL_01 Suất chiếu đã qua giờ bị vô hiệu, làm mờ, không chọn được
                    // TC_DTL_06: Suất hết ghế hiển thị Hết vé, không chọn được
                    return (
                      <button
                        key={st.id}
                        type="button"
                        disabled={past || isSoldOut}
                        onClick={() => handleSelectShowtime(cinema, st)}
                        className={`time-pill ${past ? "disabled" : ""} ${isSoldOut ? "soldout" : ""}`}
                        style={{
                          opacity: past ? 0.4 : isSoldOut ? 0.6 : 1,
                          cursor: past || isSoldOut ? "not-allowed" : "pointer",
                          background: past ? "#e2e8f0" : isSoldOut ? "#fee2e2" : "white",
                          color: past ? "#94a3b8" : isSoldOut ? "#dc2626" : "var(--ink-900)",
                          border: past ? "1px solid #cbd5e1" : isSoldOut ? "1px solid #fecaca" : "1px solid var(--brand-300)",
                          textDecoration: past ? "line-through" : "none",
                          padding: "8px 14px",
                          borderRadius: 8,
                          display: "inline-flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 84,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                        title={
                          past
                            ? "Suất chiếu đã bắt đầu hoặc qua giờ, không thể chọn"
                            : isSoldOut
                            ? "Suất chiếu đã hết vé"
                            : `Giá: ${(st.basePrice || 80000).toLocaleString("vi-VN")}đ`
                        }
                      >
                        <span>{st.startTime}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                          {past ? "Đã qua giờ" : isSoldOut ? "Hết vé" : `${(st.basePrice || 80000) / 1000}k`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Grid: Thông tin chi tiết & Bình luận / Đánh giá */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
        {/* Box Thông tin */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Thông tin tác phẩm</h3>
          <div className="summary-row">
            <span>Thời lượng</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600 }}>{film.duration} phút</span>
          </div>
          <div className="summary-row">
            <span>Giới hạn tuổi</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600 }}>{film.ageRating || "P"}</span>
          </div>
          <div className="summary-row">
            <span>Hình thức chiếu</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600 }}>{film.format || "2D, 3D"}</span>
          </div>
          <div className="summary-row">
            <span>Diễn viên</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600, textAlign: "right" }}>
              {Array.isArray(film.actors) ? film.actors.join(", ") : film.actors || "Đang cập nhật"}
            </span>
          </div>
          <div className="summary-row">
            <span>Đạo diễn</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600 }}>
              {Array.isArray(film.directors) ? film.directors.join(", ") : film.directors || "Đang cập nhật"}
            </span>
          </div>
          <div className="summary-row">
            <span>Điểm trung bình</span>
            <span style={{ color: "var(--amber-500)", fontWeight: 700 }}>★ {film.rating}/10</span>
          </div>
        </div>

        {/* Box Đánh giá từ khán giả (UC04, Figure 9, UC17) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 16 }}>Đánh giá từ khán giả ({comments.length})</h3>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              {showCommentForm ? "Hủy" : "✍️ Viết đánh giá"}
            </button>
          </div>

          {/* Form thêm bình luận */}
          {showCommentForm && (
            <form
              onSubmit={handlePostComment}
              style={{
                background: "var(--ink-50)",
                padding: 14,
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid var(--ink-100)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Đánh giá số sao:</span>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--ink-100)",
                    fontWeight: 700,
                    color: "var(--amber-500)",
                  }}
                >
                  <option value={5}>★★★★★ 5 sao</option>
                  <option value={4}>★★★★☆ 4 sao</option>
                  <option value={3}>★★★☆☆ 3 sao</option>
                  <option value={2}>★★☆☆☆ 2 sao</option>
                  <option value={1}>★☆☆☆☆ 1 sao</option>
                </select>
              </div>

              <textarea
                required
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--ink-100)",
                  fontSize: 13.5,
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Gửi bình luận
                </button>
              </div>
            </form>
          )}

          {/* Danh sách bình luận */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {comments.map((c) => (
              <div className="review-row" key={c.id}>
                <div className="review-head" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="small-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {c.avatar ? (
                        <img src={c.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        (c.userName || "U").slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="review-name">{c.userName || "Khán giả"}</div>
                      <div className="review-stars">
                        {"★".repeat(c.rate || 5)}
                        {"☆".repeat(Math.max(0, 5 - (c.rate || 5)))}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11.5, color: "var(--ink-500)", padding: "2px 8px" }}
                    onClick={() => setReportModal(c)}
                    title="Báo cáo bình luận này"
                  >
                    🚩 Báo cáo
                  </button>
                </div>
                <p className="review-text">{c.content}</p>
                {c.report && (
                  <div style={{ fontSize: 11, color: "var(--red-500)", fontStyle: "italic", marginTop: 4 }}>
                    ⚠️ Bình luận này đang được ban quản trị xem xét báo cáo.
                  </div>
                )}
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ color: "var(--ink-500)", textAlign: "center", padding: 20, fontSize: 13.5 }}>
                Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên để lại cảm nhận!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal phát Trailer (TC_DTL_02) */}
      {showTrailerModal && (
        <div className="modal-overlay" onClick={() => setShowTrailerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, padding: 20, background: "#0b0f19" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ color: "white", fontSize: 16, margin: 0 }}>Trailer: {film.title}</h3>
              <button
                type="button"
                onClick={() => setShowTrailerModal(false)}
                style={{ background: "none", border: "none", color: "white", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
              {film.trailer ? (
                <iframe
                  title={`Trailer ${film.title}`}
                  src={
                    film.trailer.includes("watch?v=")
                      ? film.trailer.replace("watch?v=", "embed/")
                      : film.trailer.includes("youtu.be/")
                      ? film.trailer.replace("youtu.be/", "www.youtube.com/embed/")
                      : film.trailer
                  }
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  Đang chuẩn bị video trailer chất lượng cao...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Báo cáo bình luận vi phạm UC17 */}
      {reportModal && (
        <div className="modal-overlay" onClick={() => setReportModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h3>🚩 Báo cáo bình luận vi phạm</h3>
            <p style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 4 }}>
              Nội dung vi phạm sẽ được gửi tới Ban quản trị kiểm duyệt và xử lý theo quy định Movix.
            </p>

            <form onSubmit={handleReportComment} style={{ marginTop: 16 }}>
              <label className="form-label">Lý do báo cáo *</label>
              <select
                className="input-control"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Ngôn từ xúc phạm, thiếu văn hóa">Ngôn từ xúc phạm, thiếu văn hóa</option>
                <option value="Tiết lộ nội dung phim (Spoiler)">Tiết lộ nội dung phim (Spoiler)</option>
                <option value="Spam quảng cáo hoặc link độc hại">Spam quảng cáo hoặc link độc hại</option>
                <option value="Nội dung quấy rối hoặc sai sự thật">Nội dung quấy rối hoặc sai sự thật</option>
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReportModal(null)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: "var(--red-500)" }}>
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
