import React, { useState, useEffect } from "react";
import { dbService, subscribeDb } from "../../lib/supabaseClient.js";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    cinemaId: "",
    rowCount: 8,
    colCount: 12,
    hasVip: true,
    hasCouple: true,
  });

  const loadData = () => {
    setRooms(dbService.getRooms());
    const cinList = dbService.getCinemas();
    setCinemas(cinList);
    if (!formData.cinemaId && cinList.length > 0) {
      setFormData((prev) => ({ ...prev, cinemaId: cinList[0].id }));
    }
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormError("");
    setFormData({
      name: "",
      cinemaId: cinemas[0]?.id || "",
      rowCount: 8,
      colCount: 12,
      hasVip: true,
      hasCouple: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setEditingRoom(r);
    setFormError("");
    const hasCouple = (r.seatLayout || []).some((row) => row.couple || row.type === "couple");
    const hasVip = (r.seatLayout || []).some((row) => row.vip || row.type === "vip");

    setFormData({
      name: r.name || "",
      cinemaId: r.cinemaId || "",
      rowCount: r.seatLayout?.length || 8,
      colCount: r.seatLayout?.[0]?.count || 12,
      hasVip,
      hasCouple,
    });
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa phòng chiếu "${name}"?`)) {
      try {
        dbService.deleteRoom(id);
      } catch (err) {
        // TC_ROM_09: Xóa phòng chiếu đã có suất chiếu
        alert(err.message || "Không thể xóa phòng chiếu đã có suất chiếu.");
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError("");

    // TC_ROM_04: Để trống toàn bộ trường khi thêm
    const roomName = (formData.name || "").trim();
    if (!roomName) {
      return setFormError("Vui lòng nhập tên phòng chiếu");
    }

    const rowNum = Number(formData.rowCount);
    const colNum = Number(formData.colCount);

    // TC_ROM_05: Số hàng ghế là số âm (-5)
    if (isNaN(rowNum) || rowNum <= 0 || isNaN(colNum) || colNum <= 0) {
      return setFormError("Số hàng ghế và số ghế mỗi hàng phải là số nguyên dương lớn hơn 0");
    }

    // TC_ROM_06: Thêm phòng chiếu bị trùng tên phòng trong cùng rạp
    const duplicate = rooms.some(
      (r) =>
        r.id !== editingRoom?.id &&
        r.cinemaId === formData.cinemaId &&
        (r.name || "").trim().toLowerCase() === roomName.toLowerCase()
    );
    if (duplicate) {
      return setFormError("Tên phòng chiếu đã tồn tại trong cụm rạp này.");
    }

    // Sinh seat layout theo số hàng và số ghế (TC_ROM_10, TC_ROM_11, TC_ROM_12)
    const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].slice(0, rowNum);
    const layout = rowLetters.map((r, idx) => {
      const isLastRow = idx === rowLetters.length - 1;
      const isSecondLastRow = idx === rowLetters.length - 2;

      // TC_ROM_12: Thiết lập ghế đôi cho hàng cuối cùng
      if (formData.hasCouple && isLastRow) {
        return {
          row: r,
          count: colNum % 2 === 0 ? colNum : colNum - 1,
          type: "couple",
          couple: true,
          vip: false,
        };
      }

      // TC_ROM_11: Thiết lập ghế VIP
      const isVip = formData.hasVip && (isSecondLastRow || (idx >= rowLetters.length - 3 && rowLetters.length > 5));
      return {
        row: r,
        count: colNum,
        type: isVip ? "vip" : "standard",
        vip: isVip,
        couple: false,
      };
    });

    const payload = {
      name: roomName,
      cinemaId: formData.cinemaId,
      seatLayout: layout,
    };

    if (editingRoom) {
      dbService.updateRoom(editingRoom.id, payload);
    } else {
      dbService.addRoom(payload);
    }
    setShowModal(false);
  };

  const getCinemaName = (cId) => {
    const c = cinemas.find((item) => item.id === cId);
    return c ? c.name : "Chưa gắn rạp";
  };

  const calculateTotalSeats = (layout) => {
    if (!Array.isArray(layout)) return 0;
    return layout.reduce((acc, curr) => acc + (curr.count || 0), 0);
  };

  // TC_ROM_01: Tìm phòng chiếu theo tên phòng
  const filteredRooms = rooms.filter((r) => {
    if (selectedCinema !== "all" && r.cinemaId !== selectedCinema) return false;
    if (search.trim() && !r.name?.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Quản lý phòng chiếu</h2>
          <p className="admin-subtitle">Danh sách phòng chiếu theo từng cụm rạp (UC14, Hình 32)</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* TC_ROM_01: Tìm phòng theo tên */}
          <input
            type="text"
            className="input-control"
            placeholder="🔍 Tìm theo tên phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
          />

          <select
            className="input-control"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="all">Tất cả rạp chiếu</option>
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            + Thêm phòng chiếu
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên phòng chiếu</th>
              <th>Thuộc cụm rạp</th>
              <th>Số lượng ghế</th>
              <th>Cấu hình ghế</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right", width: 140 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((r) => {
              const totalSeats = calculateTotalSeats(r.seatLayout);
              const hasCouple = (r.seatLayout || []).some((row) => row.couple || row.type === "couple");
              const hasVip = (r.seatLayout || []).some((row) => row.vip || row.type === "vip");

              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink-900)" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {r.seatLayout?.length || 8} hàng ghế
                    </div>
                  </td>
                  <td>{getCinemaName(r.cinemaId)}</td>
                  <td>
                    <strong>{totalSeats}</strong> ghế
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="badge badge-purple">
                        {r.name.includes("IMAX") ? "IMAX Laser" : r.name.includes("Gold") ? "Gold Class" : "Standard 2D"}
                      </span>
                      {hasVip && <span className="badge badge-amber" style={{ fontSize: 10 }}>VIP</span>}
                      {hasCouple && <span className="badge badge-green" style={{ fontSize: 10 }}>Ghế đôi</span>}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-green">Hoạt động</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        className="icon-action-btn edit"
                        title="Sửa phòng"
                        onClick={() => handleOpenEdit(r)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-action-btn delete"
                        title="Xóa phòng"
                        onClick={() => handleDelete(r.id, r.name)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredRooms.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--ink-500)" }}>
                  Không tìm thấy phòng chiếu nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa Phòng */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h3>{editingRoom ? "Sửa phòng chiếu" : "Thêm phòng chiếu mới"}</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
              <div>
                <label className="form-label">Tên phòng chiếu *</label>
                <input
                  required
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setFormError("");
                  }}
                  placeholder="Ví dụ: Phòng 1 (Standard 2D)"
                />
              </div>

              <div>
                <label className="form-label">Cụm rạp *</label>
                <select
                  className="input-control"
                  style={{ width: "100%" }}
                  value={formData.cinemaId}
                  onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
                >
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Số hàng ghế (A - J)</label>
                  <input
                    type="number"
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.rowCount}
                    onChange={(e) => {
                      setFormData({ ...formData, rowCount: e.target.value });
                      setFormError("");
                    }}
                  />
                </div>
                <div>
                  <label className="form-label">Số ghế mỗi hàng</label>
                  <input
                    type="number"
                    className="input-control"
                    style={{ width: "100%" }}
                    value={formData.colCount}
                    onChange={(e) => {
                      setFormData({ ...formData, colCount: e.target.value });
                      setFormError("");
                    }}
                  />
                </div>
              </div>

              {/* TC_ROM_11, TC_ROM_12: Thiết lập cấu hình ghế */}
              <div style={{ background: "var(--ink-50)", padding: 12, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>Cấu hình phân loại ghế:</div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.hasVip}
                    onChange={(e) => setFormData({ ...formData, hasVip: e.target.checked })}
                  />
                  <span>Thiết lập các hàng ghế VIP ở trung tâm/cuối phòng (TC_ROM_11)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.hasCouple}
                    onChange={(e) => setFormData({ ...formData, hasCouple: e.target.checked })}
                  />
                  <span>Thiết lập hàng ghế đôi Sweetbox ở hàng cuối cùng (TC_ROM_12)</span>
                </label>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--ink-500)", background: "#f8fafc", padding: 10, borderRadius: 6, border: "1px solid var(--ink-200)" }}>
                💡 Tổng số ghế: <strong>{Number(formData.rowCount) * Number(formData.colCount)}</strong> ghế.
              </div>

              {formError && (
                <div role="alert" style={{ padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                  ✕ {formError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? "Cập nhật" : "Lưu phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
