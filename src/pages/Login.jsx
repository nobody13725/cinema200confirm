import React, { useState } from "react";
import { dbService } from "../lib/supabaseClient.js";

export default function Login({ go, goBack, onLogin, params }) {
  const [form, setForm] = useState({ identity: "", password: "" });
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const rawId = form.identity.trim();
    if (!rawId && !form.password.trim()) return setError("Vui lòng nhập email và mật khẩu");
    if (!rawId) return setError("Vui lòng nhập email hoặc tên đăng nhập");
    if (!form.password.trim()) return setError("Vui lòng nhập mật khẩu");
    if (rawId.length > 254) return setError("Email không được vượt quá 254 ký tự");
    if (rawId.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawId)) {
      return setError("Email không hợp lệ");
    }

    const users = dbService.getUsers();
    const cleanId = form.identity.trim().toLowerCase();

    // Tìm tài khoản theo email, username hoặc số điện thoại
    const user = users.find(
      (u) =>
        u.email?.toLowerCase() === cleanId ||
        u.username?.toLowerCase() === cleanId ||
        u.phone === form.identity.trim()
    );

    // Dùng chung 1 thông báo cho sai email / sai mật khẩu / email chưa đăng ký
    if (!user || user.password !== form.password) {
      return setError("Email hoặc mật khẩu không chính xác");
    }

    if (user.status === "Tạm khóa" || user.status === "Khóa" || user.status === "locked") {
      return setError("Tài khoản đã bị khóa");
    }

    setError("");
    onLogin(user);

    // Điều hướng theo đúng phân quyền
    if (user.role === "admin" || user.role === "administrator" || user.role === "employee" || user.role === "staff") {
      go(params?.redirect === "admin" ? "admin" : "admin");
    } else {
      // Người dùng thường không được chuyển vào admin dù redirect có là admin
      const target = params?.redirect === "admin" ? "profile" : params?.redirect || "home";
      go(target, params?.redirectParams || {});
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => (typeof goBack === "function" ? goBack() : go("home"))}
            style={{ padding: "4px 8px", fontSize: 13, color: "var(--ink-600)", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            ← Quay lại trang chủ
          </button>
        </div>

        <div className="auth-logo">
          <div className="brand-mark">🎬</div>
          <h2>Đăng nhập Movix</h2>
          <p>Đăng nhập để đặt vé nhanh, tích điểm thành viên &amp; xem lịch sử vé</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email, Tên đăng nhập hoặc SĐT</label>
            <input
              placeholder="Nhập email, tên đăng nhập hoặc SĐT..."
              value={form.identity}
              onChange={(e) => setForm({ ...form, identity: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: 6, fontSize: 13 }}>{error}</div>}
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <button
              type="button"
              style={{ fontSize: 13, color: "var(--brand-600)", fontWeight: 600 }}
              onClick={() => go("forgotPassword")}
            >
              Quên mật khẩu?
            </button>
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Đăng nhập
          </button>
        </form>

        <div className="form-foot">
          Chưa có tài khoản? <button onClick={() => go("register")}>Đăng ký ngay</button>
        </div>
      </div>
    </div>
  );
}