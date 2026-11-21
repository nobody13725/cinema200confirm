import React, { useEffect, useState } from "react";
import AdminMovies from "./AdminMovies.jsx";
import AdminCinemas from "./AdminCinemas.jsx";
import AdminRooms from "./AdminRooms.jsx";
import AdminShowtimes from "./AdminShowtimes.jsx";
import AdminUsers from "./AdminUsers.jsx";
import AdminComments from "./AdminComments.jsx";
import AdminOrders from "./AdminOrders.jsx";
import AdminTicketApproval from "./AdminTicketApproval.jsx";
import AdminWatchHistory from "./AdminWatchHistory.jsx";
import AdminPromotions from "./AdminPromotions.jsx";
import AdminReports from "./AdminReports.jsx";
import AdminSupabase from "./AdminSupabase.jsx";
import AdminSVD from "./AdminSVD.jsx";

const EMPLOYEE_ALLOWED_TABS = new Set(["ticketApproval", "orders", "watchHistory", "comments"]);

export default function AdminLayout({ user, onExitAdmin, go, goBack, params }) {
  const isFullAdmin = user?.role === "admin" || user?.role === "administrator";
  const isEmployee = user?.role === "employee" || user?.role === "staff";

  const requestedTab = params?.tab;
  const initialTab =
    requestedTab && (isFullAdmin || EMPLOYEE_ALLOWED_TABS.has(requestedTab))
      ? requestedTab
      : isFullAdmin
      ? "movies"
      : "ticketApproval";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [forbiddenTab, setForbiddenTab] = useState("");

  useEffect(() => {
    if (params?.tab && (isFullAdmin || EMPLOYEE_ALLOWED_TABS.has(params.tab))) {
      setActiveTab(params.tab);
    }
  }, [params?.tab, isFullAdmin]);

  useEffect(() => {
    if (!isFullAdmin && !EMPLOYEE_ALLOWED_TABS.has(activeTab)) {
      setActiveTab("ticketApproval");
    }
  }, [isFullAdmin, activeTab]);

  const handleExit = () => {
    if (typeof onExitAdmin === "function") {
      onExitAdmin();
    } else if (typeof go === "function") {
      go("home");
    } else if (typeof goBack === "function") {
      goBack();
    } else {
      window.history.back();
    }
  };

  // Bảo vệ phân quyền chặt chẽ bên trong AdminLayout
  if (!user || (!isFullAdmin && !isEmployee)) {
    return (
      <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 480, background: "white", padding: 36, borderRadius: 12, border: "1px solid #fee2e2", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🚫</div>
          <h2 style={{ fontSize: 20, color: "#991b1b", marginBottom: 8 }}>Không có quyền truy cập Quản trị</h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
            Trang này chỉ dành riêng cho tài khoản Quản trị viên (Admin) hoặc Nhân viên được cấp quyền.
          </p>
          <button className="btn btn-primary" onClick={handleExit}>
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const allNavItems = [
    { id: "ticketApproval", label: "Duyệt vé & Soát vé", icon: "🎫", uc: "TICKET", roles: ["admin", "employee"] },
    { id: "orders", label: "Quản lý đặt vé", icon: "🎟️", uc: "UC19", roles: ["admin", "employee"] },
    { id: "watchHistory", label: "Lịch sử người xem", icon: "📜", uc: "WATCH", roles: ["admin", "employee"] },
    { id: "comments", label: "Quản lý bình luận", icon: "💬", uc: "UC17", roles: ["admin", "employee"] },
    { id: "movies", label: "Quản lý phim", icon: "🎬", uc: "UC12", roles: ["admin"] },
    { id: "cinemas", label: "Quản lý rạp chiếu", icon: "🏢", uc: "UC13", roles: ["admin"] },
    { id: "rooms", label: "Quản lý phòng chiếu", icon: "💺", uc: "UC14", roles: ["admin"] },
    { id: "showtimes", label: "Quản lý suất chiếu", icon: "🕒", uc: "UC15", roles: ["admin"] },
    { id: "customers", label: "Quản lý khách hàng", icon: "👤", uc: "CUS", roles: ["admin"] },
    { id: "employees", label: "Quản lý nhân viên", icon: "💼", uc: "EMP", roles: ["admin"] },
    { id: "promotions", label: "Quản lý khuyến mãi", icon: "🏷️", uc: "UC18", roles: ["admin"] },
    { id: "reports", label: "Thống kê & báo cáo", icon: "📊", uc: "UC20", roles: ["admin"] },
    { id: "svd", label: "Gợi ý SVD & Setting", icon: "🧠", uc: "SVD", roles: ["admin"] },
    { id: "supabase", label: "Cơ sở dữ liệu Supabase", icon: "⚡", uc: "DB", roles: ["admin"] },
  ];

  const navItems = allNavItems.filter((item) =>
    isFullAdmin ? true : item.roles.includes("employee")
  );

  const handleSelectTab = (tabId) => {
    if (!isFullAdmin && !EMPLOYEE_ALLOWED_TABS.has(tabId)) {
      setForbiddenTab(tabId);
      return;
    }
    setForbiddenTab("");
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (!isFullAdmin && (forbiddenTab || !EMPLOYEE_ALLOWED_TABS.has(activeTab))) {
      return (
        <div className="admin-page">
          <div className="admin-card" style={{ padding: 36, textAlign: "center", border: "1px solid #fecaca", background: "#fff5f5" }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🚫</div>
            <h3 style={{ color: "#991b1b", marginBottom: 8 }}>403 · Chỉ dành riêng cho Quản trị viên (Admin)</h3>
            <p style={{ fontSize: 14, color: "#7f1d1d", marginBottom: 18 }}>
              Tài khoản Nhân viên chỉ được phép Duyệt vé, Soát vé và Kiểm duyệt bình luận. Bạn không có quyền truy cập chức năng quản trị hệ thống này.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setForbiddenTab("");
                setActiveTab("ticketApproval");
              }}
            >
              ← Quay về Duyệt vé &amp; Soát vé
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "ticketApproval":
        return <AdminTicketApproval user={user} isFullAdmin={isFullAdmin} />;
      case "orders":
        return <AdminOrders user={user} isFullAdmin={isFullAdmin} />;
      case "watchHistory":
        return <AdminWatchHistory user={user} isFullAdmin={isFullAdmin} />;
      case "comments":
        return <AdminComments />;
      case "movies":
        return <AdminMovies />;
      case "cinemas":
        return <AdminCinemas onSelectTab={handleSelectTab} />;
      case "rooms":
        return <AdminRooms />;
      case "showtimes":
        return <AdminShowtimes />;
      case "customers":
        return <AdminUsers initialRoleFilter="customer" key="customers" />;
      case "employees":
        return <AdminUsers initialRoleFilter="employee" key="employees" />;
      case "users":
        return <AdminUsers initialRoleFilter="all" key="users" />;
      case "promotions":
        return <AdminPromotions />;
      case "reports":
        return <AdminReports />;
      case "svd":
        return <AdminSVD />;
      case "supabase":
        return <AdminSupabase />;
      default:
        return isFullAdmin ? <AdminMovies /> : <AdminTicketApproval user={user} isFullAdmin={isFullAdmin} />;
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar matching Fig 29-44 */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="brand-logo" style={{ color: "var(--brand-500)", fontWeight: 900, fontSize: 22 }}>
            MOVIX{" "}
            <span style={{ fontSize: 13, color: isFullAdmin ? "var(--ink-500)" : "#6d28d9", fontWeight: 600 }}>
              {isFullAdmin ? "ADMIN" : "STAFF"}
            </span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => handleSelectTab(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              <span className="badge-uc">{item.uc}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={handleExit}>
            ← Trang xem phim
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
              {isFullAdmin ? "Bảng điều khiển quản trị /" : "Cổng nhân viên rạp /"}
            </span>
            <strong style={{ fontSize: 14, color: "var(--ink-900)" }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isFullAdmin ? "var(--brand-500)" : "#6d28d9",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {isFullAdmin ? "AD" : "NV"}
              </div>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: "var(--ink-900)" }}>
                  {user?.fullName || (isFullAdmin ? "Quản trị viên" : "Nhân viên rạp")}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>
                  {isFullAdmin ? "Toàn quyền hệ thống" : "Nhân viên · Duyệt vé & Kiểm duyệt"}
                </div>
              </div>
            </div>

            <button
              className="btn btn-outline btn-sm"
              onClick={handleExit}
              style={{ padding: "6px 12px", fontSize: 12.5 }}
            >
              👁️ Xem giao diện khách hàng
            </button>
          </div>
        </header>

        {/* Dynamic content */}
        <main className="admin-content-area">{renderContent()}</main>
      </div>
    </div>
  );
}
