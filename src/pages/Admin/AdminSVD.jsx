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

const ALPHA_OPTIONS = [
  { value: 1.0, label: "100% SVD (Chỉ ma trận đánh giá)" },
  { value: 0.65, label: "65% SVD + 35% Thể loại (Hybrid cân bằng)" },
  { value: 0.35, label: "35% SVD + 65% Thể loại (Ưu tiên thể loại)" },
  { value: 0.0, label: "100% Hồ sơ Thể loại (Content-Based)" },
];

export default function AdminSVD() {
  const [state, setState] = useState(null);
  const [viewerPreview, setViewerPreview] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [activeUserId, setActiveUserId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Tham số xem thử trong Admin Workspace (null = dùng cấu hình Admin đang lưu)
  const [previewAlpha, setPreviewAlpha] = useState(null);
  const [previewGenre, setPreviewGenre] = useState(null);

  // Cấu hình phát hành ra Trang chủ (recommendation_settings - chỉ Admin thấy & chỉnh)
  const [settingsForm, setSettingsForm] = useState({
    home_enabled: true,
    section_title: "Gợi ý phim dành riêng cho bạn",
    home_limit: 4,
    default_alpha: 0.65,
    default_genre_filter: "ALL",
  });

  // Form giả lập đánh giá mới hoặc đánh dấu đã xem
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [ratingValue, setRatingValue] = useState("5.0");
  const [comment, setComment] = useState("");

  // Tab phân biệt nguồn dữ liệu SQLite
  const [dataTab, setDataTab] = useState("website"); // 'website' | 'watched' | 'movielens' | 'matrix'
  const [mlFilterUser, setMlFilterUser] = useState("active"); // 'active' | 'all'
  const [mlSearch, setMlSearch] = useState("");

  // Snapshot trước khi retrain để hiển thị độ dịch chuyển điểm
  const [prevSnapshot, setPrevSnapshot] = useState(null);

  function syncSettingsFormFromState(data) {
    if (data?.settings) {
      setSettingsForm({
        home_enabled: Boolean(data.settings.home_enabled),
        section_title: data.settings.section_title || "Gợi ý phim dành riêng cho bạn",
        home_limit: Number(data.settings.home_limit || 4),
        default_alpha: Number(data.settings.default_alpha ?? 0.65),
        default_genre_filter: data.settings.default_genre_filter || "ALL",
      });
    }
  }

  async function fetchViewerPreview(uid, usersList) {
    try {
      const targetUser = (usersList || []).find((u) => u.id === uid);
      const q = new URLSearchParams({ userId: String(uid) });
      if (targetUser?.web_user_id) q.set("webUserId", targetUser.web_user_id);
      if (targetUser?.email) q.set("email", targetUser.email);
      const res = await fetch(`/api/cf/viewer-recommendations?${q.toString()}`);
      if (res.ok) {
        setViewerPreview(await res.json());
      }
    } catch {
      // ignore preview fetch warning
    }
  }

  async function fetchState(uid = activeUserId, a = previewAlpha, g = previewGenre) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ userId: String(uid) });
      if (a !== null && a !== undefined) params.set("alpha", String(a));
      if (g !== null && g !== undefined) params.set("genre", String(g));

      const res = await fetch(`/api/cf/state?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải dữ liệu SVD");
      setState(data);
      syncSettingsFormFromState(data);

      if (!selectedMovieId && data.movies?.length > 0) {
        const firstUnrated = data.all_predictions?.find((p) => !p.already_rated);
        setSelectedMovieId(String(firstUnrated ? firstUnrated.movie_id : data.movies[0].id));
      }

      fetchViewerPreview(uid, data.users);
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
    fetchState(activeUserId, previewAlpha, previewGenre);
    return subscribeDb(() => {
      fetchState(activeUserId, previewAlpha, previewGenre);
    });
  }, [activeUserId, previewAlpha, previewGenre]);

  function handleSwitchUser(uid) {
    setPrevSnapshot(null);
    setActiveUserId(uid);
    setNotice(`Đang theo dõi luồng gợi ý từ Website → Hybrid SVD → Trang chủ cho User ID ${uid}`);
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
      syncSettingsFormFromState(data);
      setPreviewAlpha(Number(settingsForm.default_alpha));
      setPreviewGenre(settingsForm.default_genre_filter);
      await fetchViewerPreview(activeUserId, data.users);
      setNotice(
        `Đã lưu cấu hình phát hành Trang chủ (Hiển thị: ${
          settingsForm.home_enabled ? `Bật · Tối đa ${settingsForm.home_limit} phim` : "Đang ẩn"
        }, Trọng số α = ${settingsForm.default_alpha}). Kết quả ở Trang chủ và khung xem trước đã cập nhật ngay.`
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
      await fetchState(activeUserId, previewAlpha, previewGenre);
      setNotice("Đã đồng bộ lại toàn bộ Phim, Tài khoản, Vé đặt và Đánh giá từ Website sang SQLite.");
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
          alpha: previewAlpha ?? settingsForm.default_alpha,
          genre_filter: previewGenre ?? settingsForm.default_genre_filter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu đánh giá");
      setState(data);
      setComment("");
      setDataTab("website");
      await fetchViewerPreview(activeUserId, data.users);
      setNotice(
        `Đã ghi nhận đánh giá mới vào website_ratings cho User ${activeUserId}. Kết quả Trang chủ đã loại trừ phim này và cộng hưởng thể loại; bấm "Huấn luyện lại svd_model.pkl" để cập nhật ma trận SVD.`
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
      await fetchState(activeUserId, previewAlpha, previewGenre);
      setDataTab("watched");
      setNotice(
        `Đã ghi nhận User ID ${activeUserId} xem xong phim #${selectedMovieId}. Phim này đã bị loại khỏi danh sách gợi ý và các phim cùng thể loại đã được đẩy lên đầu.`
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
    const oldMap = {};
    (state.all_predictions || []).forEach((p) => {
      oldMap[p.movie_id] = p.predicted_rating;
    });
    setPrevSnapshot({ userId: activeUserId, scores: oldMap, version: state.model_info?.model_version });

    try {
      const res = await fetch("/api/cf/retrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          alpha: previewAlpha ?? settingsForm.default_alpha,
          genre_filter: previewGenre ?? settingsForm.default_genre_filter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Huấn luyện lại thất bại");
      setState(data);
      await fetchViewerPreview(activeUserId, data.users);
      setNotice(
        `Đã huấn luyện lại thành công svd_model.pkl v${data.model_info?.model_version} (${data.model_info?.movielens_count} mẫu MovieLens + ${data.model_info?.website_count} dữ liệu website, RMSE: ${data.model_info?.rmse}).`
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
    setPrevSnapshot(null);
    try {
      const res = await fetch("/api/cf/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          alpha: previewAlpha ?? settingsForm.default_alpha,
          genre_filter: previewGenre ?? settingsForm.default_genre_filter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset thất bại");
      setState(data);
      await fetchViewerPreview(activeUserId, data.users);
      setNotice("Đã xóa các đánh giá mới trên website và khôi phục svd_model.pkl về tập mẫu MovieLens gốc.");
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
          Đang tải dữ liệu thống nhất SQLite (movix_cf.db) và mô hình SVD (svd_model.pkl)...
        </div>
      </div>
    );
  }

  const activeUser = state?.users?.find((u) => u.id === activeUserId) || state?.users?.[0];
  const modelInfo = state?.model_info || {};
  const pendingCount = state?.pending_retrain_count || 0;
  const currentAlpha = previewAlpha ?? Number(state?.alpha ?? 0.65);
  const currentGenre = previewGenre ?? (state?.genre_filter || "ALL");

  const watchedList = state?.user_watched_movies || [];
  const affinityList = state?.user_genre_affinity || [];
  const topGenreVi = affinityList[0]?.genre_vi || "Đa dạng thể loại";
  const topHomeRecs = viewerPreview?.recommendations || [];
  const totalMoviesCount = state?.movies?.length || 12;
  const excludedCount = (state?.all_predictions || []).filter((p) => p.already_rated).length;

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
      <div className="admin-header-row">
        <div>
          <h2>Cơ chế Collaborative Filtering &amp; Cài đặt Gợi ý (Chỉ Admin)</h2>
          <p className="admin-subtitle">
            Kiến trúc <strong>OFFLINE TRAINING → SAVE MODEL → LOAD MODEL → ONLINE RECOMMENDATION</strong> (<code>AI_Recommendation/</code> &amp; <code>GET /api/recommendations/&#123;user_id&#125;</code>)
          </p>
          {aiStatus?.ok && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8, fontSize: 12 }}>
              <span style={{ background: "#eef2ff", color: "#3730a3", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
                Engine: {aiStatus.backend}
              </span>
              <span style={{ background: "#ecfdf5", color: "#065f46", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
                RMSE (Test): {aiStatus.rmse} · MAE (Test): {aiStatus.mae} ({aiStatus.test_samples} mẫu)
              </span>
              <span style={{ background: "#f8fafc", color: "#334155", padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                SVD: factors={aiStatus.config?.n_factors}, epochs={aiStatus.config?.n_epochs}, lr={aiStatus.config?.lr_all}, reg={aiStatus.config?.reg_all}
              </span>
            </div>
          )}
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
            {busy ? "Đang xử lý..." : `Huấn luyện lại svd_model.pkl${pendingCount > 0 ? ` (${pendingCount} mới)` : ""}`}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={busy}
            onClick={handleSyncFromWeb}
            style={{ whiteSpace: "nowrap" }}
          >
            Đồng bộ lại từ Web
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
          <a
            href="/flask_cf_demo.zip"
            download="flask_cf_demo.zip"
            className="btn btn-secondary btn-sm"
            style={{ whiteSpace: "nowrap" }}
          >
            Tải mã nguồn Flask (.zip)
          </a>
        </div>
      </div>

      {pendingCount > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #fcd34d",
            background: "#fffbeb",
            color: "#92400e",
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13.5 }}>
            <strong>Có {pendingCount} dữ liệu mới từ Website chưa gộp vào <code>svd_model.pkl</code>.</strong>{" "}
            Website đã tự động loại trừ phim vừa xem và ưu tiên phim cùng thể loại; bấm huấn luyện lại để cập nhật chính thức vào ma trận SVD.
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

      {/* PHẦN 1: QUY TRÌNH HOẠT ĐỘNG 4 BƯỚC CỦA COLLABORATIVE FILTERING VỚI WEBSITE */}
      <div className="admin-card" style={{ padding: 18, marginTop: 16, marginBottom: 18 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>
            Cách Collaborative Filtering hoạt động cùng Website Movix
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-500)", margin: 0 }}>
            Dữ liệu phim và người dùng trên Website Movix dùng chung 1 cơ sở dữ liệu với mô hình gợi ý theo quy trình 4 bước khép kín:
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--ink-50)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 4 }}>
              BƯỚC 1 · DỮ LIỆU ĐẦU VÀO
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Website Movix + Tập mẫu MovieLens</div>
            <p style={{ fontSize: 12.5, color: "var(--ink-600)", margin: 0, lineHeight: 1.5 }}>
              Khi khán giả <strong>xem xong phim, đặt vé hoặc đánh giá sao</strong> trên Web, dữ liệu được ghi thẳng vào bảng{" "}
              <code>watch_history</code> &amp; <code>website_ratings</code> để bổ sung cho{" "}
              <strong style={{ fontVariantNumeric: "tabular-nums" }}>{state?.movielens_ratings?.length || 0}</strong> lượt mẫu MovieLens.
            </p>
          </div>

          <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--ink-50)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 4 }}>
              BƯỚC 2 · THUẬT TOÁN HYBRID
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Kết hợp SVD Đánh giá + Thể loại</div>
            <p style={{ fontSize: 12.5, color: "var(--ink-600)", margin: 0, lineHeight: 1.5 }}>
              Mô hình vừa tìm người dùng cùng gu đánh giá (<strong>SVD</strong>), vừa tính độ khớp thể loại phim (<strong>Cosine</strong>):{" "}
              <code style={{ fontVariantNumeric: "tabular-nums" }}>
                Hybrid = {currentAlpha.toFixed(2)}×SVD + {(1 - currentAlpha).toFixed(2)}×Thể loại
              </code>
              .
            </p>
          </div>

          <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--ink-100)", background: "var(--ink-50)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 4 }}>
              BƯỚC 3 · HUẤN LUYỆN MÔ HÌNH
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              Lưu snapshot <code>svd_model.pkl</code> v{modelInfo.model_version || 1}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-600)", margin: 0, lineHeight: 1.5 }}>
              Độ sai số hiện tại <strong>RMSE = {modelInfo.rmse}</strong> ({modelInfo.n_factors} nhân tố ẩn). Khi có đánh giá mới, bấm{" "}
              <strong>Huấn luyện lại</strong> để ma trận SVD cập nhật trọng số vĩnh viễn.
            </p>
          </div>

          <div style={{ padding: 14, borderRadius: 10, border: "1px solid #c7d2fe", background: "#eef2ff" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 4 }}>
              BƯỚC 4 · KẾT QUẢ MANG LẠI
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Tự động gợi ý nối tiếp trên Web</div>
            <p style={{ fontSize: 12.5, color: "#1e1b4b", margin: 0, lineHeight: 1.5 }}>
              Tự động <strong>loại trừ phim đã xem</strong>, đẩy các phim <strong>chưa xem hợp gu</strong> lên Trang chủ &amp; Chi tiết phim kèm lý do rõ ràng (<em>&ldquo;Vì bạn đã xem...&rdquo;</em>).
            </p>
          </div>
        </div>
      </div>

      {/* PHẦN 2: KẾT QUẢ CỤ THỂ HỆ THỐNG MANG LẠI (TÓM TẮT GIÁ TRỊ) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginBottom: 4 }}>Kết quả 1 · Lọc trùng &amp; Loại trừ phim đã xem</div>
          <div style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#15803d" }}>
            Loại {excludedCount}/{totalMoviesCount} phim · Còn {Math.max(0, totalMoviesCount - excludedCount)} phim đề xuất
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>
            Khách hàng không bao giờ bị gợi ý lại phim đã mua vé hoặc đã xem xong
          </div>
        </div>

        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginBottom: 4 }}>Kết quả 2 · Bắt đúng gu thể loại của khách</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: "var(--brand-700)" }}>
            Ưu tiên: {topGenreVi}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>
            Rút ra từ {watchedList.length} phim đã xem trên Web &amp; lịch sử đánh giá của User {activeUserId}
          </div>
        </div>

        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginBottom: 4 }}>Kết quả 3 · Đầu ra sạch ra Trang chủ</div>
          <div style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {settingsForm.home_enabled ? `Hiển thị Top ${topHomeRecs.length} phim` : "Đang tạm ẩn"}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>
            Khán giả chỉ thấy kết quả gợi ý; toàn bộ tham số SVD chỉ Admin thấy
          </div>
        </div>

        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginBottom: 4 }}>Kết quả 4 · Độ chính xác &amp; Đồng bộ SQLite</div>
          <div style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {state?.watch_history?.length || 0} lượt xem · {state?.website_ratings?.length || 0} đánh giá Web
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
            svd_model.pkl v{modelInfo.model_version || 1} · RMSE {modelInfo.rmse}
          </div>
        </div>
      </div>

      {/* PHẦN 3: THEO DÕI TRỰC TIẾP TRÊN 1 TÀI KHOẢN: ĐẦU VÀO → XỬ LÝ HYBRID → KẾT QUẢ RA TRANG CHỦ */}
      <div className="admin-card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              Minh họa trực tiếp theo Tài khoản: Đầu vào Web → Thuật toán Hybrid → Kết quả trên Trang chủ
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: 0 }}>
              Chọn một tài khoản khách hàng bên dưới để xem cụ thể họ đã xem gì trên Web, thuật toán chấm điểm ra sao và Trang chủ đang hiển thị phim nào cho họ:
            </p>
          </div>
        </div>

        {/* Bộ chọn 1 tài khoản duy nhất (không so sánh 2 user) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, marginBottom: 18 }}>
          {(state?.users || []).map((u) => {
            const isActive = u.id === activeUserId;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSwitchUser(u.id)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: isActive ? "1.5px solid var(--brand-600)" : "1px solid var(--ink-100)",
                  background: isActive ? "var(--brand-50)" : "var(--white)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13.5, gap: 6 }}>
                  <span>{u.full_name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums", color: isActive ? "var(--brand-700)" : "var(--ink-500)" }}>
                    ID {u.id}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>
                  {u.email} · {u.persona}
                </div>
              </button>
            );
          })}
        </div>

        {/* 3 khối rõ ràng: Đầu vào của User -> Xử lý Hybrid -> Kết quả thật trên Trang chủ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 16 }}>
          {/* CỘT 1: ĐẦU VÀO TỪ WEBSITE CỦA TÀI KHOẢN */}
          <div style={{ border: "1px solid var(--ink-100)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 6 }}>
              1. ĐẦU VÀO CỦA {activeUser?.full_name?.toUpperCase()}
            </div>

            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
              Phim đã xem / đã đặt vé trên Website ({watchedList.length})
            </div>
            {watchedList.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginBottom: 12 }}>
                Chưa có lịch sử xem phim trên Web — hệ thống dùng mức phổ biến chung.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {watchedList.map((w) => {
                  const wTitle = w.movie_title || w.title || "Phim Movix";
                  const wGenres = (w.movie_genres || w.genres || "").split("|").filter(Boolean).join(" · ");
                  return (
                    <div
                      key={`${w.user_id}-${w.movie_id}`}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: "var(--ink-50)",
                        fontSize: 12.5,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{wTitle}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>
                        {wGenres ? `${wGenres} · ` : ""}{SOURCE_LABELS[w.source] || w.source}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
              Gu thể loại mô hình rút ra
            </div>
            {affinityList.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Chưa đủ dữ liệu thể loại.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {affinityList.slice(0, 4).map((ga) => (
                  <div
                    key={ga.genre}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12.5,
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--ink-100)",
                    }}
                  >
                    <span>
                      <strong>{ga.genre_vi}</strong> <span style={{ color: "var(--ink-500)" }}>({ga.count} phim)</span>
                    </span>
                    <strong style={{ fontVariantNumeric: "tabular-nums", color: ga.avg_rating >= 4 ? "#15803d" : "var(--ink-700)" }}>
                      {ga.avg_rating.toFixed(2)} ★
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT 2: XỬ LÝ TÍNH ĐIỂM HYBRID & MÔ PHỎNG XEM PHIM MỚI */}
          <div style={{ border: "1px solid var(--ink-100)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 6 }}>
              2. CÁCH THUẬT TOÁN CHẤM ĐIỂM CÁC PHIM CHƯA XEM
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <select
                className="input-control"
                style={{ flex: 1, minWidth: 160, fontSize: 12.5 }}
                value={currentAlpha}
                onChange={(e) => setPreviewAlpha(Number(e.target.value))}
              >
                {ALPHA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                className="input-control"
                style={{ minWidth: 120, fontSize: 12.5 }}
                value={currentGenre}
                onChange={(e) => setPreviewGenre(e.target.value)}
              >
                <option value="ALL">Tất cả thể loại</option>
                {(state?.all_genres || []).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {(state?.recommendations || []).slice(0, 4).map((rec, idx) => {
                const oldScore =
                  prevSnapshot && prevSnapshot.userId === activeUserId ? prevSnapshot.scores[rec.movie_id] : undefined;
                const delta = oldScore !== undefined ? +(rec.predicted_rating - oldScore).toFixed(3) : 0;
                return (
                  <div
                    key={rec.movie_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: "var(--ink-50)",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>#{idx + 1} {rec.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)", fontVariantNumeric: "tabular-nums" }}>
                        SVD {Number(rec.svd_score ?? 0).toFixed(2)}★ · Thể loại {Number(rec.genre_score ?? 0).toFixed(2)}★ · Khớp gu {rec.genre_match_pct}%
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      <strong style={{ color: "var(--brand-700)", fontSize: 13.5 }}>
                        {Number(rec.predicted_rating ?? 0).toFixed(3)} ★
                      </strong>
                      {oldScore !== undefined && Math.abs(delta) >= 0.001 && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? "#16a34a" : "#dc2626" }}>
                          {delta > 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: "1px dashed var(--ink-200)", paddingTop: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>
                Thử nghiệm nhanh: giả lập xem xong hoặc chấm sao 1 phim
              </div>
              <form onSubmit={handleSubmitRating} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select
                  className="input-control"
                  style={{ fontSize: 12.5 }}
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                >
                  {(state?.movies || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      [#{m.id}] {m.title} ({m.genres})
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  <select className="input-control" style={{ fontSize: 12.5 }} value={ratingValue} onChange={(e) => setRatingValue(e.target.value)}>
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
                    placeholder="Ghi chú..."
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
                    ✓ Đánh dấu đã xem xong
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={busy} style={{ flex: 1, whiteSpace: "nowrap" }}>
                    Gửi đánh giá mới
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* CỘT 3: KẾT QUẢ THỰC TẾ HIỂN THỊ TRÊN TRANG CHỦ WEBSITE */}
          <div style={{ border: "1.5px solid #c7d2fe", borderRadius: 10, padding: 14, background: "#f8fafc" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-700)", marginBottom: 6 }}>
              3. KẾT QUẢ MANG LẠI TRÊN TRANG CHỦ WEBSITE
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>
              Mục: &ldquo;{viewerPreview?.section_title || settingsForm.section_title}&rdquo;
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "0 0 10px", lineHeight: 1.45 }}>
              Đây chính là danh sách phim thực tế mà tài khoản <strong>{activeUser?.full_name}</strong> nhìn thấy ở Trang chủ và Chi tiết phim (đã ẩn toàn bộ điểm SVD &amp; số liệu nội bộ):
            </p>

            {!viewerPreview?.enabled ? (
              <div style={{ padding: 16, borderRadius: 8, background: "#fff", border: "1px dashed var(--ink-200)", fontSize: 13, color: "var(--ink-500)" }}>
                Mục gợi ý trên Trang chủ đang tắt bởi cấu hình Admin.
              </div>
            ) : topHomeRecs.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 8, background: "#fff", border: "1px dashed var(--ink-200)", fontSize: 13, color: "var(--ink-500)" }}>
                Không có phim nào khớp bộ lọc thể loại hiện tại.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topHomeRecs.map((rec, idx) => (
                  <div
                    key={rec.movie_id}
                    style={{
                      padding: "9px 11px",
                      borderRadius: 8,
                      background: "#ffffff",
                      border: "1px solid var(--ink-100)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 13.5 }}>#{idx + 1} {rec.title}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--ink-500)", fontVariantNumeric: "tabular-nums" }}>
                        {rec.web_film_id}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--brand-700)", marginTop: 3, fontWeight: 500 }}>
                      {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PHẦN 4: CÀI ĐẶT PHÁT HÀNH RA TRANG CHỦ (CHỈ ADMIN CHỈNH SỬA) */}
      <div className="admin-card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15.5, marginBottom: 4 }}>Cài đặt Gợi ý SVD xuất ra Trang chủ Người xem</h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: 0 }}>
              Điều chỉnh trọng số Hybrid α, bộ lọc thể loại và số lượng phim hiển thị trên Trang chủ. Mọi thay đổi áp dụng ngay sau khi bấm Lưu.
            </p>
          </div>
          <span style={{ fontSize: 12, color: "var(--ink-500)", fontVariantNumeric: "tabular-nums" }}>
            Cập nhật lần cuối: {state?.settings?.updated_at || "—"}
          </span>
        </div>

        <form onSubmit={handleSaveSettings}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Trạng thái trên Trang chủ
              </label>
              <select
                className="input-control"
                value={settingsForm.home_enabled ? "1" : "0"}
                onChange={(e) => setSettingsForm({ ...settingsForm, home_enabled: e.target.value === "1" })}
              >
                <option value="1">Hiển thị gợi ý cho người xem</option>
                <option value="0">Tạm ẩn mục gợi ý</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Tiêu đề hiển thị Trang chủ
              </label>
              <input
                className="input-control"
                value={settingsForm.section_title}
                onChange={(e) => setSettingsForm({ ...settingsForm, section_title: e.target.value })}
                placeholder="Gợi ý phim dành riêng cho bạn"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Số phim gợi ý tối đa
              </label>
              <select
                className="input-control"
                value={settingsForm.home_limit}
                onChange={(e) => setSettingsForm({ ...settingsForm, home_limit: Number(e.target.value) })}
              >
                <option value={4}>4 phim (1 hàng chuẩn)</option>
                <option value={6}>6 phim</option>
                <option value={8}>8 phim (2 hàng)</option>
                <option value={12}>12 phim</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Trọng số Hybrid (α SVD / Thể loại)
              </label>
              <select
                className="input-control"
                value={settingsForm.default_alpha}
                onChange={(e) => setSettingsForm({ ...settingsForm, default_alpha: Number(e.target.value) })}
              >
                {ALPHA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                Lọc thể loại mặc định
              </label>
              <select
                className="input-control"
                value={settingsForm.default_genre_filter}
                onChange={(e) => setSettingsForm({ ...settingsForm, default_genre_filter: e.target.value })}
              >
                <option value="ALL">Tất cả thể loại</option>
                {(state?.all_genres || []).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy} style={{ whiteSpace: "nowrap" }}>
              Lưu cấu hình Trang chủ
            </button>
          </div>
        </form>
      </div>

      {/* PHẦN 5: DỮ LIỆU CHI TIẾT TRONG CƠ SỞ DỮ LIỆU THỐNG NHẤT SQLITE */}
      <div className="admin-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15.5 }}>Dữ liệu thống nhất trong SQLite: Dữ liệu Website Movix vs Mẫu MovieLens</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "website" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("website")}
            >
              Đánh giá mới Web ({state?.website_ratings?.length || 0})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "watched" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("watched")}
            >
              Phim đã xem Web ({state?.watch_history?.length || 0})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "movielens" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("movielens")}
            >
              Mẫu MovieLens ({state?.movielens_ratings?.length || 0})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dataTab === "matrix" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDataTab("matrix")}
            >
              Bảng điểm {totalMoviesCount} phim (User {activeUserId})
            </button>
          </div>
        </div>

        {dataTab === "website" && (
          <div style={{ overflowX: "auto" }}>
            {(state?.website_ratings || []).length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ink-500)", fontSize: 13.5 }}>
                Chưa có đánh giá mới nào từ người dùng trên Website.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Phim</th>
                    <th>Điểm</th>
                    <th>Nguồn từ Web</th>
                    <th>Bình luận / Ghi chú</th>
                    <th>Thời gian</th>
                    <th>Trạng thái svd_model.pkl</th>
                  </tr>
                </thead>
                <tbody>
                  {state.website_ratings.map((w) => (
                    <tr key={w.id}>
                      <td>ID {w.user_id} · {w.user_name}</td>
                      <td><strong>{w.movie_title}</strong></td>
                      <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{Number(w.rating ?? 0).toFixed(1)} ★</td>
                      <td>{SOURCE_LABELS[w.source] || w.source}</td>
                      <td>{w.comment || "—"}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{w.created_at}</td>
                      <td style={{ fontWeight: 700, color: w.included_in_model ? "#16a34a" : "#d97706" }}>
                        {w.included_in_model ? "Đã đưa vào model" : "Chờ retrain"}
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
                    <th>Nguồn đồng bộ</th>
                    <th>Mã đơn vé</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {state.watch_history.map((wh) => (
                    <tr key={wh.id}>
                      <td>ID {wh.user_id} · {wh.user_name}</td>
                      <td><strong>{wh.movie_title || wh.title}</strong></td>
                      <td>{(wh.movie_genres || wh.genres || "").split("|").filter(Boolean).join(" · ")}</td>
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
                Chỉ User {activeUserId}
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
                    <th>Nguồn</th>
                    <th>User ID</th>
                    <th>Phim hợp nhất</th>
                    <th>Thể loại</th>
                    <th>Điểm mẫu</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovielens.slice(0, 80).map((r) => (
                    <tr key={r.id}>
                      <td>MovieLens Seed</td>
                      <td>ID {r.user_id} · {r.user_name}</td>
                      <td><strong>{r.movie_title}</strong></td>
                      <td>{(r.movie_genres || "").split("|").filter(Boolean).join(" · ")}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{Number(r.rating ?? 0).toFixed(1)} ★</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.ml_timestamp}</td>
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
                  <th>ID / Web ID</th>
                  <th>Phim &amp; Thể loại</th>
                  <th>Đã xem?</th>
                  <th>Mẫu ML</th>
                  <th>Web Rating</th>
                  <th>SVD</th>
                  <th>Thể loại</th>
                  <th>Khớp %</th>
                  <th>Hybrid</th>
                </tr>
              </thead>
              <tbody>
                {(state?.all_predictions || []).map((p) => (
                  <tr key={p.movie_id}>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>#{p.movie_id} · {p.web_film_id}</td>
                    <td>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{(p.genres || "").split("|").filter(Boolean).join(" · ")}</div>
                    </td>
                    <td style={{ color: p.user_watched ? "#15803d" : "var(--ink-400)", fontWeight: p.user_watched ? 700 : 400 }}>
                      {p.user_watched ? "Đã xem" : "Chưa xem"}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.user_movielens_rating != null ? `${Number(p.user_movielens_rating).toFixed(1)} ★` : "—"}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.user_website_rating != null
                        ? `${Number(p.user_website_rating).toFixed(1)} ★ (${p.website_included_in_model ? "Đã train" : "Chờ train"})`
                        : "—"}
                    </td>
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
