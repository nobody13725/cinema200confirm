import React, { useState, useEffect } from "react";
import { dbService, subscribeDb } from "../../lib/supabaseClient.js";
import { isPastShowtime } from "../../utils/timeUtils.js";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  const loadData = () => {
    setOrders(dbService.getOrders());
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    // TC_ORD_10: Không cho phép hủy vé của suất chiếu đã diễn ra
    if (newStatus === "cancelled") {
      if (isPastShowtime(order.showtimeDate, order.showtimeTime)) {
        alert("Không thể hủy vé của suất chiếu đã diễn ra!");
        return;
      }
      if (!window.confirm(`Xác nhận hủy đơn hàng ${order.ticketCode}? Ghế sẽ được hoàn trả về trạng thái trống.`)) {
        return;
      }
    }

    dbService.updateOrderStatus(id, newStatus);
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
    setActionAlert(`Đã cập nhật trạng thái đơn ${order.ticketCode} sang ${newStatus === "cancelled" ? "Đã hủy" : "Đã sử dụng"} thành công!`);
    setTimeout(() => setActionAlert(null), 3500);
  };

  const handleDeleteOrder = (id, ticketCode) => {
    // TC_ORD_11: Xóa đơn hàng
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng ${ticketCode}? Hành động này không thể hoàn tác.`)) {
      dbService.deleteOrder(id);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
      setActionAlert(`Đã xóa đơn hàng ${ticketCode} khỏi hệ thống.`);
      setTimeout(() => setActionAlert(null), 3500);
    }
  };

  // Lọc danh sách đơn hàng
  const filteredOrders = orders.filter((o) => {
    // TC_ORD_03: Lọc theo trạng thái
    if (filterStatus !== "all" && o.orderStatus !== filterStatus) return false;
    
    // TC_ORD_04: Lọc theo ngày suất chiếu hoặc ngày tạo đơn
    if (filterDate) {
      const matchShowDate = o.showtimeDate === filterDate;
      const matchCreateDate = o.createdAt?.startsWith(filterDate);
      if (!matchShowDate && !matchCreateDate) return false;
    }

    // TC_ORD_01 & TC_ORD_02: Tìm kiếm theo mã vé, tên khách, tên phim, rạp
    const q = search.trim().toLowerCase();
    if (q) {
      const matchTicket = o.ticketCode?.toLowerCase().includes(q);
      const matchUser = o.userName?.toLowerCase().includes(q) || o.phone?.includes(q);
      const matchFilm = o.filmTitle?.toLowerCase().includes(q);
      const matchCinema = o.cinemaName?.toLowerCase().includes(q);
      if (!matchTicket && !matchUser && !matchFilm && !matchCinema) return false;
    }

    return true;
  });

  // Thống kê số lượng
  const confirmedCount = orders.filter((o) => o.orderStatus === "confirmed").length;
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const usedCount = orders.filter((o) => o.orderStatus === "used").length;
  const cancelledCount = orders.filter((o) => o.orderStatus === "cancelled").length;

  // TC_ORD_12: Doanh thu khớp tổng các đơn đã thanh toán (confirmed + used)
  const totalRevenueAll = orders
    .filter((o) => o.orderStatus === "confirmed" || o.orderStatus === "used")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const filteredRevenue = filteredOrders
    .filter((o) => o.orderStatus === "confirmed" || o.orderStatus === "used")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className="badge badge-green">Đã thanh toán</span>;
      case "pending":
        return <span className="badge badge-amber">Chờ thanh toán</span>;
      case "used":
        return <span className="badge badge-purple">Đã sử dụng</span>;
      case "cancelled":
        return <span className="badge badge-red">Đã hủy / Hoàn vé</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Quản lý đặt vé & đơn hàng</h2>
          <p className="admin-subtitle">Danh sách vé đã đặt, kiểm tra mã vé, soát vé & xử lý hoàn/hủy vé (UC19)</p>
        </div>
      </div>

      {actionAlert && (
        <div style={{ padding: "10px 16px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: 8, marginTop: 12, fontWeight: 500, fontSize: 13.5 }}>
          ✓ {actionAlert}
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="admin-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-title">Doanh thu đã thu</div>
          <div className="stat-number" style={{ color: "var(--brand-600)", fontSize: 20 }}>
            {totalRevenueAll.toLocaleString("vi-VN")}đ
          </div>
          <div className="stat-trend positive">Vé confirmed & used</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đã thanh toán (Sẵn sàng)</div>
          <div className="stat-number" style={{ color: "var(--green-500)" }}>{confirmedCount}</div>
          <div className="stat-sub">Sắp chiếu / Chờ xem</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Chờ thanh toán</div>
          <div className="stat-number" style={{ color: "var(--amber-500)" }}>{pendingCount}</div>
          <div className="stat-sub">Đang giữ chỗ</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đã sử dụng (Check-in)</div>
          <div className="stat-number" style={{ color: "var(--purple-500, #7c3aed)" }}>{usedCount}</div>
          <div className="stat-sub">Đã soát tại rạp</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đã hủy / Hoàn tiền</div>
          <div className="stat-number" style={{ color: "var(--red-500)" }}>{cancelledCount}</div>
          <div className="stat-sub">Đã giải phóng ghế</div>
        </div>
      </div>

      {/* Filter Bar with Search, Status, and Date */}
      <div className="admin-card" style={{ marginTop: 16, padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>
              Tìm kiếm (Mã vé, Khách hàng, Tên phim...)
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="🔍 Ví dụ: MVX-92813 hoặc Avatar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ width: 170 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>
              Trạng thái đơn hàng
            </label>
            <select
              className="input-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="confirmed">Đã thanh toán (Sắp chiếu)</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="used">Đã sử dụng (Đã soát)</option>
              <option value="cancelled">Đã hủy / Hoàn tiền</option>
            </select>
          </div>

          <div style={{ width: 160 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>
              Lọc theo ngày chiếu
            </label>
            <input
              type="date"
              className="input-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
              setFilterDate("");
            }}
          >
            ↺ Đặt lại
          </button>
        </div>

        {/* TC_ORD_12: Doanh thu theo kết quả lọc */}
        {(filterStatus !== "all" || filterDate || search) && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--ink-50)", borderRadius: 6, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              Kết quả lọc: <strong>{filteredOrders.length}</strong> đơn hàng
              {filterDate && <span> | Ngày: <strong>{filterDate}</strong></span>}
            </span>
            <span>
              Tổng doanh thu kết quả lọc: <strong style={{ color: "var(--brand-600)" }}>{filteredRevenue.toLocaleString("vi-VN")}đ</strong>
            </span>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Bộ phim</th>
              <th>Ghế ngồi</th>
              <th>Suất chiếu</th>
              <th>Rạp & Phòng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right", width: 140 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((ord) => {
              const isPast = isPastShowtime(ord.showtimeDate, ord.showtimeTime);

              return (
                <tr key={ord.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--brand-600)", fontFamily: "monospace" }}>
                      {ord.ticketCode}
                    </span>
                    <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{ord.paymentMethod}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.userName || "Khách vãng lai"}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{ord.phone || "—"}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{ord.filmTitle}</td>
                  <td>
                    <span className="badge badge-purple">
                      {ord.seats?.map((s) => s.seatKey).join(", ") || "Chưa chọn"}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{ord.showtimeTime}</div>
                    <div style={{ fontSize: 11.5, color: isPast ? "var(--red-500)" : "var(--ink-500)" }}>
                      {ord.showtimeDate} {isPast && "(Đã diễn ra)"}
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--ink-700)" }}>
                    <div>{ord.cinemaName}</div>
                    <div style={{ color: "var(--ink-500)" }}>{ord.roomName}</div>
                  </td>
                  <td>
                    <strong style={{ color: "var(--ink-900)" }}>
                      {(ord.totalAmount || 0).toLocaleString("vi-VN")}đ
                    </strong>
                  </td>
                  <td>{getStatusBadge(ord.orderStatus)}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        className="icon-action-btn view"
                        title="Xem chi tiết & QR vé"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        👁️
                      </button>
                      
                      {/* TC_ORD_06: Soát vé */}
                      {ord.orderStatus === "confirmed" && (
                        <button
                          className="icon-action-btn"
                          title="Đánh dấu đã soát vé (Sử dụng)"
                          onClick={() => handleUpdateStatus(ord.id, "used")}
                          style={{ background: "var(--green-100)", color: "#197a55" }}
                        >
                          ✓
                        </button>
                      )}

                      {/* TC_ORD_07, TC_ORD_10: Hủy vé */}
                      {ord.orderStatus === "confirmed" && (
                        <button
                          className="icon-action-btn delete"
                          title={isPast ? "Không thể hủy vé vì suất chiếu đã diễn ra" : "Hủy vé / Hoàn tiền"}
                          disabled={isPast}
                          style={{ opacity: isPast ? 0.35 : 1, cursor: isPast ? "not-allowed" : "pointer" }}
                          onClick={() => handleUpdateStatus(ord.id, "cancelled")}
                        >
                          ✕
                        </button>
                      )}

                      {/* TC_ORD_11: Xóa đơn hàng */}
                      <button
                        className="icon-action-btn delete"
                        title="Xóa đơn hàng vĩnh viễn"
                        onClick={() => handleDeleteOrder(ord.id, ord.ticketCode)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 36, color: "var(--ink-500)" }}>
                  Không tìm thấy đơn đặt vé nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chi tiết vé & QR Code (UC19, TC_ORD_05, TC_ORD_14) */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "1px dashed var(--ink-100)" }}>
              <span className="badge badge-purple" style={{ marginBottom: 8 }}>VÉ ĐIỆN TỬ CHÍNH THỨC</span>
              <h3 style={{ fontSize: 20, color: "var(--brand-600)", fontFamily: "monospace" }}>
                {selectedOrder.ticketCode}
              </h3>
              <div style={{ marginTop: 12 }}>
                <img
                  src={selectedOrder.ticketQrUrl}
                  alt="QR Code Vé"
                  style={{ width: 140, height: 140, margin: "0 auto", borderRadius: 8, border: "2px solid var(--ink-100)", padding: 4 }}
                />
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>
                Quét mã này tại cửa rạp chiếu để check-in vào phòng
              </p>
            </div>

            <div style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-700)" }}>
              <p><strong>Khách hàng:</strong> {selectedOrder.userName} ({selectedOrder.phone || "—"})</p>
              <p><strong>Phim:</strong> {selectedOrder.filmTitle}</p>
              <p><strong>Rạp chiếu:</strong> {selectedOrder.cinemaName}</p>
              <p><strong>Phòng chiếu:</strong> {selectedOrder.roomName}</p>
              <p>
                <strong>Suất chiếu:</strong> {selectedOrder.showtimeTime} ngày {selectedOrder.showtimeDate}{" "}
                {isPastShowtime(selectedOrder.showtimeDate, selectedOrder.showtimeTime) && (
                  <span style={{ color: "var(--red-500)", fontWeight: 600 }}>(Đã qua giờ chiếu)</span>
                )}
              </p>
              <p>
                <strong>Ghế ngồi:</strong>{" "}
                <span style={{ fontWeight: 700, color: "var(--brand-600)" }}>
                  {selectedOrder.seats?.map((s) => `${s.seatKey} (${s.type || "Ghế thường"})`).join(", ")}
                </span>
              </p>
              {selectedOrder.comboFoods?.length > 0 && (
                <p>
                  <strong>Bắp nước:</strong>{" "}
                  {selectedOrder.comboFoods.map((c) => `${c.quantity}x ${c.name}`).join(", ")}
                </p>
              )}
              {selectedOrder.promotionCode && (
                <p>
                  <strong>Mã giảm giá:</strong> {selectedOrder.promotionCode} (-{(selectedOrder.discountAmount || 0).toLocaleString("vi-VN")}đ)
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--ink-100)" }}>
                <span><strong>Tổng tiền thanh toán:</strong></span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--brand-600)" }}>
                  {(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <p><strong>Phương thức:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              <p><strong>Trạng thái vé:</strong> {getStatusBadge(selectedOrder.orderStatus)}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
              {selectedOrder.orderStatus === "confirmed" && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: "var(--red-500)" }}
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, "cancelled");
                  }}
                >
                  ✕ Hủy / Hoàn vé
                </button>
              )}
              
              <button className="btn btn-outline btn-sm" onClick={handlePrintTicket}>
                🖨️ In vé
              </button>

              <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setSelectedOrder(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
