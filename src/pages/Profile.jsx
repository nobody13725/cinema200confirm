import React, { useState, useEffect } from "react";
import { dbService, subscribeDb } from "../lib/supabaseClient.js";

function formatVnd(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

const STATUS_LABEL = {
  confirmed: "Đã duyệt · Đã xem",
  paid: "Đã duyệt · Đã xem",
  used: "Đã soát vé · Đã xem",
  pending: "Chờ nhân viên duyệt",
  cancelled: "Đã hủy",
};

export default function Profile({ go, user, onLogout, params }) {
  const [tab, setTab] = useState(params?.tab || "history"); // history | watched | info | password | reviews
  const [orders, setOrders] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [allOrdersCount, setAllOrdersCount] = useState(0);

  useEffect(() => {
    if (params?.tab) {
      setTab(params.tab);
    }
  }, [params?.tab]);

  // Form thông tin cá nhân (TC_PRF_01 đến TC_PRF_05)
  const [info, setInfo] = useState({
    name: user?.fullName || user?.name || "",
    email: user?.email || user?.identity || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "🧑",
  });
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");

  // Form đổi mật khẩu (TC_PRF_06 đến TC_PRF_08)
  const [pwdData, setPwdData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const loadData = () => {
    if (!user) {
      setOrders([]);
      setComments([]);
      return;
    }
    const allOrders = dbService.getOrders();
    const allComments = dbService.getComments();
    setAllOrdersCount(allOrders.length);

    // Phân quyền & Cô lập dữ liệu: Chỉ hiển thị vé của chính tài khoản này
    const userOrders = allOrders.filter((o) => {
      if (o.userId && user.id && o.userId === user.id) return true;
      if (user.email && o.email && o.email.toLowerCase() === user.email.toLowerCase()) return true;
      if (user.phone && o.phone && o.phone === user.phone) return true;
      if (user.fullName && o.userName && o.userName.trim().toLowerCase() === user.fullName.trim().toLowerCase()) return true;
      return false;
    });

    // Chỉ hiển thị bình luận / đánh giá do chính người dùng này gửi
    const userComments = allComments.filter((c) => {
      if (c.userId && user.id && c.userId === user.id) return true;
      if (user.fullName && c.userName && c.userName.trim().toLowerCase() === user.fullName.trim().toLowerCase()) return true;
      if (user.username && c.userName && c.userName.trim().toLowerCase() === user.username.trim().toLowerCase()) return true;
      return false;
    });

    setOrders(userOrders);
    setWatchHistory(dbService.getUserWatchHistory(user));
    setComments(userComments);
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, [user]);

  if (!user) {
    return (
      <section className="section container">
        <div className="empty-state">
          <h3>Bạn chưa đăng nhập</h3>
          <p>Đăng nhập để xem thông tin cá nhân và lịch sử vé đã đặt trên Movix.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => go("login", { redirect: "profile" })}
          >
            Đăng nhập ngay
          </button>
        </div>
      </section>
    );
  }

  // TC_PRF_02, TC_PRF_03, TC_PRF_04: Cập nhật thông tin cá nhân
  function saveInfo(e) {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess("");

    // TC_PRF_03: Để trống họ tên
    const cleanName = (info.name || "").trim();
    if (!cleanName) {
      return setInfoError("Vui lòng nhập họ và tên");
    }

    // TC_PRF_04: Số điện thoại sai định dạng (09ab12)
    const cleanPhone = (info.phone || "").trim();
    if (cleanPhone && !/^0\d{9}$/.test(cleanPhone)) {
      return setInfoError("Số điện thoại không hợp lệ (gồm 10 chữ số bắt đầu bằng 0)");
    }

    if (user.id) {
      dbService.updateUser(user.id, {
        fullName: cleanName,
        phone: cleanPhone,
        avatar: info.avatar,
      });
      user.fullName = cleanName;
      user.phone = cleanPhone;
      user.avatar = info.avatar;
    }

    setInfoSuccess("Lưu thành công, thông tin họ tên đã được cập nhật!");
    setTimeout(() => setInfoSuccess(""), 3000);
  }

  // TC_PRF_06, TC_PRF_08: Đổi mật khẩu
  function handleChangePassword(e) {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!pwdData.oldPassword) {
      return setPwdError("Vui lòng nhập mật khẩu cũ");
    }

    // TC_PRF_08: Mật khẩu cũ sai
    if (pwdData.oldPassword !== user.password) {
      return setPwdError("Mật khẩu cũ không đúng");
    }

    if (!pwdData.newPassword) {
      return setPwdError("Vui lòng nhập mật khẩu mới");
    }

    if (pwdData.newPassword.length < 6) {
      return setPwdError("Mật khẩu mới phải có tối thiểu 6 ký tự");
    }

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return setPwdError("Mật khẩu xác nhận không khớp");
    }

    // Lưu mật khẩu mới
    if (user.id) {
      dbService.updateUser(user.id, { password: pwdData.newPassword });
      user.password = pwdData.newPassword;
    }

    setPwdSuccess("Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới này cho lần đăng nhập sau.");
    setPwdData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  }

  // TC_PRF_10, TC_PRF_11: Hủy vé trước giờ chiếu và hoàn trả ghế
  function handleCancelTicket(order) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowHM = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;

    // TC_PRF_11: Kiểm tra xem suất chiếu đã diễn ra hay chưa
    const isPast =
      order.showtimeDate < todayStr ||
      (order.showtimeDate === todayStr && order.showtimeTime <= nowHM);

    if (isPast) {
      alert("Suất chiếu đã diễn ra, không thể hủy vé!");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn hủy vé "${order.ticketCode}" (${order.filmTitle})? Toàn bộ ghế sẽ được hoàn trả về trạng thái trống.`
      )
    ) {
      dbService.updateOrderStatus(order.id, "cancelled");
      alert("Đã hủy vé thành công! Ghế đã được hoàn trả về trạng thái trống.");
    }
  }

  const isShowtimePast = (order) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowHM = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
    return (
      order.showtimeDate < todayStr ||
      (order.showtimeDate === todayStr && order.showtimeTime <= nowHM)
    );
  };

  const avatarOptions = ["🧑", "👩", "👨", "🍿", "🎬", "⭐", "🕶️", "🚀"];

  return (
    <section className="section container">
      <div className="section-head">
        <h2>Tài khoản thành viên</h2>
      </div>

      <div className="profile-grid">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="avatar-circle" style={{ margin: "0 auto 12px", fontSize: 32 }}>
            {info.avatar || (user.fullName || user.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <h3 style={{ fontSize: 16 }}>{user.fullName || user.name}</h3>
          {/* TC_PRF_01: Email hiển thị và không cho sửa */}
          <p className="movie-meta" style={{ marginBottom: 8 }}>
            {user.email || user.identity}
          </p>
          <span
            className="badge badge-purple"
            style={{
              marginBottom: 18,
              background: user.role === "admin" ? "var(--brand-700)" : user.role === "employee" ? "var(--purple-600)" : "var(--brand-50)",
              color: user.role === "admin" || user.role === "employee" ? "#fff" : "var(--brand-700)",
              fontWeight: 700,
            }}
          >
            {user.role === "admin"
              ? "🛡️ Quản trị viên (Admin)"
              : user.role === "employee"
              ? "💼 Nhân viên Movix"
              : "👤 Thành viên Movix"}
          </span>

          <div className="side-menu">
            <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
              🎟️ Lịch sử vé ({orders.length})
            </button>
            <button className={tab === "watched" ? "active" : ""} onClick={() => setTab("watched")}>
              🎬 Lịch sử đã xem ({watchHistory.length})
            </button>
            <button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>
              👤 Thông tin cá nhân
            </button>
            <button className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
              🔒 Đổi mật khẩu
            </button>
            <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}>
              ⭐ Đánh giá của tôi ({comments.length})
            </button>
          </div>

          {(user.role === "admin" || user.role === "employee") && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--ink-100)" }}>
              <button
                className="btn btn-primary btn-sm btn-block"
                style={{ fontWeight: 700 }}
                onClick={() => go("admin")}
              >
                ⚡ Đến Bảng Quản trị
              </button>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm btn-block" onClick={onLogout}>
              Đăng xuất
            </button>
          </div>
        </div>

        <div>
          {/* Lịch sử đặt vé (TC_PRF_09, TC_PRF_10, TC_PRF_11) */}
          {tab === "history" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 16, margin: 0 }}>Lịch sử vé của tôi ({orders.length})</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => go("showtimes")}>
                  + Đặt vé mới
                </button>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-500)" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎟️</div>
                  <div style={{ fontWeight: 600, color: "var(--ink-800)", marginBottom: 4 }}>
                    Chưa có vé nào thuộc tài khoản này
                  </div>
                  <p style={{ fontSize: 13.5 }}>
                    Mỗi vé được đặt sẽ hiển thị ở đây với đầy đủ thông tin phim, suất, ghế, tổng tiền và mã vé QR.
                  </p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => go("movies")}>
                    Khám phá phim đang chiếu
                  </button>
                </div>
              ) : (
                orders.map((b) => {
                  const seatList = Array.isArray(b.seats)
                    ? b.seats.map((s) => s.seatKey || s).join(", ")
                    : b.seats || "Ghế";

                  const isCancelled = b.orderStatus === "cancelled";
                  const past = isShowtimePast(b);

                  return (
                    <div
                      className="ticket-card"
                      key={b.id}
                      style={{
                        marginBottom: 14,
                        opacity: isCancelled ? 0.65 : 1,
                        borderLeft: isCancelled ? "4px solid var(--red-500)" : "4px solid var(--green-500)",
                      }}
                    >
                      <div
                        className="ticket-poster"
                        style={{
                          background: isCancelled ? "#fee2e2" : "var(--brand-50)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 26,
                        }}
                      >
                        {isCancelled ? "✕" : "🎬"}
                      </div>
                      <div className="ticket-info">
                        <div className="title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {b.filmTitle || "Phim"}
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-600)", fontFamily: "monospace" }}>
                            #{b.ticketCode}
                          </span>
                        </div>
                        <div className="meta">
                          {b.cinemaName} ({b.roomName}) · {b.showtimeDate || "Hôm nay"} · {b.showtimeTime}
                          <br />
                          Ghế: <strong style={{ color: "var(--ink-900)" }}>{seatList}</strong> ·{" "}
                          <span style={{ color: isCancelled ? "var(--red-500)" : "var(--green-500)", fontWeight: 700 }}>
                            {formatVnd(b.totalAmount)}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        <span
                          className={`badge ${isCancelled ? "badge-red" : b.orderStatus === "pending" ? "badge-amber" : "badge-green"}`}
                          style={{ display: "inline-block" }}
                        >
                          {STATUS_LABEL[b.orderStatus] || STATUS_LABEL[b.status] || "Đã duyệt · Đã xem"}
                        </span>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {!isCancelled && b.ticketQrUrl && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 12, padding: "4px 8px" }}
                              onClick={() =>
                                go("bookingSuccess", {
                                  ticketCode: b.ticketCode,
                                  ticketQrUrl: b.ticketQrUrl,
                                  movieTitle: b.filmTitle,
                                  cinema: b.cinemaName,
                                  room: b.roomName,
                                  time: b.showtimeTime,
                                  seats: seatList,
                                  total: b.totalAmount,
                                })
                              }
                            >
                              Xem mã QR
                            </button>
                          )}

                          {(b.orderStatus === "confirmed" || b.orderStatus === "used") && b.filmId && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 12, padding: "4px 8px", whiteSpace: "nowrap", color: "#15803d", borderColor: "#bbf7d0", background: "#f0fdf4" }}
                              onClick={() => go("movie", { id: b.filmId, openReview: true })}
                              title="Vé đã được duyệt · Xem chi tiết & viết đánh giá phim"
                            >
                              ✍️ Đánh giá phim
                            </button>
                          )}

                          {/* TC_PRF_10 & TC_PRF_11: Hủy vé trước giờ chiếu */}
                          {!isCancelled && (
                            past ? (
                              <span style={{ fontSize: 11, color: "var(--ink-400)", fontStyle: "italic" }}>
                                Đã qua giờ chiếu (Không thể hủy)
                              </span>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: 12, padding: "4px 8px", color: "var(--red-500)", borderColor: "#fecaca", whiteSpace: "nowrap" }}
                                onClick={() => handleCancelTicket(b)}
                              >
                                ✕ Hủy vé
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Lịch sử phim đã xem của người dùng (Chỉ ghi nhận khi vé đã được nhân viên duyệt hoặc soát vào rạp) */}
          {tab === "watched" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, margin: 0 }}>Lịch sử phim đã xem ({watchHistory.length})</h3>
                  <p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: "4px 0 0" }}>
                    Phim tự động được tính là đã xem sau khi nhân viên duyệt vé hoặc soát vé vào rạp. Chỉ phim đã xem mới đủ điều kiện viết đánh giá.
                  </p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => go("movies")}>
                  🎬 Xem phim khác
                </button>
              </div>

              {watchHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--ink-500)" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🍿</div>
                  <div style={{ fontWeight: 600, color: "var(--ink-800)", marginBottom: 4 }}>
                    Bạn chưa có bộ phim nào trong lịch sử đã xem
                  </div>
                  <p style={{ fontSize: 13.5 }}>
                    Đặt vé xem phim và đợi nhân viên duyệt vé để ghi nhận lịch sử xem phim &amp; mở khóa quyền đánh giá.
                  </p>
                </div>
              ) : (
                watchHistory.map((w) => {
                  const seatList = Array.isArray(w.seats)
                    ? w.seats.map((s) => s.seatKey || s).join(", ")
                    : w.seats || "—";
                  return (
                    <div
                      className="ticket-card"
                      key={w.orderId}
                      style={{ marginBottom: 12, borderLeft: "4px solid #10b981" }}
                    >
                      <div
                        className="ticket-poster"
                        style={{
                          background: "var(--brand-50)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {w.posterUrl && w.posterUrl.startsWith("http") ? (
                          <img src={w.posterUrl} alt={w.filmTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "🎬"
                        )}
                      </div>
                      <div className="ticket-info">
                        <div className="title" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span>{w.filmTitle}</span>
                          <span className="badge badge-green" style={{ fontSize: 11 }}>
                            {w.orderStatus === "used" ? "✓ Đã check-in tại rạp" : "✓ Vé đã được duyệt"}
                          </span>
                        </div>
                        <div className="meta">
                          Mã vé: <strong>#{w.ticketCode}</strong> · {w.cinemaName} ({w.roomName})
                          <br />
                          Suất: {w.showtimeDate} · {w.showtimeTime} · Ghế: <strong>{seatList}</strong>
                          {(w.checkedInBy || w.approvedBy) && (
                            <>
                              <br />
                              <span style={{ color: "var(--ink-500)" }}>
                                Xác nhận bởi: <strong>{w.checkedInBy || w.approvedBy}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        <span style={{ fontSize: 11.5, color: "var(--ink-500)" }}>
                          Ghi nhận: {w.watchedAt ? new Date(w.watchedAt).toLocaleDateString("vi-VN") : "—"}
                        </span>
                        {w.review ? (
                          <div style={{ textAlign: "right" }}>
                            <span className="badge badge-purple" style={{ display: "inline-block" }}>
                              ★ Đã đánh giá ({w.review.rate}/5)
                            </span>
                            <div>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 12, padding: "2px 6px", marginTop: 4 }}
                                onClick={() => go("movie", { id: w.filmId })}
                              >
                                Xem chi tiết phim
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 12, padding: "5px 10px", whiteSpace: "nowrap" }}
                            onClick={() => go("movie", { id: w.filmId, openReview: true })}
                          >
                            ✍️ Đánh giá phim ngay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Cập nhật thông tin cá nhân (TC_PRF_01 đến TC_PRF_05) */}
          {tab === "info" && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 18 }}>Cập nhật thông tin tài khoản</h3>
              <form onSubmit={saveInfo}>
                {/* TC_PRF_05: Chọn ảnh đại diện */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Chọn biểu tượng Avatar</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                    {avatarOptions.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setInfo({ ...info, avatar: av })}
                        style={{
                          fontSize: 22,
                          width: 42,
                          height: 42,
                          borderRadius: 8,
                          border: info.avatar === av ? "2px solid var(--brand-600)" : "1px solid var(--ink-200)",
                          background: info.avatar === av ? "var(--brand-50)" : "white",
                          cursor: "pointer",
                        }}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    value={info.name}
                    onChange={(e) => {
                      setInfo({ ...info, name: e.target.value });
                      setInfoError("");
                    }}
                    placeholder="Nhập họ và tên..."
                  />
                </div>

                {/* TC_PRF_01: Email hiển thị và không cho sửa */}
                <div className="form-group">
                  <label>Email đăng ký (Tài khoản - Không thể thay đổi)</label>
                  <input value={info.email} disabled style={{ opacity: 0.65, cursor: "not-allowed", background: "var(--ink-50)" }} />
                </div>

                {/* TC_PRF_04: Số điện thoại */}
                <div className="form-group">
                  <label>Số điện thoại liên hệ</label>
                  <input
                    value={info.phone}
                    onChange={(e) => {
                      setInfo({ ...info, phone: e.target.value });
                      setInfoError("");
                    }}
                    placeholder="Nhập số điện thoại (vd: 0912345678)"
                  />
                </div>

                {infoError && (
                  <div role="alert" style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    ✕ {infoError}
                  </div>
                )}

                {infoSuccess && (
                  <div style={{ marginBottom: 12, padding: "8px 12px", background: "#f0fdf4", color: "#15803d", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    ✓ {infoSuccess}
                  </div>
                )}

                <button className="btn btn-primary" type="submit">
                  Lưu thông tin
                </button>
              </form>
            </div>
          )}

          {/* Đổi mật khẩu (TC_PRF_06, TC_PRF_07, TC_PRF_08) */}
          {tab === "password" && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 18 }}>Đổi mật khẩu tài khoản</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    value={pwdData.oldPassword}
                    onChange={(e) => {
                      setPwdData({ ...pwdData, oldPassword: e.target.value });
                      setPwdError("");
                    }}
                    placeholder="Nhập mật khẩu hiện tại..."
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input
                    type="password"
                    value={pwdData.newPassword}
                    onChange={(e) => {
                      setPwdData({ ...pwdData, newPassword: e.target.value });
                      setPwdError("");
                    }}
                    placeholder="Tối thiểu 6 ký tự..."
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    value={pwdData.confirmPassword}
                    onChange={(e) => {
                      setPwdData({ ...pwdData, confirmPassword: e.target.value });
                      setPwdError("");
                    }}
                    placeholder="Nhập lại mật khẩu mới..."
                  />
                </div>

                {pwdError && (
                  <div role="alert" style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    ✕ {pwdError}
                  </div>
                )}

                {pwdSuccess && (
                  <div style={{ marginBottom: 12, padding: "8px 12px", background: "#f0fdf4", color: "#15803d", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    ✓ {pwdSuccess}
                  </div>
                )}

                <button className="btn btn-primary" type="submit">
                  Xác nhận đổi mật khẩu
                </button>
              </form>
            </div>
          )}

          {/* Đánh giá của tôi */}
          {tab === "reviews" && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 18 }}>Lịch sử đánh giá phim của bạn ({comments.length})</h3>
              {comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--ink-500)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
                  <div style={{ fontWeight: 600, color: "var(--ink-800)", marginBottom: 4 }}>
                    Chưa có đánh giá nào từ bạn
                  </div>
                  <p style={{ fontSize: 13.5 }}>
                    Hãy xem phim và để lại bình luận tại trang chi tiết phim để tích luỹ thêm điểm thưởng thành viên.
                  </p>
                </div>
              ) : (
                comments.map((c) => (
                  <div className="review-row" key={c.id}>
                    <div className="review-head" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => c.filmId && go("movie", { id: c.filmId })}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          fontWeight: 700,
                          color: "var(--brand-700)",
                          cursor: c.filmId ? "pointer" : "default",
                          textAlign: "left",
                        }}
                      >
                        {c.filmTitle || "Phim Movix"}
                      </button>
                      <span className="review-stars">{"★".repeat(c.rate || 5)} ({c.rate || 5}/5)</span>
                    </div>
                    <p className="review-text">{c.content}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "var(--ink-400)", marginTop: 4 }}>
                      <span>Đăng ngày: {new Date(c.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
                      {c.filmId && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "2px 8px", fontSize: 11.5 }}
                          onClick={() => go("movie", { id: c.filmId })}
                        >
                          Xem phim →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
