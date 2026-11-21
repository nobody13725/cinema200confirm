import React, { useState, useEffect } from "react";
import { dbService, subscribeDb } from "../../lib/supabaseClient.js";
import { FALLBACK_BACKDROP, FALLBACK_CINEMA, handleImageError } from "../../utils/imageFallback";

const AMENITY_OPTIONS = [
  "Dolby Atmos",
  "IMAX Laser",
  "Gold Class",
  "Sweetbox",
  "4DX",
  "Starium",
  "Bãi đỗ xe",
];

const STATUS_STYLE = {
  "Hoạt động": { badge: "badge-green", label: "Hoạt động" },
  "Bảo trì": { badge: "badge-amber", label: "Đang bảo trì" },
  "Tạm đóng": { badge: "badge-red", label: "Tạm đóng" },
};

function isImageSrc(val) {
  return typeof val === "string" && /^(https?:\/\/|data:image\/|\/)/i.test(val.trim());
}

export default function AdminCinemas({ onSelectTab }) {
  const [cinemas, setCinemas] = useState([]);
  const [cities, setCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [viewCinema, setViewCinema] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    cityId: "city-1",
    hotline: "",
    status: "Hoạt động",
    avatar: "",
    banner: "",
    amenities: [],
    description: "",
  });

  const loadData = () => {
    setCinemas(dbService.getCinemas());
    setCities(dbService.getCities());
    setRooms(dbService.getRooms());
    setShowtimes(dbService.getShowtimes());
    setOrders(dbService.getOrders());
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingCinema(null);
    setFormError("");
    setFormData({
      name: "",
      address: "",
      cityId: cities[0]?.id || "city-1",
      hotline: "1900 6017",
      status: "Hoạt động",
      avatar: FALLBACK_CINEMA,
      banner: FALLBACK_BACKDROP,
      amenities: ["Dolby Atmos"],
      description: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCinema(c);
    setFormError("");
    setFormData({
      name: c.name || "",
      address: c.address || "",
      cityId: c.cityId || cities[0]?.id || "city-1",
      hotline: c.hotline || "",
      status: c.status || "Hoạt động",
      avatar: c.avatar || "",
      banner: c.banner || "",
      amenities: Array.isArray(c.amenities) ? c.amenities : [],
      description: c.description || "",
    });
    setShowModal(true);
  };

  const handleImageFileChange = (field, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP...).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ảnh tải lên tối đa 2 MB để đảm bảo hiệu năng lưu trữ.");
      return;
    }
    setFormError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, [field]: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAmenity = (item) => {
    setFormData((prev) => {
      const cur = Array.isArray(prev.amenities) ? prev.amenities : [];
      return {
        ...prev,
        amenities: cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item],
      };
    });
  };

  const handleToggleQuickStatus = (cinema) => {
    const cur = cinema.status || "Hoạt động";
    const next = cur === "Hoạt động" ? "Bảo trì" : "Hoạt động";
    dbService.updateCinema(cinema.id, { status: next });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    dbService.deleteCinema(deleteTarget.id);
    if (viewCinema?.id === deleteTarget.id) setViewCinema(null);
    setDeleteTarget(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError("");
    const name = (formData.name || "").trim();
    const address = (formData.address || "").trim();
    if (!name) return setFormError("Vui lòng nhập tên rạp chiếu.");
    if (!address) return setFormError("Vui lòng nhập địa chỉ rạp chiếu.");

    const avatarTrimmed = (formData.avatar || "").trim();
    const bannerTrimmed = (formData.banner || "").trim();

    if (avatarTrimmed && !isImageSrc(avatarTrimmed) && avatarTrimmed.length > 4) {
      return setFormError("Link ảnh đại diện (Logo) phải bắt đầu bằng https://, http:// hoặc tải ảnh từ máy.");
    }
    if (bannerTrimmed && !isImageSrc(bannerTrimmed)) {
      return setFormError("Link ảnh bìa (Banner) phải bắt đầu bằng https://, http:// hoặc tải ảnh từ máy.");
    }

    const payload = {
      ...formData,
      name,
      address,
      hotline: (formData.hotline || "").trim(),
      avatar: avatarTrimmed || FALLBACK_CINEMA,
      banner: bannerTrimmed || avatarTrimmed || FALLBACK_BACKDROP,
      description: (formData.description || "").trim(),
    };

    if (editingCinema) {
      dbService.updateCinema(editingCinema.id, payload);
    } else {
      dbService.addCinema(payload);
    }
    setShowModal(false);
  };

  const getCityName = (cityId) => {
    const city = cities.find((ct) => ct.id === cityId);
    return city ? city.name : "Khác";
  };

  const getCinemaStats = (cinemaId) => {
    const cRooms = rooms.filter((r) => r.cinemaId === cinemaId);
    const totalSeats = cRooms.reduce(
      (sum, r) =>
        sum + (r.seatLayout || []).reduce((s, row) => s + (Number(row.count) || 0), 0),
      0
    );
    const cShowtimes = showtimes.filter((st) => st.cinemaId === cinemaId);
    const cOrders = orders.filter((o) => o.cinemaId === cinemaId);
    return { roomsList: cRooms, roomCount: cRooms.length, totalSeats, showtimeCount: cShowtimes.length, orderCount: cOrders.length };
  };

  const activeCount = cinemas.filter((c) => (c.status || "Hoạt động") === "Hoạt động").length;
  const coveredCitiesCount = new Set(cinemas.map((c) => c.cityId).filter(Boolean)).size;
  const totalSeatsSystem = rooms.reduce(
    (sum, r) => sum + (r.seatLayout || []).reduce((s, row) => s + (Number(row.count) || 0), 0),
    0
  );

  const keyword = search.trim().toLowerCase();
  const filteredCinemas = cinemas.filter((c) => {
    const matchKeyword =
      !keyword ||
      c.name?.toLowerCase().includes(keyword) ||
      c.address?.toLowerCase().includes(keyword) ||
      c.hotline?.toLowerCase().includes(keyword) ||
      c.description?.toLowerCase().includes(keyword);
    const matchCity = cityFilter === "all" || c.cityId === cityFilter;
    const cStatus = c.status || "Hoạt động";
    const matchStatus = statusFilter === "all" || cStatus === statusFilter;
    return matchKeyword && matchCity && matchStatus;
  });

  const renderCinemaThumb = (cinema, size = 48) => {
    const imgSrc = isImageSrc(cinema?.avatar)
      ? cinema.avatar
      : isImageSrc(cinema?.banner)
      ? cinema.banner
      : null;

    if (imgSrc) {
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: 10,
            overflow: "hidden",
            background: "var(--ink-100)",
            border: "1px solid var(--ink-200)",
            flexShrink: 0,
          }}
        >
          <img
            src={imgSrc}
            alt={cinema?.name || "Rạp chiếu"}
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, FALLBACK_CINEMA)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          width: size,
          height: size,
          background: "var(--brand-50)",
          borderRadius: 10,
          border: "1px solid var(--brand-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(size * 0.45),
          flexShrink: 0,
        }}
      >
        {cinema?.avatar && cinema.avatar.length <= 4 ? cinema.avatar : "🏢"}
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Quản lý rạp chiếu</h2>
          <p className="admin-subtitle">
            Quản lý cụm rạp, hình ảnh nhận diện, tiện ích phòng chiếu và trạng thái vận hành (UC13)
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {typeof onSelectTab === "function" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectTab("rooms")}
            >
              💺 Quản lý phòng chiếu
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            + Thêm rạp mới
          </button>
        </div>
      </div>

      {/* Thống kê tổng quan cụm rạp */}
      <div
        className="admin-stat-cards"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 16 }}
      >
        <div className="stat-card">
          <div className="stat-title">Tổng cụm rạp</div>
          <div className="stat-number" style={{ color: "var(--brand-600)" }}>{cinemas.length}</div>
          <div className="stat-sub">{activeCount} rạp đang hoạt động</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Khu vực phủ sóng</div>
          <div className="stat-number" style={{ color: "#7c3aed" }}>{coveredCitiesCount}</div>
          <div className="stat-sub">Tỉnh / Thành phố có rạp</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tổng phòng chiếu</div>
          <div className="stat-number" style={{ color: "#059669" }}>{rooms.length}</div>
          <div className="stat-sub">{totalSeatsSystem.toLocaleString("vi-VN")} ghế phục vụ</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Suất chiếu hệ thống</div>
          <div className="stat-number" style={{ color: "var(--amber-500)" }}>{showtimes.length}</div>
          <div className="stat-sub">Đang phân bổ theo cụm rạp</div>
        </div>
      </div>

      {/* Thanh tìm kiếm & Bộ lọc khu vực / trạng thái */}
      <div
        className="admin-card"
        style={{
          marginTop: 16,
          padding: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          className="input-control"
          placeholder="🔍 Tìm tên rạp, địa chỉ, hotline..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <select
          className="input-control"
          style={{ width: 190 }}
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          <option value="all">Tất cả thành phố ({cinemas.length})</option>
          {cities.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.name}
            </option>
          ))}
        </select>
        <select
          className="input-control"
          style={{ width: 175 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Hoạt động">Đang hoạt động</option>
          <option value="Bảo trì">Đang bảo trì</option>
          <option value="Tạm đóng">Tạm đóng</option>
        </select>
        {(search || cityFilter !== "all" || statusFilter !== "all") && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch("");
              setCityFilter("all");
              setStatusFilter("all");
            }}
          >
            ✕ Xóa lọc
          </button>
        )}
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>Hình ảnh</th>
              <th>Tên rạp chiếu</th>
              <th>Địa chỉ &amp; Khu vực</th>
              <th>Quy mô &amp; Suất chiếu</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right", width: 150 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCinemas.map((c) => {
              const st = getCinemaStats(c.id);
              const cStatus = c.status || "Hoạt động";
              const stMeta = STATUS_STYLE[cStatus] || STATUS_STYLE["Hoạt động"];
              return (
                <tr key={c.id}>
                  <td>{renderCinemaThumb(c, 50)}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink-900)" }}>{c.name}</div>
                    {c.hotline && (
                      <div style={{ fontSize: 12, color: "var(--brand-700)", fontWeight: 600, marginTop: 2 }}>
                        📞 {c.hotline}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--ink-500)",
                        marginTop: 2,
                        maxWidth: 280,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={c.description}
                    >
                      {c.description || "Chưa có mô tả chi tiết."}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ marginBottom: 4, display: "inline-block" }}>
                      {getCityName(c.cityId)}
                    </span>
                    <div style={{ fontSize: 12.5, color: "var(--ink-700)", lineHeight: 1.4 }}>{c.address}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>
                      {st.roomCount} phòng · {st.totalSeats} ghế
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                      {st.showtimeCount} suất chiếu · {st.orderCount} đơn vé
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleQuickStatus(c)}
                      className={`badge ${stMeta.badge}`}
                      style={{ border: "none", cursor: "pointer", fontWeight: 700 }}
                      title="Bấm để chuyển nhanh Hoạt động / Bảo trì"
                    >
                      {stMeta.label}
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        type="button"
                        className="icon-action-btn view"
                        title="Xem chi tiết & phòng chiếu"
                        onClick={() => setViewCinema(c)}
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn edit"
                        title="Sửa thông tin & ảnh rạp"
                        onClick={() => handleOpenEdit(c)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn delete"
                        title="Xóa rạp"
                        onClick={() => setDeleteTarget(c)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCinemas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
                  Không có rạp chiếu nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa Rạp */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}
          >
            <h3>{editingCinema ? "Chỉnh sửa rạp chiếu" : "Thêm rạp chiếu mới"}</h3>
            {formError && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ⚠️ {formError}
              </div>
            )}
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              <div>
                <label className="form-label">Tên rạp chiếu *</label>
                <input
                  required
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: CGV Vincom Center Bà Triệu"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Thành phố *</label>
                  <select
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  >
                    {cities.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Trạng thái vận hành</label>
                  <select
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo trì">Đang bảo trì</option>
                    <option value="Tạm đóng">Tạm đóng</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Địa chỉ rạp *</label>
                  <input
                    required
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, đường, quận/huyện..."
                  />
                </div>
                <div>
                  <label className="form-label">Hotline rạp</label>
                  <input
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.hotline}
                    onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                    placeholder="1900 6017"
                  />
                </div>
              </div>

              {/* Ảnh đại diện (Logo rạp) */}
              <div>
                <label className="form-label">Ảnh đại diện / Logo rạp (URL hoặc tải ảnh)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid var(--ink-200)",
                      background: "var(--ink-50)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isImageSrc(formData.avatar) ? (
                      <img
                        src={formData.avatar}
                        alt="Logo rạp"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, FALLBACK_CINEMA)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 22 }}>🏢</span>
                    )}
                  </div>
                  <input
                    className="input-control"
                    style={{ flex: 1 }}
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://... link ảnh vuông/logo rạp"
                  />
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    📁 Chọn ảnh
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageFileChange("avatar", e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Ảnh bìa rạp (Banner trang Hệ thống rạp) */}
              <div>
                <label className="form-label">Ảnh bìa rạp (Banner ngang trang Hệ thống rạp)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <input
                    className="input-control"
                    style={{ flex: 1 }}
                    value={formData.banner}
                    onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                    placeholder="https://... link ảnh bìa rạp chiếu phim"
                  />
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    📁 Chọn bìa
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageFileChange("banner", e.target.files?.[0])}
                    />
                  </label>
                </div>
                {isImageSrc(formData.banner) && (
                  <div
                    style={{
                      height: 88,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid var(--ink-200)",
                      background: "var(--ink-100)",
                    }}
                  >
                    <img
                      src={formData.banner}
                      alt="Banner preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, FALLBACK_BACKDROP)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}
              </div>

              {/* Tiện ích & Công nghệ phòng chiếu */}
              <div>
                <label className="form-label">Công nghệ &amp; Tiện ích nổi bật</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {AMENITY_OPTIONS.map((item) => {
                    const active = (formData.amenities || []).includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: active ? "1px solid var(--brand-600)" : "1px solid var(--ink-200)",
                          background: active ? "var(--brand-50)" : "white",
                          color: active ? "var(--brand-700)" : "var(--ink-600)",
                        }}
                      >
                        {active ? "✓ " : "+ "}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Giới thiệu rạp</label>
                <textarea
                  rows={3}
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tiêu chuẩn phòng chiếu, âm thanh, không gian sảnh chờ..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 6 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCinema ? "Cập nhật rạp" : "Lưu rạp mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết Rạp & Thống kê phòng chiếu */}
      {viewCinema && (() => {
        const stats = getCinemaStats(viewCinema.id);
        const bannerSrc = isImageSrc(viewCinema.banner)
          ? viewCinema.banner
          : isImageSrc(viewCinema.avatar)
          ? viewCinema.avatar
          : FALLBACK_BACKDROP;
        const vStatus = viewCinema.status || "Hoạt động";
        const stMeta = STATUS_STYLE[vStatus] || STATUS_STYLE["Hoạt động"];

        return (
          <div className="modal-overlay" onClick={() => setViewCinema(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 540, padding: 0, overflow: "hidden" }}
            >
              <div style={{ height: 150, position: "relative", background: "var(--ink-100)" }}>
                <img
                  src={bannerSrc}
                  alt={viewCinema.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, FALLBACK_BACKDROP)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(15,23,42,0.78), transparent 65%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 16,
                    right: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {renderCinemaThumb(viewCinema, 52)}
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 17, color: "white", margin: 0 }}>{viewCinema.name}</h3>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      <span className="badge badge-purple">{getCityName(viewCinema.cityId)}</span>
                      <span className={`badge ${stMeta.badge}`}>{stMeta.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink-700)", lineHeight: 1.6 }}>
                  <p><strong>📍 Địa chỉ:</strong> {viewCinema.address}</p>
                  {viewCinema.hotline && (
                    <p style={{ marginTop: 4 }}><strong>📞 Hotline:</strong> {viewCinema.hotline}</p>
                  )}
                  <p style={{ marginTop: 6 }}>
                    <strong>📝 Mô tả:</strong> {viewCinema.description || "Chưa có mô tả chi tiết."}
                  </p>
                </div>

                {Array.isArray(viewCinema.amenities) && viewCinema.amenities.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {viewCinema.amenities.map((a) => (
                      <span key={a} className="badge badge-gray">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                    marginTop: 14,
                    padding: 12,
                    background: "var(--ink-50)",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-700)" }}>
                      {stats.roomCount}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>Phòng chiếu</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
                      {stats.totalSeats}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>Tổng số ghế</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#7c3aed" }}>
                      {stats.showtimeCount}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>Suất chiếu</div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-800)", marginBottom: 6 }}>
                    Danh sách phòng chiếu trực thuộc ({stats.roomsList.length}):
                  </div>
                  {stats.roomsList.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
                      Chưa thiết lập phòng chiếu cho rạp này.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflowY: "auto" }}>
                      {stats.roomsList.map((rm) => {
                        const rmSeats = (rm.seatLayout || []).reduce((s, r) => s + (Number(r.count) || 0), 0);
                        return (
                          <div
                            key={rm.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "7px 10px",
                              borderRadius: 8,
                              border: "1px solid var(--ink-200)",
                              fontSize: 12.5,
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>{rm.name}</span>
                            <span style={{ color: "var(--ink-500)" }}>{rmSeats} ghế</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {typeof onSelectTab === "function" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setViewCinema(null);
                            onSelectTab("rooms");
                          }}
                        >
                          💺 Quản lý phòng
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setViewCinema(null);
                            onSelectTab("showtimes");
                          }}
                        >
                          🕒 Quản lý suất chiếu
                        </button>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const target = viewCinema;
                        setViewCinema(null);
                        handleOpenEdit(target);
                      }}
                    >
                      ✏️ Sửa rạp
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setViewCinema(null)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Xác nhận xóa an toàn */}
      {deleteTarget && (() => {
        const stats = getCinemaStats(deleteTarget.id);
        return (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <h3 style={{ color: "#b91c1c" }}>Xác nhận xóa rạp chiếu</h3>
              <p style={{ fontSize: 13.5, color: "var(--ink-700)", marginTop: 10, lineHeight: 1.55 }}>
                Bạn có chắc muốn xóa rạp <strong>"{deleteTarget.name}"</strong> khỏi hệ thống?
              </p>
              {(stats.roomCount > 0 || stats.showtimeCount > 0) && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 8,
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    fontSize: 12.5,
                  }}
                >
                  ⚠️ Rạp này hiện đang có <strong>{stats.roomCount} phòng chiếu</strong> và{" "}
                  <strong>{stats.showtimeCount} suất chiếu</strong>. Nếu chỉ tạm ngưng phục vụ, bạn nên đổi trạng thái sang <em>Bảo trì / Tạm đóng</em> thay vì xóa.
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDeleteTarget(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: "var(--red-500)", borderColor: "var(--red-500)" }}
                  onClick={handleConfirmDelete}
                >
                  Xóa rạp này
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
