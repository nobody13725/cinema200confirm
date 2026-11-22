import React, { useEffect, useState } from "react";
import { cfService, subscribeDb } from "../../lib/supabaseClient.js";

const SOURCE_LABELS = {
  website_review: "Đánh giá sao trên Web",
  watched: "Đánh dấu đã xem (Chi tiết phim)",
  order_used: "Đã xem xong / Check-in vé",
  order_confirmed: "Đã đặt vé trên Web",
  booked: "Đặt vé mới trên Web",
  admin_test: "Admin giả lập",
};

const GENRE_VI_MAP = {
  Action: "Hành động",
  Adventure: "Phiêu lưu",
  Animation: "Hoạt hình & Anime",
  Children: "Thiếu nhi",
  Comedy: "Hài hước",
  Crime: "Hình sự",
  Drama: "Chính kịch & Tâm lý",
  Family: "Gia đình",
  Fantasy: "Giả tưởng",
  History: "Lịch sử",
  Horror: "Kinh dị",
  Mystery: "Bí ẩn",
  Romance: "Tình cảm",
  "Sci-Fi": "Khoa học viễn tưởng",
  Thriller: "Giật gân",
};

const ALPHA_OPTIONS = [
  { value: 0.65, label: "65% SVD + 35% Thể loại (Khuyên dùng · Cân bằng)" },
  { value: 1.0, label: "100% SVD (Thuần hành vi người dùng tương đồng)" },
  { value: 0.35, label: "35% SVD + 65% Thể loại (Ưu tiên phim cùng thể loại)" },
  { value: 0.0, label: "100% Thể loại (Chỉ gợi ý theo thể loại đã thích)" },
];

function formatGenresVi(genresStr) {
  return (genresStr || "")
    .split("|")
    .map((g) => g.trim())
    .filter(Boolean)
    .map((g) => GENRE_VI_MAP[g] || g)
    .join(" · ");
}

