import React, { useState, useRef } from "react";
import { dbService } from "../lib/supabaseClient.js";

export default function Register({ go, goBack, onLogin }) {
  const [stage, setStage] = useState(1);
  const [form, setForm] = useState({ fullName: "", username: "", email: "", phone: "", password: "", confirm: "" });
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  function findDuplicate(email, phone) {
    const users = dbService.getUsers() || [];
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();
    if (cleanEmail && users.some((u) => (u.email || "").trim().toLowerCase() === cleanEmail)) {
      return "email";
    }
    if (cleanPhone && users.some((u) => (u.phone || "").trim() === cleanPhone)) {
      return "phone";
    }
    return null;
  }

  function validateInputs() {
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    // TC_REG_01: bỏ trống toàn bộ
    if (!fullName && !email && !form.password && !form.confirm) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc");
      return false;
    }

    // Họ tên (TC_REG_01, TC_REG_02)
    if (!fullName) {
      setError("Vui lòng nhập họ và tên");
      return false;
    }
    if (fullName.length > 100) {
      setError("Họ tên vượt quá độ dài cho phép (tối đa 100 ký tự)");
      return false;
    }

    // Email (TC_REG_05, TC_REG_04)
    if (!email) {
      setError("Vui lòng nhập email");
      return false;
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }

    // Số điện thoại (TC_REG_08, TC_REG_09)
    if (phone && !/^0\d{9}$/.test(phone)) {
      setError("Số điện thoại không hợp lệ");
      return false;
    }

    // Mật khẩu (TC_REG_06, TC_REG_07)
    if (!form.password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu chưa đủ độ dài tối thiểu theo SRS (tối thiểu 8 ký tự)");
      return false;
    }
    if (form.password.length > 128) {
      setError("Mật khẩu vượt quá độ dài cho phép (tối đa 128 ký tự)");
      return false;
    }
    if (!form.confirm) {
      setError("Vui lòng nhập xác nhận mật khẩu");
      return false;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    // Email / SĐT đã tồn tại (TC_REG_03, BUG_REG_01 / TC_REG_04) - Không phân biệt hoa thường
    const dup = findDuplicate(email, phone);
    if (dup === "email") {
      setError("Email đã tồn tại");
      return false;
    }
    if (dup === "phone") {
      setError("Số điện thoại đã tồn tại");
      return false;
    }

    return true;
  }

  function submitForm(e) {
    if (e) e.preventDefault();

    // BUG_REG_03: Chặn nhấn Đăng ký liên tiếp / debounce, không tạo tài khoản trùng hoặc lỗi 500
    if (submittingRef.current || isSubmitting) {
      return;
    }

    if (!validateInputs()) {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Đăng ký trực tiếp và tạo tài khoản an toàn
      const newUser = dbService.addUser({
        fullName: form.fullName.trim(),
        username: form.username || form.email.trim().split("@")[0],
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "customer",
        tier: "Thành viên",
        point: 50,
        status: "Hoạt động",
      });

      if (onLogin) onLogin(newUser);
      go("home");
    } catch (err) {
      setError(err?.message || "Đã xảy ra lỗi khi tạo tài khoản");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleGoToOtp(e) {
    if (e) e.preventDefault();
    if (!validateInputs()) return;
    setError("");
    setStage(2);
  }

  function submitOtp(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return setError("Vui lòng nhập đủ 6 số OTP");

    if (submittingRef.current || isSubmitting) return;
    if (findDuplicate(form.email.trim(), form.phone.trim())) {
      return setError("Email hoặc số điện thoại đã tồn tại");
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const newUser = dbService.addUser({
      fullName: form.fullName.trim(),
      username: form.username || form.email.trim().split("@")[0],
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: "customer",
      tier: "Thành viên",
      point: 50,
      status: "Hoạt động",
    });

    if (onLogin) onLogin(newUser);
    go("home");
  }

  function updateOtp(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      if (el) el.focus();
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
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
          <h2>{stage === 1 ? "Tạo tài khoản Movix" : "Xác minh email"}</h2>
          <p>{stage === 1 ? "Đăng ký để tích điểm thành viên và nhận ưu đãi độc quyền" : `Nhập mã OTP đã gửi tới ${form.email}`}</p>
        </div>

        {stage === 1 ? (
          <form onSubmit={submitForm} noValidate>
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                required
                value={form.fullName}
                onChange={(e) => {
                  setForm({ ...form, fullName: e.target.value });
                  setError("");
                }}
                placeholder="vd: Nguyễn Văn A"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setError("");
                }}
                placeholder="you@email.com"
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  setError("");
                }}
                placeholder="0912345678"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setError("");
                }}
                placeholder="Tối thiểu 8 ký tự (Abc@12345)"
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu *</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => {
                  setForm({ ...form, confirm: e.target.value });
                  setError("");
                }}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            {error && <div className="form-error" role="alert" style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: 6, fontSize: 13 }}>{error}</div>}
            
            <button
              className="btn btn-primary btn-block"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp}>
            <div className="otp-inputs">
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={v}
                  maxLength={1}
                  onChange={(e) => updateOtp(i, e.target.value)}
                />
              ))}
            </div>
            {error && <div className="form-error" style={{ textAlign: "center" }}>{error}</div>}
            <button className="btn btn-primary btn-block" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xác thực..." : "Xác nhận và Hoàn tất"}
            </button>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStage(1)}
                style={{ color: "var(--ink-600)", fontSize: 13 }}
              >
                ← Quay lại chỉnh sửa thông tin
              </button>
            </div>
          </form>
        )}

        {stage === 1 && (
          <div className="form-foot">
            Đã có tài khoản? <button onClick={() => go("login")}>Đăng nhập</button>
          </div>
        )}
      </div>
    </div>
  );
}