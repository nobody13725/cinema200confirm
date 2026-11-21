import React, { useMemo, useState, useEffect } from "react";
import { dbService, subscribeDb } from "../lib/supabaseClient.js";
import MovieCard from "../components/MovieCard.jsx";
import { normalizeDateToYMD } from "../utils/timeUtils.js";

const PAGE_SIZE = 6;

export default function Movies({ go, params }) {
  const [films, setFilms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(params?.status || "all");
  const [selectedCat, setSelectedCat] = useState(params?.category || "all");
  const [selectedDate, setSelectedDate] = useState(params?.date ? normalizeDateToYMD(params.date) : "all");
  const [selectedAge, setSelectedAge] = useState(params?.age || "all");
  const [q, setQ] = useState(params?.q || "");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = () => {
    setFilms(dbService.getFilms());
    setCategories(dbService.getCategories());
    setShowtimes(dbService.getShowtimes());
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  useEffect(() => {
    if (!params) return;
    if (params.category !== undefined) setSelectedCat(params.category || "all");
    if (params.q !== undefined) setQ(params.q || "");
    if (params.date !== undefined) setSelectedDate(params.date ? normalizeDateToYMD(params.date) : "all");
    if (params.age !== undefined) setSelectedAge(params.age || "all");
    if (params.status !== undefined) setStatusFilter(params.status || "all");
  }, [params?.category, params?.q, params?.date, params?.age, params?.status]);

  // Available dates from showtimes
  const availableDates = useMemo(() => {
    const dates = new Set();
    showtimes.forEach((st) => {
      if (st.date) dates.add(normalizeDateToYMD(st.date));
    });
    return Array.from(dates).sort();
  }, [showtimes]);

  // BUG_SRCH_02: Lọc kết hợp thể loại, ngày chiếu, độ tuổi và từ khóa
  const filtered = useMemo(() => {
    return films.filter((f) => {
      // 1. Trạng thái chiếu
      const matchStatus = statusFilter === "all" || f.status === statusFilter;

      // 2. Tên phim / từ khóa (TC_SRCH_01, TC_SRCH_02)
      const cleanQ = q.trim().toLowerCase();
      const matchQ =
        !cleanQ ||
        f.title?.toLowerCase().includes(cleanQ) ||
        f.description?.toLowerCase().includes(cleanQ);

      // 3. Thể loại (TC_SRCH_04)
      const matchGenre =
        selectedCat === "all" ||
        (Array.isArray(f.genre)
          ? f.genre.some((g) => g.toLowerCase().includes(selectedCat.toLowerCase()))
          : (f.genre || f.category || "").toLowerCase().includes(selectedCat.toLowerCase()));

      // 4. Ngày chiếu (TC_SRCH_05, BUG_SRCH_02 / TC_SRCH_08)
      // Phải có ít nhất 1 suất chiếu vào ngày đã chọn
      const matchDate =
        selectedDate === "all" ||
        showtimes.some((st) => st.filmId === f.id && normalizeDateToYMD(st.date) === selectedDate);

      // 5. Độ tuổi (TC_SRCH_06)
      const matchAge = selectedAge === "all" || f.ageRating === selectedAge;

      return matchStatus && matchQ && matchGenre && matchDate && matchAge;
    });
  }, [films, showtimes, statusFilter, q, selectedCat, selectedDate, selectedAge]);

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [q, statusFilter, selectedCat, selectedDate, selectedAge]);

  // TC_SRCH_09: Phân trang kết quả tìm kiếm
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedFilms = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const allGenres = [
    "Hành động",
    "Kinh dị",
    "Hài",
    "Hoạt hình",
    "Tâm lý",
    "Khoa học viễn tưởng",
    "Phiêu lưu",
    "Tình cảm",
  ];

  return (
    <section className="section container">
      <div className="section-head">
        <div>
          <h2>{q ? `Kết quả tìm kiếm cho "${q}"` : "Danh sách & Tìm kiếm phim"}</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-500)", marginTop: 2 }}>
            Tìm kiếm theo tên phim, lọc theo thể loại, ngày chiếu, độ tuổi và trạng thái
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Ô nhập tìm kiếm (TC_SRCH_01, 02) */}
          <div style={{ flex: "1 1 280px" }}>
            <input
              type="text"
              className="input-control"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14 }}
              placeholder="🔍 Tìm theo tên phim, nội dung (vd: Avatar, Dune...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Lọc thể loại (TC_SRCH_04) */}
          <div style={{ minWidth: 160 }}>
            <select
              className="input-control"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8 }}
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="all">Tất cả thể loại</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc ngày chiếu (TC_SRCH_05, BUG_SRCH_02) */}
          <div style={{ minWidth: 160 }}>
            <select
              className="input-control"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all">Tất cả ngày chiếu</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc độ tuổi (TC_SRCH_06) */}
          <div style={{ minWidth: 140 }}>
            <select
              className="input-control"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8 }}
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
            >
              <option value="all">Mọi độ tuổi</option>
              <option value="P">P (Mọi lứa tuổi)</option>
              <option value="K">K (Dưới 13 kèm phụ huynh)</option>
              <option value="T13">T13 (Từ 13 tuổi)</option>
              <option value="T16">T16 (Từ 16 tuổi)</option>
              <option value="C18">C18 (Từ 18 tuổi)</option>
            </select>
          </div>

          {(q || selectedCat !== "all" || selectedDate !== "all" || selectedAge !== "all" || statusFilter !== "all") && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setQ("");
                setSelectedCat("all");
                setSelectedDate("all");
                setSelectedAge("all");
                setStatusFilter("all");
              }}
              style={{ padding: "8px 14px", height: 42 }}
            >
              ↺ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Tab trạng thái phim (TC_LST_01, 02, 06) */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--ink-100)", paddingTop: 12 }}>
          <button
            className="chip"
            style={{
              background: statusFilter === "all" ? "var(--brand-500)" : "var(--ink-50)",
              color: statusFilter === "all" ? "white" : "var(--ink-700)",
              padding: "6px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setStatusFilter("all")}
          >
            Tất cả trạng thái ({films.length})
          </button>
          <button
            className="chip"
            style={{
              background: statusFilter === "Đang chiếu" ? "var(--brand-500)" : "var(--ink-50)",
              color: statusFilter === "Đang chiếu" ? "white" : "var(--ink-700)",
              padding: "6px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setStatusFilter("Đang chiếu")}
          >
            Đang chiếu ({films.filter((f) => f.status === "Đang chiếu").length})
          </button>
          <button
            className="chip"
            style={{
              background: statusFilter === "Sắp chiếu" ? "var(--brand-500)" : "var(--ink-50)",
              color: statusFilter === "Sắp chiếu" ? "white" : "var(--ink-700)",
              padding: "6px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setStatusFilter("Sắp chiếu")}
          >
            Sắp chiếu ({films.filter((f) => f.status === "Sắp chiếu").length})
          </button>
        </div>
      </div>

      {/* Thông tin số lượng kết quả */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5, color: "var(--ink-500)" }}>
        <div>
          Tìm thấy <strong>{filtered.length}</strong> phim phù hợp
          {selectedCat !== "all" && <span> · Thể loại: <strong>{selectedCat}</strong></span>}
          {selectedDate !== "all" && <span> · Ngày: <strong>{selectedDate}</strong></span>}
          {selectedAge !== "all" && <span> · Độ tuổi: <strong>{selectedAge}</strong></span>}
        </div>
        {totalPages > 1 && (
          <div>
            Trang <strong>{currentPage}</strong> / {totalPages}
          </div>
        )}
      </div>

      {/* Danh sách phim hoặc thông báo không tìm thấy (TC_SRCH_03) */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 20px", color: "var(--ink-500)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <h3 style={{ color: "var(--ink-800)", marginBottom: 6 }}>Không tìm thấy phim phù hợp</h3>
          <p style={{ maxWidth: 440, margin: "0 auto 16px", fontSize: 14 }}>
            Không có bộ phim nào thỏa mãn toàn bộ tiêu chí tìm kiếm và bộ lọc hiện tại. Vui lòng thử từ khóa khác hoặc điều chỉnh lại bộ lọc.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setQ("");
              setSelectedCat("all");
              setSelectedDate("all");
              setSelectedAge("all");
              setStatusFilter("all");
            }}
          >
            ↺ Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="movie-grid">
            {paginatedFilms.map((m) => (
              <MovieCard key={m.id} movie={m} go={go} />
            ))}
          </div>

          {/* Phân trang (TC_SRCH_09) */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                marginTop: 32,
              }}
            >
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ← Trang trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  className={`btn btn-sm ${currentPage === pNum ? "btn-primary" : "btn-secondary"}`}
                  style={{ minWidth: 36, padding: "6px 12px", fontWeight: 700 }}
                  onClick={() => {
                    setCurrentPage(pNum);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {pNum}
                </button>
              ))}

              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Trang sau →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