export default function AdminSVD() {
  const [state, setState] = useState(null);
  const [viewerPreview, setViewerPreview] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [activeUserId, setActiveUserId] = useState(1);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Cấu hình thống nhất điều khiển cả Trang chủ lẫn Khung xem trước
  const [settingsForm, setSettingsForm] = useState({
    home_enabled: true,
    section_title: "Gợi ý phim dành riêng cho bạn",
    home_limit: 4,
    default_alpha: 0.65,
    default_genre_filter: "ALL",
  });
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);

  // Thử nghiệm nhanh: giả lập xem / đánh giá
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [ratingValue, setRatingValue] = useState("5.0");
  const [comment, setComment] = useState("");

  // Tab dữ liệu chi tiết bên dưới
  const [dataTab, setDataTab] = useState("website");
  const [mlFilterUser, setMlFilterUser] = useState("active");
  const [mlSearch, setMlSearch] = useState("");

  function syncSettingsFromServer(data) {
    if (data?.settings) {
      setSettingsForm({
        home_enabled: Boolean(data.settings.home_enabled),
        section_title: data.settings.section_title || "Gợi ý phim dành riêng cho bạn",
        home_limit: Number(data.settings.home_limit || 4),
        default_alpha: Number(data.settings.default_alpha ?? 0.65),
        default_genre_filter: data.settings.default_genre_filter || "ALL",
      });
      setHasUnsavedSettings(false);
    }
  }

  async function fetchViewerPreview(uid, usersList, draft = null) {
    try {
      const targetUser = (usersList || []).find((u) => u.id === uid);
      const q = new URLSearchParams({ userId: String(uid) });
      if (targetUser?.web_user_id) q.set("webUserId", targetUser.web_user_id);
      if (targetUser?.email) q.set("email", targetUser.email);
      if (draft) {
        q.set("limit", String(draft.home_limit || 4));
        q.set("alpha", String(draft.default_alpha ?? 0.65));
        q.set("genreFilter", String(draft.default_genre_filter || "ALL"));
      }
      const res = await fetch(`/api/cf/viewer-recommendations?${q.toString()}`);
      if (res.ok) {
        setViewerPreview(await res.json());
      }
    } catch {
      // ignore preview warning
    }
  }

  async function fetchState(uid = activeUserId, draftOverride = null) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ userId: String(uid) });
      if (draftOverride) {
        params.set("alpha", String(draftOverride.default_alpha ?? 0.65));
        params.set("genre", String(draftOverride.default_genre_filter || "ALL"));
      }

      const res = await fetch(`/api/cf/state?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải dữ liệu SVD");
      setState(data);

      if (!draftOverride) {
        syncSettingsFromServer(data);
      }

      if (!selectedMovieId && data.movies?.length > 0) {
        const firstUnrated = data.all_predictions?.find((p) => !p.already_rated);
        setSelectedMovieId(String(firstUnrated ? firstUnrated.movie_id : data.movies[0].id));
      }

      await fetchViewerPreview(uid, data.users, draftOverride);
      fetch("/api/ai/status")
        .then((r) => (r.ok ? r.json() : null))
        .then((s) => {
          if (s) setAiStatus(s);
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState(activeUserId, hasUnsavedSettings ? settingsForm : null);
    return subscribeDb(() => {
      fetchState(activeUserId, hasUnsavedSettings ? settingsForm : null);
    });
  }, [activeUserId]);

  function handleDraftChange(patch) {
    const next = { ...settingsForm, ...patch };
    setSettingsForm(next);
    setHasUnsavedSettings(true);
    if (state?.users) {
      fetchViewerPreview(activeUserId, state.users, next);
      // Cập nhật cả bảng điểm matrix theo alpha/genre đang thử nghiệm
      const params = new URLSearchParams({
        userId: String(activeUserId),
        alpha: String(next.default_alpha ?? 0.65),
        genre: String(next.default_genre_filter || "ALL"),
      });
      fetch(`/api/cf/state?${params.toString()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setState(data);
        })
        .catch(() => {});
    }
  }

  function handleDiscardDraft() {
    if (!state?.settings) return;
    const saved = {
      home_enabled: Boolean(state.settings.home_enabled),
      section_title: state.settings.section_title || "Gợi ý phim dành riêng cho bạn",
      home_limit: Number(state.settings.home_limit || 4),
      default_alpha: Number(state.settings.default_alpha ?? 0.65),
      default_genre_filter: state.settings.default_genre_filter || "ALL",
    };
    setSettingsForm(saved);
    setHasUnsavedSettings(false);
    fetchState(activeUserId, null);
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/cf/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settingsForm,
          active_user_id: activeUserId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu cấu hình");
      setState(data);
      syncSettingsFromServer(data);
      await fetchViewerPreview(activeUserId, data.users, null);
      const genreLabel =
        settingsForm.default_genre_filter === "ALL"
          ? "Tất cả thể loại"
          : GENRE_VI_MAP[settingsForm.default_genre_filter] || settingsForm.default_genre_filter;
      setNotice(
        `Đã lưu & áp dụng lên Trang chủ (${
          settingsForm.home_enabled
            ? `Hiển thị tối đa ${settingsForm.home_limit} phim · Thể loại: ${genreLabel} · Trọng số α = ${settingsForm.default_alpha}`
            : "Đang tạm ẩn mục gợi ý"
        }).`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncFromWeb() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await cfService.syncCatalog();
      await fetchState(activeUserId, hasUnsavedSettings ? settingsForm : null);
      setNotice("Đã đồng bộ lại Phim, Tài khoản, Vé đặt và Đánh giá từ Website sang SQLite.");
    } catch (err) {
      setError(err.message || "Đồng bộ thất bại");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitRating(e) {
    e.preventDefault();
    if (!selectedMovieId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/cf/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          movie_id: Number(selectedMovieId),
          rating: Number(ratingValue),
          comment,
          alpha: settingsForm.default_alpha,
          genre_filter: settingsForm.default_genre_filter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu đánh giá");
      setState(data);
      setComment("");
      setDataTab("website");
      await fetchViewerPreview(activeUserId, data.users, hasUnsavedSettings ? settingsForm : null);
      setNotice(
        `Đã lưu đánh giá cho User #${activeUserId}. Phim này đã bị loại khỏi danh sách gợi ý; bấm "Huấn luyện lại Model" để cập nhật vĩnh viễn vào svd_model.pkl.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkWatchedAdmin() {
    if (!selectedMovieId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await cfService.recordActivity({
        user_id: activeUserId,
        movie_id: Number(selectedMovieId),
        event_type: "watched",
        rating: 4.5,
        comment: "Đánh dấu đã xem xong từ Quản trị",
      });
      await fetchState(activeUserId, hasUnsavedSettings ? settingsForm : null);
      setDataTab("watched");
      setNotice(
        `Đã ghi nhận User #${activeUserId} xem xong phim #${selectedMovieId}. Phim vừa xem đã bị loại khỏi gợi ý và các phim cùng thể loại được đẩy lên.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRetrain() {
    if (!state) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/cf/retrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          alpha: settingsForm.default_alpha,
          genre_filter: settingsForm.default_genre_filter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Huấn luyện lại thất bại");
      setState(data);
      await fetchViewerPreview(activeUserId, data.users, hasUnsavedSettings ? settingsForm : null);
      setNotice(
        `Đã huấn luyện lại thành công svd_model.pkl v${data.model_info?.model_version} (${data.model_info?.total_ratings} lượt đánh giá, RMSE: ${data.model_info?.rmse}).`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/cf/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          alpha: settingsForm.default_alpha,
          genre_filter: settingsForm.default_genre_filter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset thất bại");
      setState(data);
      await fetchViewerPreview(activeUserId, data.users, hasUnsavedSettings ? settingsForm : null);
      setNotice("Đã xóa các đánh giá thử nghiệm và khôi phục svd_model.pkl về dữ liệu mẫu gốc.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading && !state) {
    return (
      <div className="admin-page">
        <div className="admin-card" style={{ padding: 32, textAlign: "center", color: "var(--ink-500)" }}>
          Đang tải cấu hình Gợi ý SVD và dữ liệu người dùng...
        </div>
      </div>
    );
  }

  const allUsers = state?.users || [];
  const visibleUsers = showAllAccounts
    ? allUsers
    : allUsers.filter((u) => u.role === "customer" || u.id === activeUserId);
  const activeUser = allUsers.find((u) => u.id === activeUserId) || allUsers[0];

  const modelInfo = state?.model_info || {};
  const pendingCount = state?.pending_retrain_count || 0;
  const watchedList = state?.user_watched_movies || [];
  const affinityList = state?.user_genre_affinity || [];
  const previewRecs = viewerPreview?.recommendations || [];
  const totalMoviesCount = state?.movies?.length || 18;

  const filteredMovielens = (state?.movielens_ratings || []).filter((r) => {
    if (mlFilterUser === "active" && r.user_id !== activeUserId) return false;
    if (mlSearch.trim()) {
      const q = mlSearch.trim().toLowerCase();
      if (!r.movie_title.toLowerCase().includes(q) && !r.user_name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="admin-page">
      {/* HEADER + THANH TRẠNG THÁI MODEL */}
      <div className="admin-header-row">
        <div>
          <h2>Gợi ý phim SVD &amp; Cài đặt Trang chủ</h2>
          <p className="admin-subtitle">
            Mọi cài đặt tại đây (số lượng phim, bộ lọc thể loại, trọng số SVD) được áp dụng trực tiếp cho mục{" "}
            <strong>&ldquo;{settingsForm.section_title || "Gợi ý phim dành riêng cho bạn"}&rdquo;</strong> ở Trang chủ và Chi tiết phim.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, fontSize: 12 }}>
            <span style={{ background: "#eef2ff", color: "#3730a3", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
              Model v{modelInfo.model_version || 1} · {totalMoviesCount} phim · {modelInfo.total_ratings || 0} lượt đánh giá
            </span>
            {aiStatus?.ok && (
              <span style={{ background: "#ecfdf5", color: "#065f46", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
                Độ chính xác Test: RMSE {aiStatus.rmse} · MAE {aiStatus.mae}
              </span>
            )}
            <span style={{ background: "#f8fafc", color: "#334155", padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              Cập nhật cấu hình: {state?.settings?.updated_at || "—"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={handleRetrain}
            style={{
              whiteSpace: "nowrap",
              background: pendingCount > 0 ? "#d97706" : "var(--brand-600)",
            }}
          >
            {busy ? "Đang xử lý..." : `Huấn luyện lại Model${pendingCount > 0 ? ` (${pendingCount} mới)` : ""}`}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={busy}
            onClick={handleSyncFromWeb}
            style={{ whiteSpace: "nowrap" }}
          >
            Đồng bộ từ Web
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={busy}
            onClick={handleReset}
            style={{ whiteSpace: "nowrap" }}
          >
            Reset đánh giá web
          </button>
        </div>
      </div>

      {pendingCount > 0 && (
        <div
          style={{
            padding: "11px 16px",
            borderRadius: 10,
            border: "1px solid #fcd34d",
            background: "#fffbeb",
            color: "#92400e",
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13.5 }}>
            <strong>Có {pendingCount} lượt đánh giá / xem phim mới trên Web</strong> chưa gộp vào <code>svd_model.pkl</code>. Bấm Huấn luyện lại để cập nhật trọng số SVD.
          </span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleRetrain}
            disabled={busy}
            style={{ background: "#d97706", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Huấn luyện lại ngay
          </button>
        </div>
      )}

      {notice && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1e3a8a",
            fontSize: 13,
            marginTop: 14,
          }}
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
            fontSize: 13,
            marginTop: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* KHU VỰC CHÍNH: CÀI ĐẶT (TRÁI) <-> XEM TRƯỚC TRỰC TIẾP TRANG CHỦ (PHẢI) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          marginTop: 18,
          marginBottom: 18,
          alignItems: "flex-start",
        }}
      >
        {/* CỘT TRÁI: FORM CÀI ĐẶT THỐNG NHẤT */}
        <div className="admin-card" style={{ padding: 18, flex: "1 1 360px", maxWidth: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>1. Cài đặt hiển thị Gợi ý trên Web</h3>
            {hasUnsavedSettings && (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: 6 }}>
                Chưa lưu
              </span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: "0 0 14px", lineHeight: 1.45 }}>
            Thay đổi ở đây sẽ cập nhật ngay khung xem trước bên phải để bạn kiểm tra, rồi bấm <strong>Lưu cấu hình</strong> để phát hành ra Trang chủ.
          </p>

          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Bật / Tắt mục Gợi ý trên Trang chủ
              </label>
              <select
                className="input-control"
                value={settingsForm.home_enabled ? "1" : "0"}
                onChange={(e) => handleDraftChange({ home_enabled: e.target.value === "1" })}
              >
                <option value="1">Đang bật — Hiển thị gợi ý cho người xem</option>
                <option value="0">Tạm ẩn mục gợi ý ngoài Trang chủ</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Tiêu đề hiển thị ngoài Trang chủ
              </label>
              <input
                className="input-control"
                value={settingsForm.section_title}
                onChange={(e) => handleDraftChange({ section_title: e.target.value })}
                placeholder="Gợi ý phim dành riêng cho bạn"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Số phim hiển thị tối đa
                </label>
                <select
                  className="input-control"
                  value={settingsForm.home_limit}
                  onChange={(e) => handleDraftChange({ home_limit: Number(e.target.value) })}
                >
                  <option value={4}>4 phim (1 hàng)</option>
                  <option value={6}>6 phim</option>
                  <option value={8}>8 phim (2 hàng)</option>
                  <option value={12}>12 phim (3 hàng)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Lọc theo thể loại
                </label>
                <select
                  className="input-control"
                  value={settingsForm.default_genre_filter}
                  onChange={(e) => handleDraftChange({ default_genre_filter: e.target.value })}
                >
                  <option value="ALL">Tất cả thể loại</option>
                  {(state?.all_genres || []).map((g) => (
                    <option key={g} value={g}>
                      {GENRE_VI_MAP[g] ? `${GENRE_VI_MAP[g]} (${g})` : g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Cách xếp hạng gợi ý (Trọng số Hybrid α)
              </label>
              <select
                className="input-control"
                value={settingsForm.default_alpha}
                onChange={(e) => handleDraftChange({ default_alpha: Number(e.target.value) })}
              >
                {ALPHA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 4 }}>
                Công thức: <code>Điểm = {Number(settingsForm.default_alpha).toFixed(2)} × SVD + {(1 - Number(settingsForm.default_alpha)).toFixed(2)} × Thể loại</code>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
              {hasUnsavedSettings && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={busy}
                  onClick={handleDiscardDraft}
                >
                  Hoàn tác
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
                Lưu &amp; Áp dụng ra Trang chủ
              </button>
            </div>
          </form>

          {/* THỬ NGHIỆM NHANH TRÊN USER ĐANG CHỌN */}
          <div style={{ borderTop: "1px dashed var(--ink-200)", marginTop: 18, paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
              Thử nghiệm nhanh cho: {activeUser?.full_name}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "0 0 10px" }}>
              Giả lập khách hàng này vừa xem xong hoặc đánh giá 1 phim để kiểm tra hệ thống tự loại trừ phim đó và đẩy phim hợp sở thích lên:
            </p>
            <form onSubmit={handleSubmitRating} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                className="input-control"
                style={{ fontSize: 12.5 }}
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
              >
                {(state?.movies || []).map((m) => (
                  <option key={m.id} value={m.id}>
                    [#{m.id}] {m.title} ({formatGenresVi(m.genres)})
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  className="input-control"
                  style={{ fontSize: 12.5, maxWidth: 165 }}
                  value={ratingValue}
                  onChange={(e) => setRatingValue(e.target.value)}
                >
                  <option value="5.0">5.0 ★ (Rất thích)</option>
                  <option value="4.0">4.0 ★ (Thích)</option>
                  <option value="3.0">3.0 ★ (Bình thường)</option>
                  <option value="2.0">2.0 ★ (Không thích)</option>
                  <option value="1.0">1.0 ★ (Rất tệ)</option>
                </select>
                <input
                  className="input-control"
                  style={{ fontSize: 12.5 }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ghi chú đánh giá..."
                />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={busy}
                  onClick={handleMarkWatchedAdmin}
                  style={{ flex: 1, whiteSpace: "nowrap" }}
                >
                  ✓ Đánh dấu đã xem
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={busy} style={{ flex: 1, whiteSpace: "nowrap" }}>
                  Gửi đánh giá sao
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CỘT PHẢI: XEM TRƯỚC KẾT QUẢ THỰC TẾ THEO TÀI KHOẢN */}
        <div className="admin-card" style={{ padding: 18, flex: "1.55 1 480px", maxWidth: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, margin: 0 }}>2. Xem trước Trang chủ theo Khách hàng</h3>
              <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "2px 0 0" }}>
                Chọn 1 khách hàng để xem đúng danh sách phim họ sẽ thấy ngoài Trang chủ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllAccounts((v) => !v)}
              style={{
                background: "#f8fafc",
                border: "1px solid var(--ink-200)",
                color: "var(--ink-700)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "5px 10px",
                borderRadius: 6,
              }}
            >
              {showAllAccounts ? "Chỉ hiện Khách hàng" : "+ Hiện cả Admin/Nhân viên"}
            </button>
          </div>

          {/* BƯỚC 1: CHỌN KHÁCH HÀNG */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {visibleUsers.map((u) => {
              const isActive = u.id === activeUserId;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setActiveUserId(u.id);
                    setNotice("");
                  }}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: isActive ? 700 : 500,
                    border: isActive ? "1.5px solid var(--brand-600)" : "1px solid var(--ink-200)",
                    background: isActive ? "var(--brand-50)" : "var(--white)",
                    color: isActive ? "var(--brand-700)" : "var(--ink-700)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: isActive ? "var(--brand-600)" : "var(--ink-100)",
                      color: isActive ? "#fff" : "var(--ink-600)",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(u.full_name || "U").trim().slice(0, 1).toUpperCase()}
                  </span>
                  {u.full_name}
                </button>
              );
            })}
          </div>

          {/* BƯỚC 2: HỒ SƠ ĐÃ XEM & SỞ THÍCH (2 Ô GỌN GÀNG) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {/* Ô trái: Phim đã xem (Loại trừ) */}
            <div style={{ padding: "11px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid var(--ink-200)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-800)" }}>
                  ✓ Đã xem (Không gợi ý lại)
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--brand-700)", background: "var(--brand-50)", padding: "1px 7px", borderRadius: 6 }}>
                  {watchedList.length} phim
                </span>
              </div>
              {watchedList.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Chưa có lịch sử xem phim.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {watchedList.map((w) => (
                    <span
                      key={`${w.movie_id}-${w.order_id}`}
                      style={{
                        fontSize: 11.5,
                        background: "#ffffff",
                        border: "1px solid var(--ink-200)",
                        color: "var(--ink-700)",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontWeight: 500,
                      }}
                    >
                      {w.movie_title || w.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ô phải: Sở thích thể loại rút ra (Thanh trực quan) */}
            <div style={{ padding: "11px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid var(--ink-200)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-800)" }}>
                  ★ Sở thích nổi bật
                </span>
                <span style={{ fontSize: 11.5, color: "var(--ink-500)" }}>
                  {activeUser?.persona}
                </span>
              </div>
              {affinityList.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Chưa đủ dữ liệu đánh giá.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {affinityList.slice(0, 3).map((ga) => {
                    const pct = Math.max(15, Math.min(100, (Number(ga.avg_rating || 0) / 5) * 100));
                    return (
                      <div key={ga.genre} style={{ fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, color: "var(--ink-800)" }}>{ga.genre_vi}</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-600)", fontWeight: 600 }}>
                            {ga.avg_rating.toFixed(1)}★ <span style={{ fontWeight: 400, color: "var(--ink-400)" }}>({ga.count} phim)</span>
                          </span>
                        </div>
                        <div style={{ height: 5, borderRadius: 4, background: "var(--ink-200)", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "var(--brand-600)", borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* BƯỚC 3: KHUNG XEM TRƯỚC TRANG CHỦ (MÔ PHỎNG LƯỚI PHIM) */}
          <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid var(--ink-200)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>
                  {settingsForm.section_title || "Gợi ý phim dành riêng cho bạn"}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 1 }}>
                  Xem trước giao diện Trang chủ · Trọng số α = {Number(settingsForm.default_alpha).toFixed(2)}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 6,
                  background: settingsForm.home_enabled ? "#ecfdf5" : "#fef2f2",
                  color: settingsForm.home_enabled ? "#047857" : "#b91c1c",
                  border: `1px solid ${settingsForm.home_enabled ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {settingsForm.home_enabled
                  ? `Đang bật · ${previewRecs.length}/${settingsForm.home_limit} phim`
                  : "Đang tạm ẩn"}
              </span>
            </div>

            {!settingsForm.home_enabled ? (
              <div style={{ padding: 20, borderRadius: 8, border: "1px dashed var(--ink-300)", background: "#fff", fontSize: 13, color: "var(--ink-600)", textAlign: "center" }}>
                Mục gợi ý trên Trang chủ đang chọn <strong>Tạm ẩn</strong>.
              </div>
            ) : previewRecs.length === 0 ? (
              <div style={{ padding: 20, borderRadius: 8, border: "1px dashed var(--ink-300)", background: "#fff", fontSize: 13, color: "var(--ink-600)", textAlign: "center" }}>
                Không còn phim nào chưa xem khớp bộ lọc thể loại đang chọn.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                  gap: 10,
                }}
              >
                {previewRecs.map((rec, idx) => (
                  <div
                    key={rec.movie_id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#ffffff",
                      border: "1px solid var(--ink-200)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: idx === 0 ? "#ffffff" : "var(--brand-700)",
                            background: idx === 0 ? "var(--brand-600)" : "var(--brand-50)",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          Top #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#b45309",
                            background: "#fffbeb",
                            border: "1px solid #fde68a",
                            padding: "1px 7px",
                            borderRadius: 6,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {Number(rec.predicted_rating ?? rec.score ?? 0).toFixed(2)} ★
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink-900)", lineHeight: 1.35 }}>
                        {rec.title}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {(rec.genres || "")
                          .split(",")
                          .map((g) => g.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((g) => (
                            <span
                              key={g}
                              style={{
                                fontSize: 11,
                                color: "var(--ink-600)",
                                background: "var(--ink-50)",
                                border: "1px solid var(--ink-100)",
                                padding: "1px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {g}
                            </span>
                          ))}
                      </div>

                      <div style={{ fontSize: 11.5, color: "var(--brand-700)", marginTop: 7, lineHeight: 1.4, fontWeight: 500 }}>
                        {rec.reason}
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: "1px dashed var(--ink-200)",
                        paddingTop: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "var(--ink-500)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <span>Điểm SVD: <strong>{Number(rec.svd_score ?? 0).toFixed(2)}</strong></span>
                      <span>Sở thích: <strong>{Number(rec.genre_score ?? 0).toFixed(2)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KHU VỰC CHI TIẾT: CSDL & BẢNG ĐIỂM ĐẦY ĐỦ */}
      <div className="admin-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15.5, margin: 0 }}>Dữ liệu nguồn &amp; Bảng chấm điểm toàn bộ {totalMoviesCount} phim</h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: "2px 0 0" }}>
              Kiểm tra chi tiết phim nào đã bị loại trừ, phim nào được cộng điểm SVD + Thể loại cho tài khoản <strong>{activeUser?.full_name}</strong>.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "website" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("website")}
            >
              Đánh giá Web ({state?.website_ratings?.length || 0})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "watched" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("watched")}
            >
              Phim đã xem ({state?.watch_history?.length || 0})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "movielens" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("movielens")}
            >
              Dữ liệu mẫu ({state?.movielens_ratings?.length || 0})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "matrix" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("matrix")}
            >
              Bảng điểm {totalMoviesCount} phim
            </button>
          </div>
        </div>

        {dataTab === "website" && (
          <div style={{ overflowX: "auto" }}>
            {(state?.website_ratings || []).length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ink-500)", fontSize: 13.5 }}>
                Chưa có đánh giá mới nào phát sinh từ Website.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Phim</th>
                    <th>Điểm</th>
                    <th>Nguồn</th>
                    <th>Bình luận / Ghi chú</th>
                    <th>Thời gian</th>
                    <th>Trạng thái Model</th>
                  </tr>
                </thead>
                <tbody>
                  {state.website_ratings.map((w) => (
                    <tr key={w.id}>
                      <td>{w.user_name}</td>
                      <td><strong>{w.movie_title}</strong></td>
                      <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{Number(w.rating ?? 0).toFixed(1)} ★</td>
                      <td>{SOURCE_LABELS[w.source] || w.source}</td>
                      <td>{w.comment || "—"}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{w.created_at}</td>
                      <td style={{ fontWeight: 700, color: w.included_in_model ? "#16a34a" : "#d97706" }}>
                        {w.included_in_model ? "Đã gộp vào model" : "Chờ huấn luyện lại"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {dataTab === "watched" && (
          <div style={{ overflowX: "auto" }}>
            {(state?.watch_history || []).length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ink-500)", fontSize: 13.5 }}>
                Chưa có lịch sử xem phim nào được ghi nhận.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Phim đã xem</th>
                    <th>Thể loại</th>
                    <th>Nguồn</th>
                    <th>Mã đơn vé</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {state.watch_history.map((wh) => (
                    <tr key={wh.id}>
                      <td>{wh.user_name}</td>
                      <td><strong>{wh.movie_title || wh.title}</strong></td>
                      <td>{formatGenresVi(wh.movie_genres || wh.genres)}</td>
                      <td>{SOURCE_LABELS[wh.source] || wh.source}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{wh.order_id || "—"}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{wh.watched_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {dataTab === "movielens" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`btn btn-sm ${mlFilterUser === "active" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setMlFilterUser("active")}
              >
                Chỉ {activeUser?.full_name}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mlFilterUser === "all" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setMlFilterUser("all")}
              >
                Tất cả ({state?.movielens_ratings?.length || 0})
              </button>
              <input
                className="input-control"
                value={mlSearch}
                onChange={(e) => setMlSearch(e.target.value)}
                placeholder="Tìm tên phim hoặc user..."
                style={{ maxWidth: 240 }}
              />
            </div>
            <div style={{ overflowX: "auto", maxHeight: 340, overflowY: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Phim</th>
                    <th>Thể loại</th>
                    <th>Điểm mẫu</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovielens.slice(0, 80).map((r) => (
                    <tr key={r.id}>
                      <td>{r.user_name}</td>
                      <td><strong>{r.movie_title}</strong></td>
                      <td>{formatGenresVi(r.movie_genres)}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{Number(r.rating ?? 0).toFixed(1)} ★</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {dataTab === "matrix" && (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Phim &amp; Thể loại</th>
                  <th>Trạng thái với {activeUser?.full_name}</th>
                  <th>Khớp bộ lọc?</th>
                  <th>Điểm SVD</th>
                  <th>Điểm Thể loại</th>
                  <th>Khớp sở thích %</th>
                  <th>Tổng Hybrid</th>
                </tr>
              </thead>
              <tbody>
                {(state?.all_predictions || []).map((p) => (
                  <tr key={p.movie_id} style={{ opacity: p.already_rated ? 0.65 : 1 }}>
                    <td>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{formatGenresVi(p.genres)}</div>
                    </td>
                    <td style={{ color: p.already_rated ? "#b45309" : "#15803d", fontWeight: 600 }}>
                      {p.already_rated ? "Đã xem / đánh giá (Loại trừ)" : "Ứng viên gợi ý"}
                    </td>
                    <td>{p.matches_filter ? "✓ Khớp" : "Không khớp"}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{Number(p.svd_score ?? 0).toFixed(3)}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{Number(p.genre_score ?? 0).toFixed(3)}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{p.genre_match_pct}%</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "var(--brand-700)" }}>
                      {Number(p.predicted_rating ?? 0).toFixed(3)} ★
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
