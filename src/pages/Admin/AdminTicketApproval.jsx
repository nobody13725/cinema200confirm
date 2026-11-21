import React, { useEffect, useState } from "react";
import { dbService, subscribeDb } from "../../lib/supabaseClient.js";
import { isPastShowtime } from "../../utils/timeUtils.js";

const STATUS_BADGE = {
  pending: { label: "Chờ duyệt vé", className: "badge badge-amber" },
  confirmed: { label: "Đã duyệt · Tính là đã xem", className: "badge badge-green" },
  used: { label: "Đã soát vé · Đã xem", className: "badge badge-purple" },
  cancelled: { label: "Đã từ chối / Hủy vé", className: "badge badge-red" },
};

export default function AdminTicketApproval({ user, isFullAdmin }) {
  const [orders, setOrders] = useState([]);
  const [ticketQuery, setTicketQuery] = useState("");
  const [queueTab, setQueueTab] = useState("actionable"); // 'actionable' | 'pending' | 'confirmed' | 'used' | 'all'
  const [quickResult, setQuickResult] = useState(null);
  const [quickError, setQuickError] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const actorName = user?.fullName || user?.name || (isFullAdmin ? "Quản trị viên" : "Nhân viên rạp");

  const loadData = () => {
    const all = dbService.getOrders();
    setOrders(all);
    if (quickResult) {
      const updated = all.find((o) => o.id === quickResult.id);
      if (updated) setQuickResult(updated);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const showNotice = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    const q = ticketQuery.trim().toLowerCase();
    setQuickError("");
    if (!q) {
      setQuickResult(null);
      return setQuickError("Vui lòng nhập mã vé (ví dụ MVX-77410) hoặc số điện thoại khách hàng.");
    }
    const match = orders.find(
      (o) =>
        o.ticketCode?.toLowerCase() === q ||
        o.ticketCode?.toLowerCase().includes(q) ||
        o.phone === ticketQuery.trim()
    );
    if (!match) {
      setQuickResult(null);
      return setQuickError(`Không tìm thấy vé nào khớp với "${ticketQuery.trim()}".`);
    }
    setQuickResult(match);
  };

  const handleApproveTicket = (ord) => {
    const updated = dbService.updateOrderStatus(ord.id, "confirmed", actorName);
    if (updated && quickResult?.id === ord.id) setQuickResult(updated);
    showNotice(
      `Đã duyệt vé ${ord.ticketCode} (${ord.userName}) — Phim "${ord.filmTitle}" đã được tính là đã xem và mở quyền đánh giá!`
    );
  };

  const handleCheckInTicket = (ord) => {
    const updated = dbService.updateOrderStatus(ord.id, "used", actorName);
    if (updated && quickResult?.id === ord.id) setQuickResult(updated);
    showNotice(
      `Đã soát vé vào rạp cho mã ${ord.ticketCode} — Ghi nhận lịch sử xem phim "${ord.filmTitle}"!`
    );
  };

  const handleRejectTicket = (ord) => {
    if (isPastShowtime(ord.showtimeDate, ord.showtimeTime)) {
      window.alert("Không thể hủy/từ chối vé của suất chiếu đã diễn ra!");
      return;
    }
    if (!window.confirm(`Xác nhận từ chối / hủy vé ${ord.ticketCode}? Ghế đã đặt sẽ được mở lại.`)) {
      return;
    }
    const updated = dbService.updateOrderStatus(ord.id, "cancelled", actorName);
    if (updated && quickResult?.id === ord.id) setQuickResult(updated);
    showNotice(`Đã hủy vé ${ord.ticketCode} và giải phóng ghế.`);
  };

  const pendingList = orders.filter((o) => o.orderStatus === "pending");
  const confirmedList = orders.filter((o) => o.orderStatus === "confirmed");
  const usedList = orders.filter((o) => o.orderStatus === "used");

  const filteredQueue = orders.filter((o) => {
    if (queueTab === "actionable") return o.orderStatus === "pending" || o.orderStatus === "confirmed";
    if (queueTab === "pending") return o.orderStatus === "pending";
    if (queueTab === "confirmed") return o.orderStatus === "confirmed";
    if (queueTab === "used") return o.orderStatus === "used";
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Duyệt vé &amp; Soát vé tại rạp</h2>
          <p className="admin-subtitle">
            Kiểm tra mã vé QR, duyệt đơn đặt vé chờ xác nhận và soát vé check-in cho khách vào phòng chiếu
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
          {isFullAdmin ? "🛡️ Quản trị viên (Toàn quyền)" : "💼 Nhân viên rạp (Chỉ duyệt vé & kiểm duyệt)"}
        </div>
      </div>

      {!isFullAdmin && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            fontSize: 13,
            color: "#334155",
          }}
        >
          🔒 <strong>Phạm vi quyền Nhân viên:</strong> Bạn được phép <strong>Duyệt vé</strong>, <strong>Soát vé check-in</strong>, tra cứu đơn vé và kiểm duyệt bình luận. Các chức năng quản trị (Quản lý phim, rạp, phòng, suất chiếu, tài khoản, khuyến mãi, báo cáo doanh thu, xóa đơn hàng, cấu hình SVD &amp; CSDL) chỉ dành riêng cho Quản trị viên (Admin).
        </div>
      )}

      {alertMsg && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          ✓ {alertMsg}
        </div>
      )}

      {/* Thống kê nghiệp vụ duyệt vé (không lộ báo cáo doanh thu tài chính cho nhân viên) */}
      <div className="admin-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-title">Chờ duyệt vé</div>
          <div className="stat-number" style={{ color: "var(--amber-500)" }}>{pendingList.length}</div>
          <div className="stat-sub">Cần xác nhận hợp lệ</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Sẵn sàng check-in</div>
          <div className="stat-number" style={{ color: "var(--green-500)" }}>{confirmedList.length}</div>
          <div className="stat-sub">Đã duyệt · Chờ vào rạp</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đã soát vào rạp</div>
          <div className="stat-number" style={{ color: "var(--purple-500, #7c3aed)" }}>{usedList.length}</div>
          <div className="stat-sub">Hoàn tất check-in</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tổng lượt vé</div>
          <div className="stat-number" style={{ color: "var(--brand-600)" }}>{orders.length}</div>
          <div className="stat-sub">Toàn hệ thống</div>
        </div>
      </div>

      {/* Tra cứu & Duyệt mã vé nhanh */}
      <div className="admin-card" style={{ marginTop: 16, padding: 18 }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15.5 }}>🔍 Tra cứu &amp; Duyệt mã vé nhanh</h3>
        <form onSubmit={handleQuickLookup} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            className="input-control"
            style={{ flex: 1, minWidth: 240 }}
            placeholder="Nhập mã vé (ví dụ MVX-77410, MVX-88320) hoặc SĐT khách hàng..."
            value={ticketQuery}
            onChange={(e) => setTicketQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Kiểm tra vé
          </button>
          {quickResult && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setTicketQuery("");
                setQuickResult(null);
                setQuickError("");
              }}
            >
              Xóa kết quả
            </button>
          )}
        </form>

        {quickError && (
          <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 13, fontWeight: 500 }}>
            ⚠️ {quickError}
          </div>
        )}

        {quickResult && (
          <div
            style={{
              marginTop: 14,
              padding: 16,
              borderRadius: 10,
              border: "1px solid var(--brand-200)",
              background: "#f8fafc",
              display: "grid",
              gridTemplateColumns: "110px 1fr auto",
              gap: 16,
              alignItems: "center",
            }}
          >
            <img
              src={quickResult.ticketQrUrl}
              alt={quickResult.ticketCode}
              style={{ width: 104, height: 104, borderRadius: 8, background: "#fff", padding: 4, border: "1px solid #e2e8f0" }}
            />
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 16, color: "var(--brand-700)", fontFamily: "monospace" }}>
                  {quickResult.ticketCode}
                </strong>
                <span className={(STATUS_BADGE[quickResult.orderStatus] || { className: "badge badge-gray" }).className}>
                  {(STATUS_BADGE[quickResult.orderStatus] || { label: quickResult.orderStatus }).label}
                </span>
              </div>
              <div>
                <strong>{quickResult.filmTitle}</strong> · {quickResult.cinemaName} ({quickResult.roomName})
              </div>
              <div>
                Khách: <strong>{quickResult.userName}</strong> ({quickResult.phone || "—"}) · Ghế:{" "}
                <strong>{quickResult.seats?.map((s) => s.seatKey).join(", ")}</strong> · Suất:{" "}
                <strong>{quickResult.showtimeTime}</strong> ({quickResult.showtimeDate})
              </div>
              {(quickResult.approvedBy || quickResult.checkedInBy) && (
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                  {quickResult.approvedBy && <span>Duyệt bởi: {quickResult.approvedBy} · </span>}
                  {quickResult.checkedInBy && <span>Soát vé bởi: {quickResult.checkedInBy}</span>}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickResult.orderStatus === "pending" && (
                <button className="btn btn-primary btn-sm" onClick={() => handleApproveTicket(quickResult)}>
                  ✓ Duyệt vé hợp lệ
                </button>
              )}
              {quickResult.orderStatus === "confirmed" && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: "#059669" }}
                  onClick={() => handleCheckInTicket(quickResult)}
                >
                  🎫 Duyệt check-in vào rạp
                </button>
              )}
              {(quickResult.orderStatus === "pending" || quickResult.orderStatus === "confirmed") && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: "#b91c1c" }}
                  onClick={() => handleRejectTicket(quickResult)}
                >
                  ✕ Từ chối / Hủy vé
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bộ lọc hàng chờ duyệt */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        {[
          { key: "actionable", label: `Cần xử lý (${pendingList.length + confirmedList.length})` },
          { key: "pending", label: `Chờ duyệt vé (${pendingList.length})` },
          { key: "confirmed", label: `Chờ check-in (${confirmedList.length})` },
          { key: "used", label: `Đã soát (${usedList.length})` },
          { key: "all", label: `Tất cả (${orders.length})` },
        ].map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${queueTab === t.key ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setQueueTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bảng danh sách duyệt vé */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Khách hàng</th>
              <th>Phim &amp; Ghế</th>
              <th>Rạp &amp; Suất chiếu</th>
              <th>Trạng thái</th>
              <th>Người duyệt / Soát</th>
              <th style={{ textAlign: "right", width: 220 }}>Thao tác duyệt vé</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.map((ord) => {
              const badge = STATUS_BADGE[ord.orderStatus] || { label: ord.orderStatus, className: "badge badge-gray" };
              const isPast = isPastShowtime(ord.showtimeDate, ord.showtimeTime);
              return (
                <tr key={ord.id}>
                  <td>
                    <strong style={{ fontFamily: "monospace", color: "var(--brand-700)" }}>{ord.ticketCode}</strong>
                    <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{ord.paymentMethod}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.userName}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{ord.phone || "—"}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.filmTitle}</div>
                    <span className="badge badge-purple" style={{ marginTop: 3 }}>
                      Ghế: {ord.seats?.map((s) => s.seatKey).join(", ") || "—"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    <div>{ord.cinemaName}</div>
                    <div style={{ color: isPast ? "var(--red-500)" : "var(--ink-600)", fontWeight: 600 }}>
                      {ord.showtimeTime} · {ord.showtimeDate}
                    </div>
                  </td>
                  <td>
                    <span className={badge.className}>{badge.label}</span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-600)" }}>
                    {ord.checkedInBy
                      ? `Soát: ${ord.checkedInBy}`
                      : ord.approvedBy
                      ? `Duyệt: ${ord.approvedBy}`
                      : ord.cancelledBy
                      ? `Hủy: ${ord.cancelledBy}`
                      : "Chưa xử lý"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {ord.orderStatus === "pending" && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => handleApproveTicket(ord)}
                        >
                          ✓ Duyệt vé
                        </button>
                      )}
                      {ord.orderStatus === "confirmed" && (
                        <button
                          className="btn btn-sm"
                          style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", fontWeight: 600, padding: "5px 10px", fontSize: 12 }}
                          onClick={() => handleCheckInTicket(ord)}
                        >
                          🎫 Check-in
                        </button>
                      )}
                      {(ord.orderStatus === "pending" || ord.orderStatus === "confirmed") && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={isPast}
                          style={{ padding: "5px 9px", fontSize: 12, color: "#b91c1c", opacity: isPast ? 0.4 : 1 }}
                          onClick={() => handleRejectTicket(ord)}
                          title={isPast ? "Suất chiếu đã diễn ra" : "Từ chối / Hủy vé"}
                        >
                          ✕ Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredQueue.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
                  Không có vé nào trong danh mục này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
