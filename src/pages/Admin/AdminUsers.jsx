import React, { useState, useEffect } from "react";
import { dbService, subscribeDb } from "../../lib/supabaseClient.js";

export default function AdminUsers({ initialRoleFilter = "all" }) {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(initialRoleFilter === "employee" ? "employees" : (initialRoleFilter === "customer" ? "customers" : "all"));
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState("");
  const [actionAlert, setActionAlert] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    role: "customer",
    position: "Khách hàng thân thiết",
    password: "",
    status: "Hoạt động",
    address: "",
  });

  const loadData = () => {
    setUsers(dbService.getUsers());
    setOrders(dbService.getOrders());
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormError("");
    setFormData({
      username: "",
      fullName: "",
      email: "",
      phone: "",
      role: activeTab === "employees" ? "employee" : "customer",
      position: activeTab === "employees" ? "Nhân viên bán vé & soát vé" : "Khách hàng thân thiết",
      password: "",
      status: "Hoạt động",
      address: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormError("");
    setFormData({
      username: u.username || "",
      fullName: u.fullName || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "customer",
      position: u.position || (u.role === "admin" ? "Quản trị viên" : u.role === "employee" ? "Nhân viên rạp" : "Khách hàng"),
      password: "",
      status: u.status || "Hoạt động",
      address: u.address || "",
    });
    setShowModal(true);
  };

  const handleToggleLock = (u) => {
    const action = u.status === "Tạm khóa" ? "mở khóa" : "tạm khóa";
    if (window.confirm(`Bạn có chắc muốn ${action} tài khoản "${u.fullName || u.username}"?`)) {
      dbService.toggleLockUser(u.id);
      setActionAlert(`Đã ${action} tài khoản ${u.email} thành công.`);
      setTimeout(() => setActionAlert(null), 3000);
    }
  };

  const handleDelete = (u) => {
    // TC_CUS_05: Xóa khách hàng đã có vé -> chặn và thông báo
    try {
      if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${u.fullName || u.username}"?`)) {
        dbService.deleteUser(u.id);
        setActionAlert(`Đã xóa tài khoản ${u.email} khỏi hệ thống.`);
        setTimeout(() => setActionAlert(null), 3000);
      }
    } catch (err) {
      alert(err.message || "Không thể xóa khách hàng đã có lịch sử đặt vé trên hệ thống!");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError("");

    const isEmp = formData.role === "employee" || formData.role === "admin";

    // TC_CUS_02, TC_EMP_02: Họ và tên
    if (!formData.fullName.trim()) {
      setFormError(isEmp ? "Vui lòng nhập họ tên nhân viên!" : "Vui lòng nhập họ và tên khách hàng!");
      return;
    }

    // TC_CUS_03: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError("Email không đúng định dạng!");
      return;
    }

    // TC_CUS_04, TC_EMP_04: Trùng email
    const duplicate = users.find(
      (u) =>
        u.email?.trim().toLowerCase() === formData.email.trim().toLowerCase() &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (duplicate) {
      setFormError(isEmp ? "Email nhân viên đã tồn tại!" : "Email này đã được sử dụng bởi tài khoản khác!");
      return;
    }

    // TC_EMP_05: Phone format
    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");
      if (!/^\d{10}$/.test(cleanPhone)) {
        setFormError("Số điện thoại không hợp lệ (cần đúng 10 chữ số)!");
        return;
      }
    }

    // TC_EMP_03, TC_EMP_12: Mật khẩu khi tạo mới nhân viên
    if (!editingUser && isEmp) {
      if (!formData.password || formData.password.length < 8) {
        setFormError("Mật khẩu cho nhân viên phải có ít nhất 8 ký tự!");
        return;
      }
    }

    if (editingUser) {
      dbService.updateUser(editingUser.id, {
        fullName: formData.fullName.trim(),
        username: formData.username.trim() || formData.email.split("@")[0],
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        position: formData.position,
        status: formData.status,
        address: formData.address,
      });
      setActionAlert("Cập nhật thông tin thành công!");
    } else {
      dbService.addUser({
        fullName: formData.fullName.trim(),
        username: formData.username.trim() || formData.email.split("@")[0],
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password || "Password123@",
        role: formData.role,
        position: formData.position,
        status: formData.status,
        address: formData.address,
      });
      setActionAlert(isEmp ? "Đã thêm nhân viên mới thành công!" : "Đã thêm khách hàng mới thành công!");
    }

    setTimeout(() => setActionAlert(null), 3000);
    setShowModal(false);
  };

  // Lọc theo vai trò tab
  const tabUsers = users.filter((u) => {
    if (activeTab === "customers") return u.role === "customer" || u.role === "member" || !u.role;
    if (activeTab === "employees") return u.role === "employee" || u.role === "admin" || u.role === "staff";
    return true;
  });

  // Lọc theo search và status
  const filteredUsers = tabUsers.filter((u) => {
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  const customerCount = users.filter((u) => u.role === "customer" || u.role === "member" || !u.role).length;
  const employeeCount = users.filter((u) => u.role === "employee" || u.role === "admin" || u.role === "staff").length;
  const activeCount = tabUsers.filter((u) => u.status === "Hoạt động").length;
  const lockedCount = tabUsers.filter((u) => u.status === "Tạm khóa").length;

  const getUserOrderCount = (u) => {
    return orders.filter(
      (o) => o.userId === u.id || (u.email && o.email?.toLowerCase() === u.email.toLowerCase())
    ).length;
  };

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Quản lý người dùng & phân quyền</h2>
          <p className="admin-subtitle">
            Quản lý danh sách khách hàng (UC16 / TC_CUS) và nhân viên hệ thống (TC_EMP)
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          + {activeTab === "employees" ? "Thêm nhân viên mới" : "Thêm khách hàng mới"}
        </button>
      </div>

      {actionAlert && (
        <div style={{ padding: "10px 16px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: 8, marginTop: 12, fontWeight: 500, fontSize: 13.5 }}>
          ✓ {actionAlert}
        </div>
      )}

      {/* Role Navigation Tabs */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("all")}
        >
          👥 Tất cả người dùng ({users.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "customers" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("customers")}
        >
          🎫 Khách hàng ({customerCount})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "employees" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("employees")}
        >
          💼 Nhân viên & Quản trị ({employeeCount})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-title">
            {activeTab === "customers" ? "Tổng số khách hàng" : activeTab === "employees" ? "Tổng số nhân sự" : "Tổng tài khoản"}
          </div>
          <div className="stat-number">{tabUsers.length}</div>
          <div className="stat-trend positive">Đã kích hoạt trong hệ thống</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Đang hoạt động</div>
          <div className="stat-number" style={{ color: "var(--green-500)" }}>{activeCount}</div>
          <div className="stat-sub">Có thể đăng nhập & thao tác</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tạm khóa</div>
          <div className="stat-number" style={{ color: "var(--red-500)" }}>{lockedCount}</div>
          <div className="stat-sub">Bị hạn chế quyền truy cập</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-card" style={{ marginTop: 16, padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>
              Tìm kiếm (Tên, Email, SĐT, Username...)
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="🔍 Ví dụ: Nguyễn Văn A, 0901234567, email@domain.com..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ width: 180 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>
              Lọc theo trạng thái
            </label>
            <select
              className="input-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Hoạt động">Đang hoạt động</option>
              <option value="Tạm khóa">Tạm khóa</option>
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
            }}
          >
            ↺ Đặt lại
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Họ tên & Avatar</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò / Chức vụ</th>
              <th>Lịch sử vé</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right", width: 140 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const orderCount = getUserOrderCount(u);
              const isEmp = u.role === "admin" || u.role === "employee" || u.role === "staff";

              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: u.role === "admin" ? "var(--brand-600)" : u.role === "employee" ? "#0284c7" : "var(--brand-100)",
                          color: isEmp ? "white" : "var(--brand-700)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {u.role === "admin" ? "AD" : u.role === "employee" ? "NV" : "KH"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--ink-900)" }}>
                          {u.fullName || u.username}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{u.address || "Việt Nam"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{u.username || "—"}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin" ? "badge-purple" : u.role === "employee" ? "badge-blue" : "badge-gray"
                      }`}
                    >
                      {u.role === "admin" ? "👑 Admin" : u.role === "employee" ? "💼 Nhân viên" : "👤 Khách hàng"}
                    </span>
                    {u.position && (
                      <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}>{u.position}</div>
                    )}
                  </td>
                  <td>
                    {orderCount > 0 ? (
                      <button
                        className="badge badge-green"
                        style={{ cursor: "pointer", border: "none" }}
                        title="Bấm để xem danh sách vé đã đặt"
                        onClick={() => {
                          const userOrders = orders.filter(
                            (o) => o.userId === u.id || (u.email && o.email?.toLowerCase() === u.email.toLowerCase())
                          );
                          setSelectedUserOrders({ user: u, orders: userOrders });
                        }}
                      >
                        🎟️ {orderCount} đơn vé
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Chưa có vé</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.status === "Hoạt động" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {u.status || "Hoạt động"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        className="icon-action-btn edit"
                        title="Sửa thông tin"
                        onClick={() => handleOpenEdit(u)}
                      >
                        ✏️
                      </button>
                      
                      {/* Khóa / Mở khóa tài khoản */}
                      <button
                        className="icon-action-btn"
                        title={u.status === "Tạm khóa" ? "Mở khóa tài khoản" : "Tạm khóa tài khoản"}
                        onClick={() => handleToggleLock(u)}
                        style={{
                          background: u.status === "Tạm khóa" ? "var(--green-100)" : "var(--amber-100)",
                        }}
                      >
                        {u.status === "Tạm khóa" ? "🔓" : "🔒"}
                      </button>

                      {/* Xóa tài khoản (không xóa super admin) */}
                      {u.role !== "admin" && (
                        <button
                          className="icon-action-btn delete"
                          title="Xóa tài khoản"
                          onClick={() => handleDelete(u)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 36, color: "var(--ink-500)" }}>
                  Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Lịch sử vé của Khách hàng */}
      {selectedUserOrders && (
        <div className="modal-overlay" onClick={() => setSelectedUserOrders(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--ink-100)", paddingBottom: 12 }}>
              <h3 style={{ fontSize: 16 }}>
                Lịch sử đặt vé: {selectedUserOrders.user.fullName}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUserOrders(null)}>✕</button>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto", marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedUserOrders.orders.map((ord) => (
                <div key={ord.id} style={{ border: "1px solid var(--ink-100)", borderRadius: 8, padding: 12, background: "var(--ink-50)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "var(--brand-600)", fontFamily: "monospace" }}>{ord.ticketCode}</strong>
                    <span className={`badge ${ord.orderStatus === "confirmed" ? "badge-green" : ord.orderStatus === "used" ? "badge-purple" : "badge-red"}`}>
                      {ord.orderStatus}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>{ord.filmTitle}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-600)" }}>
                    {ord.cinemaName} • {ord.showtimeTime} ngày {ord.showtimeDate}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-600)" }}>
                    Ghế: {ord.seats?.map((s) => s.seatKey).join(", ")} | Tổng: {(ord.totalAmount || 0).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Người dùng */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3>
              {editingUser
                ? `Sửa thông tin ${editingUser.role === "employee" ? "nhân viên" : "khách hàng"}`
                : `Thêm ${activeTab === "employees" ? "nhân viên mới" : "khách hàng mới"}`}
            </h3>

            {formError && (
              <div style={{ marginTop: 12, padding: "8px 14px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 6, fontSize: 13 }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <div>
                <label className="form-label">Họ và tên *</label>
                <input
                  required
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Tên đăng nhập (Username)</label>
                  <input
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nguyenvana"
                  />
                </div>
                <div>
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  required
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="form-label">
                    Mật khẩu khởi tạo {formData.role !== "customer" && "(Tối thiểu 8 ký tự) *"}
                  </label>
                  <input
                    type="password"
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mật khẩu tối thiểu 8 ký tự..."
                  />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Vai trò</label>
                  <select
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      setFormData({
                        ...formData,
                        role: r,
                        position: r === "admin" ? "Quản trị viên" : r === "employee" ? "Nhân viên bán vé & soát vé" : "Khách hàng thân thiết",
                      });
                    }}
                  >
                    <option value="customer">Khách hàng (Customer)</option>
                    <option value="employee">Nhân viên (Employee)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                  </select>
                </div>
              </div>

              {formData.role === "employee" && (
                <div>
                  <label className="form-label">Chức vụ / Ca làm việc</label>
                  <select
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="Nhân viên bán vé & soát vé">Nhân viên bán vé & soát vé</option>
                    <option value="Nhân viên kỹ thuật phòng chiếu">Nhân viên kỹ thuật phòng chiếu</option>
                    <option value="Quản lý ca / Trưởng rạp">Quản lý ca / Trưởng rạp</option>
                  </select>
                </div>
              )}

              <div>
                <label className="form-label">Địa chỉ / Khu vực</label>
                <input
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="TP. Hồ Chí Minh, Hà Nội..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? "Cập nhật" : "Lưu tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
