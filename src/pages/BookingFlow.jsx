import React, { useMemo, useState, useEffect, useRef } from "react";
import { dbService, subscribeDb } from "../lib/supabaseClient.js";
import Stepper from "../components/Stepper.jsx";
import { FALLBACK_POSTER, FALLBACK_COMBO, handleImageError } from "../utils/imageFallback";

const MAX_SEATS = 10; // TC_BK_04

function formatVnd(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

export default function BookingFlow({ go, goBack: appGoBack, params, user }) {
  const [films, setFilms] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [comboFoods, setComboFoods] = useState([]);

  // Load backend data
  const loadData = () => {
    setFilms(dbService.getFilms());
    setCinemas(dbService.getCinemas());
    setRooms(dbService.getRooms());
    setShowtimes(dbService.getShowtimes());
    setComboFoods(dbService.getComboFoods());
  };

  useEffect(() => {
    loadData();
    return subscribeDb(loadData);
  }, []);

  const movie = films.find((m) => m.id === params?.movieId) || films[0] || {};
  const cinema = cinemas.find((c) => c.id === params?.cinemaId) || cinemas[0] || {};
  const showtime =
    showtimes.find((st) => st.id === params?.showtimeId) ||
    showtimes.find((st) => st.filmId === movie.id && st.cinemaId === cinema.id) ||
    showtimes[0] ||
    {};
  const room = rooms.find((r) => r.id === showtime?.roomId) || rooms[0] || {};

  const time = params?.time || showtime?.startTime || "19:30";
  const _today = new Date();
  const defaultLocalDate = `${_today.getFullYear()}-${String(_today.getMonth() + 1).padStart(2, "0")}-${String(_today.getDate()).padStart(2, "0")}`;
  const date = params?.date || showtime?.date || defaultLocalDate;
  const basePrice = showtime?.basePrice || 80000;
  const vipPrice = basePrice + 15000; // 95.000đ
  const couplePrice = 150000; // BUG_BK_02: 150.000đ cho 1 cặp ghế đôi

  // Booking states
  const [step, setStep] = useState("seats"); // seats -> combo -> payment
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [comboQty, setComboQty] = useState({});
  const [promoCode, setPromoCode] = useState(params?.promoCode || "");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [availablePromos, setAvailablePromos] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentSimMode, setPaymentSimMode] = useState("success"); // 'success' | 'failure' (TC_BK_16, TC_BK_17)
  const [bookingError, setBookingError] = useState("");
  const submittingRef = useRef(false);

  // TC_BK_15: Đếm ngược thời gian giữ ghế (5 phút = 300 giây)
  const [holdTimer, setHoldTimer] = useState(300);

  useEffect(() => {
    if (selectedSeats.length === 0) {
      setHoldTimer(300);
      return;
    }

    const interval = setInterval(() => {
      setHoldTimer((prev) => {
        if (prev <= 1) {
          // Hết thời gian giữ ghế: tự động nhả ghế
          clearInterval(interval);
          setSelectedSeats([]);
          setStep("seats");
          setBookingError("Thời gian giữ ghế đã hết (5 phút). Ghế đã được hoàn trả về trạng thái trống. Vui lòng chọn lại ghế!");
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeats.length]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    const list = dbService.getPromotions() || [];
    const activeList = list.filter((p) => {
      const st = (p.status || "").toLowerCase();
      return st.includes("hoạt động") || st.includes("active") || !p.status;
    });
    setAvailablePromos(activeList);
  }, []);

  // Build seat layout: A-D = Standard, E-G = VIP, H = Couple (Sweetbox)
  const seatLayout = useMemo(() => {
    const bookedList = showtime?.seatsBooked || [];

    const defaultRows = [
      { row: "A", count: 12, type: "standard" },
      { row: "B", count: 12, type: "standard" },
      { row: "C", count: 12, type: "standard" },
      { row: "D", count: 12, type: "standard" },
      { row: "E", count: 12, type: "vip" },
      { row: "F", count: 12, type: "vip" },
      { row: "G", count: 12, type: "vip" },
      { row: "H", count: 10, type: "couple" }, // Hàng ghế đôi Sweetbox
    ];

    const layout = room?.seatLayout && room.seatLayout.length > 0
      ? room.seatLayout.map((r, idx) => ({
          ...r,
          type: r.type || (r.couple ? "couple" : r.vip || idx >= room.seatLayout.length - 3 ? "vip" : "standard"),
        }))
      : defaultRows;

    return layout.map((r) => {
      const seats = [];
      const count = r.count || 12;
      const isCoupleRow = r.type === "couple";

      for (let i = 1; i <= count; i++) {
        const id = `${r.row}${i < 10 ? "0" + i : i}`;
        let partnerId = null;
        if (isCoupleRow) {
          // Ghế đôi ghép cặp: 1-2, 3-4, 5-6, 7-8, 9-10
          const partnerNum = i % 2 === 1 ? i + 1 : i - 1;
          partnerId = `${r.row}${partnerNum < 10 ? "0" + partnerNum : partnerNum}`;
        }

        seats.push({
          id,
          row: r.row,
          num: i,
          type: r.type,
          vip: r.type === "vip",
          couple: isCoupleRow,
          partnerId,
          taken: bookedList.includes(id),
        });
      }
      return { row: r.row, type: r.type, seats };
    });
  }, [room, showtime]);

  const seatIndex = useMemo(() => {
    const idx = {};
    seatLayout.forEach((r) => r.seats.forEach((s) => (idx[s.id] = s)));
    return idx;
  }, [seatLayout]);

  // BUG_BK_02: Chọn ghế đôi và tính tiền
  function toggleSeat(seat) {
    if (seat.taken) return;

    if (seat.couple && seat.partnerId) {
      // Ghế đôi: Chọn cả cặp
      const partner = seatIndex[seat.partnerId];
      if (partner?.taken) {
        return setBookingError("Một trong hai ghế của cặp ghế đôi này đã có người đặt!");
      }

      const isCurrentlySelected = selectedSeats.includes(seat.id);
      if (!isCurrentlySelected) {
        if (selectedSeats.length + 2 > MAX_SEATS) {
          return setBookingError(`Bạn chỉ được chọn tối đa ${MAX_SEATS} ghế cho một lần đặt vé`);
        }
        setBookingError("");
        setSelectedSeats((prev) => Array.from(new Set([...prev, seat.id, seat.partnerId])));
      } else {
        setBookingError("");
        setSelectedSeats((prev) => prev.filter((id) => id !== seat.id && id !== seat.partnerId));
      }
    } else {
      // Ghế đơn (Standard hoặc VIP)
      if (!selectedSeats.includes(seat.id) && selectedSeats.length >= MAX_SEATS) {
        return setBookingError(`Bạn chỉ được chọn tối đa ${MAX_SEATS} ghế cho một lần đặt vé`);
      }
      setBookingError("");
      setSelectedSeats((prev) =>
        prev.includes(seat.id) ? prev.filter((s) => s !== seat.id) : [...prev, seat.id]
      );
    }
  }

  // BUG_BK_02: Tính tiền chính xác cho ghế thường, ghế VIP, ghế đôi và hỗn hợp
  const seatTotal = useMemo(() => {
    let standardCount = 0;
    let vipCount = 0;
    let coupleCount = 0;

    selectedSeats.forEach((id) => {
      const s = seatIndex[id];
      if (!s) return;
      if (s.type === "couple") {
        coupleCount++;
      } else if (s.vip || s.type === "vip") {
        vipCount++;
      } else {
        standardCount++;
      }
    });

    // Cặp ghế đôi: mỗi 2 ghế tính 1 giá ghế đôi (150.000đ)
    const couplePairs = Math.ceil(coupleCount / 2);
    return standardCount * basePrice + vipCount * vipPrice + couplePairs * couplePrice;
  }, [selectedSeats, seatIndex, basePrice, vipPrice, couplePrice]);

  const comboTotal = Object.entries(comboQty).reduce((sum, [id, qty]) => {
    const c = comboFoods.find((item) => item.id === id);
    return sum + (c ? c.price * qty : 0);
  }, 0);

  const subtotal = seatTotal + comboTotal;

  // Xử lý mã khuyến mãi
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    let disc = 0;
    if (appliedPromo.discountPercent) {
      disc = Math.round((subtotal * Number(appliedPromo.discountPercent)) / 100);
      if (appliedPromo.maxDiscount) {
        disc = Math.min(disc, Number(appliedPromo.maxDiscount));
      }
    } else if (appliedPromo.maxDiscount) {
      disc = Math.min(Number(appliedPromo.maxDiscount), subtotal);
    }
    return Math.max(0, Math.min(disc, subtotal));
  }, [appliedPromo, subtotal]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  function applyCode(codeToTest) {
    const code = (codeToTest || promoCode || "").trim();
    if (!code) {
      setPromoError("Vui lòng nhập hoặc chọn mã khuyến mãi!");
      return;
    }
    const res = dbService.validatePromo(code, subtotal);
    if (res.valid) {
      setAppliedPromo(res.promo);
      setPromoCode(res.promo.code);
      setPromoError("");
    } else {
      setAppliedPromo(null);
      setPromoError(res.message);
    }
  }

  function handleApplyPromo(e) {
    if (e) e.preventDefault();
    applyCode(promoCode);
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  }

  // Tự động áp dụng nếu có promoCode từ params khi đến bước thanh toán
  useEffect(() => {
    if (step === "payment" && params?.promoCode && !appliedPromo && subtotal > 0) {
      applyCode(params.promoCode);
    }
  }, [step, subtotal]);

  function changeQty(id, delta) {
    setComboQty((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  function goNext() {
    if (step === "seats") {
      // TC_BK_11: chưa chọn ghế
      if (selectedSeats.length === 0) return setBookingError("Vui lòng chọn ít nhất 1 ghế để tiếp tục");
      setBookingError("");
      setStep("combo");
    } else if (step === "combo") {
      setBookingError("");
      setStep("payment");
    } else {
      if (submittingRef.current) return;

      // Phải đăng nhập mới đặt được vé
      if (!user?.id) {
        return go("login", { redirect: "seatSelect", redirectParams: params });
      }
      if (selectedSeats.length === 0) {
        setStep("seats");
        return setBookingError("Vui lòng chọn ít nhất 1 ghế để tiếp tục");
      }

      // BUG_BK_03: Concurrency check - Kiểm tra lại ghế với dữ liệu mới nhất
      const freshShowtime = (dbService.getShowtimes() || []).find((st) => st.id === showtime?.id);
      const freshBooked = freshShowtime?.seatsBooked || showtime?.seatsBooked || [];
      const conflict = selectedSeats.filter((id) => freshBooked.includes(id));
      if (conflict.length > 0) {
        setSelectedSeats((prev) => prev.filter((id) => !conflict.includes(id)));
        setStep("seats");
        return setBookingError(`Ghế ${conflict.join(", ")} đã có khách hàng khác đặt trước. Vui lòng chọn ghế khác!`);
      }

      // TC_BK_17: Mô phỏng thanh toán thất bại
      if (paymentSimMode === "failure") {
        return setBookingError("Thanh toán mô phỏng thất bại (Thẻ bị từ chối hoặc giao dịch bị hủy). Ghế vẫn đang được giữ để bạn thanh toán lại.");
      }

      // TC_BK_10: mã khuyến mãi hợp lệ
      if (appliedPromo) {
        const check = dbService.validatePromo(appliedPromo.code, subtotal);
        if (!check.valid) {
          setAppliedPromo(null);
          setPromoCode("");
          return setPromoError(check.message || "Mã khuyến mãi không đủ điều kiện áp dụng");
        }
      }

      // TC_BK_12, 16: Hoàn tất đặt vé
      const comboSummary = Object.entries(comboQty)
        .filter(([, q]) => q > 0)
        .map(([id, quantity]) => {
          const c = comboFoods.find((item) => item.id === id);
          return {
            id,
            name: c?.name || "Bắp nước",
            quantity,
            price: c?.price || 0,
          };
        });

      const seatDetails = selectedSeats.map((sId) => {
        const s = seatIndex[sId];
        return {
          seatKey: sId,
          type: s?.type === "couple" ? "Couple" : s?.vip ? "VIP" : "Standard",
          price: s?.type === "couple" ? couplePrice / 2 : s?.vip ? vipPrice : basePrice,
        };
      });

      submittingRef.current = true;
      let newOrder;
      try {
        newOrder = dbService.createOrder({
          userId: user?.id || `guest-${Date.now()}`,
          userName: user?.fullName || user?.name || "Khách hàng",
          email: user?.email || "",
          phone: user?.phone || "0988776655",
          filmId: movie.id,
          filmTitle: movie.title,
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          roomId: room.id,
          roomName: room.name || "Phòng 1",
          showtimeId: showtime?.id,
          showtimeTime: time,
          showtimeDate: date,
          seats: seatDetails,
          comboFoods: comboSummary,
          seatAmount: seatTotal,
          comboAmount: comboTotal,
          promotionCode: appliedPromo?.code || null,
          discountAmount: discountAmount,
          totalAmount: grandTotal,
          paymentMethod:
            paymentMethod === "card"
              ? "Thẻ Visa/Mastercard"
              : paymentMethod === "momo"
              ? "Ví điện tử MoMo"
              : "Chuyển khoản VietQR",
        });
      } catch (err) {
        submittingRef.current = false;
        return setBookingError(err?.message || "Thanh toán không thành công. Vui lòng thử lại.");
      }

      if (!newOrder) {
        submittingRef.current = false;
        return setBookingError("Thanh toán không thành công. Vui lòng thử lại.");
      }

      go("bookingSuccess", {
        orderId: newOrder.id,
        ticketCode: newOrder.ticketCode,
        ticketQrUrl: newOrder.ticketQrUrl,
        movieId: movie.id,
        movieTitle: movie.title,
        cinema: cinema.name,
        room: room.name,
        time,
        date,
        seats: selectedSeats,
        total: grandTotal,
      });
    }
  }

  function goBack() {
    setBookingError("");
    if (step === "combo") {
      setStep("seats");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === "payment") {
      setStep("combo");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (typeof appGoBack === "function") {
        appGoBack();
      } else if (movie?.id) {
        go("movie", { id: movie.id });
      } else {
        go("home");
      }
    }
  }

  return (
    <section className="section container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={goBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}
        >
          ← {step === "seats" ? "Quay lại trang trước" : step === "combo" ? "Quay lại chọn ghế" : "Quay lại chọn bắp nước"}
        </button>
        <div className="breadcrumb" style={{ margin: 0 }}>
          <button onClick={() => go("home")}>Trang chủ</button>
          <span className="sep">/</span>
          {movie?.id && (
            <>
              <button onClick={() => go("movie", { id: movie.id })}>{movie.title}</button>
              <span className="sep">/</span>
            </>
          )}
          <span>Đặt vé</span>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            className="detail-poster"
            style={{
              width: 56,
              height: 78,
              background: "var(--brand-50)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {(movie.posterUrl || movie.thumbnail) &&
            ((movie.posterUrl || movie.thumbnail).startsWith("http") ||
              (movie.posterUrl || movie.thumbnail).startsWith("data:image")) ? (
              <img
                src={movie.posterUrl || movie.thumbnail}
                alt={movie.title || "Poster"}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, FALLBACK_POSTER)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 28 }}>{movie.thumbnail || "🎬"}</span>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: 16 }}>{movie.title}</h3>
            <p className="movie-meta">
              {movie.ageRating || "P"} · {movie.duration} phút · {cinema.name} ({room.name || "Phòng 1"})
            </p>
          </div>
        </div>

        {/* TC_BK_15: Countdown Timer */}
        {selectedSeats.length > 0 && (
          <div
            style={{
              background: holdTimer <= 60 ? "#fee2e2" : "var(--brand-50)",
              border: holdTimer <= 60 ? "1px solid #f87171" : "1px solid var(--brand-300)",
              borderRadius: 8,
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 13,
              color: holdTimer <= 60 ? "#b91c1c" : "var(--brand-700)",
            }}
          >
            <span>⏱️</span>
            <span>Thời gian giữ ghế: {formatTimer(holdTimer)}</span>
          </div>
        )}

        <Stepper current={step} />
      </div>

      <div className="seat-map-wrap">
        <div className="card">
          {/* Bước 1: Chọn ghế ngồi (UC06, Hình 11) */}
          {step === "seats" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h3 style={{ margin: 0 }}>Chọn ghế ngồi ({room.name || "Phòng chiếu"})</h3>
                <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
                  Tối đa: <strong>{MAX_SEATS} ghế</strong>
                </div>
              </div>

              <div className="screen-label">MÀN HÌNH CHIẾU</div>
              <div className="screen-bar" />

              {/* BUG_BK_04: Responsive seat container */}
              <div className="seat-map-container">
                {seatLayout.map((r) => {
                  const isCouple = r.type === "couple";
                  return (
                    <div className="seat-row" key={r.row}>
                      <div className="row-label">{r.row}</div>
                      <div className="seat-group">
                        {r.seats.slice(0, isCouple ? 4 : 6).map((s) => (
                          <SeatButton
                            key={s.id}
                            seat={s}
                            selected={selectedSeats.includes(s.id)}
                            onClick={() => toggleSeat(s)}
                          />
                        ))}
                      </div>
                      <div className="seat-aisle" />
                      <div className="seat-group">
                        {r.seats.slice(isCouple ? 4 : 6).map((s) => (
                          <SeatButton
                            key={s.id}
                            seat={s}
                            selected={selectedSeats.includes(s.id)}
                            onClick={() => toggleSeat(s)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chú thích loại ghế */}
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: "white", border: "1px solid var(--ink-200)" }} />
                  Ghế thường ({formatVnd(basePrice)})
                </div>
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: "var(--amber-100)", border: "1px solid #f2d9a3" }} />
                  Ghế VIP ({formatVnd(vipPrice)})
                </div>
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: "#fdf2f8", border: "1px solid #fbcfe8" }} />
                  Ghế đôi Sweetbox ({formatVnd(couplePrice)}/cặp)
                </div>
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: "var(--brand-500)" }} />
                  Đang chọn
                </div>
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: "var(--ink-300)" }} />
                  Đã bán / Đang giữ
                </div>
              </div>
            </>
          )}

          {/* Bước 2: Chọn bắp nước (UC07, Hình 12) */}
          {step === "combo" && (
            <>
              <h3 style={{ marginBottom: 18 }}>Chọn bắp nước & combo ưu đãi (UC07)</h3>
              <div className="combo-list">
                {comboFoods.map((c) => (
                  <div className="combo-row" key={c.id}>
                    <div
                      className="combo-icon"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--brand-50)",
                        flexShrink: 0,
                      }}
                    >
                      {c.image && (c.image.startsWith("http") || c.image.startsWith("data:image")) ? (
                        <img src={c.image} alt={c.name} referrerPolicy="no-referrer" onError={(e) => handleImageError(e, FALLBACK_COMBO)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 32 }}>{c.image || "🍿"}</span>
                      )}
                    </div>
                    <div className="combo-info">
                      <div className="name" style={{ fontWeight: 700 }}>{c.name}</div>
                      <div className="desc">{c.description}</div>
                    </div>
                    <div className="combo-price">{formatVnd(c.price)}</div>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => changeQty(c.id, -1)}>
                        −
                      </button>
                      <div className="qty-val">{comboQty[c.id] || 0}</div>
                      <button className="qty-btn" onClick={() => changeQty(c.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Bước 3: Thanh toán (UC08, Hình 13) */}
          {step === "payment" && (
            <>
              <h3 style={{ marginBottom: 18 }}>Phương thức thanh toán an toàn</h3>
              <PaymentOptions method={paymentMethod} setMethod={setPaymentMethod} />

              {/* TC_BK_16, TC_BK_17: Giả lập kết quả thanh toán kiểm thử */}
              <div style={{ marginTop: 20, padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid var(--ink-200)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)", marginBottom: 8 }}>
                  🧪 Chế độ mô phỏng thanh toán (Testcase TC_BK_16 / TC_BK_17):
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="paymentSimMode"
                      checked={paymentSimMode === "success"}
                      onChange={() => setPaymentSimMode("success")}
                    />
                    <span>Thanh toán thành công (Mặc định)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: "#b91c1c" }}>
                    <input
                      type="radio"
                      name="paymentSimMode"
                      checked={paymentSimMode === "failure"}
                      onChange={() => setPaymentSimMode("failure")}
                    />
                    <span>Mô phỏng thanh toán thất bại</span>
                  </label>
                </div>
              </div>

              {/* Mã giảm giá khuyến mãi (UC18) */}
              <div
                style={{
                  marginTop: 20,
                  padding: 18,
                  background: "var(--ink-50)",
                  border: "1px solid var(--ink-200)",
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🏷️</span> Mã giảm giá & Ưu đãi Movix
                  </h4>
                  {appliedPromo && (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      style={{
                        fontSize: 12,
                        color: "var(--red-500)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ✕ Hủy áp dụng
                    </button>
                  )}
                </div>

                {appliedPromo ? (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid var(--green-500)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--green-600)", fontSize: 14 }}>
                        ✓ Đã kích hoạt mã: <span style={{ textDecoration: "underline" }}>{appliedPromo.code}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-700)", marginTop: 2 }}>
                        {appliedPromo.title || appliedPromo.description} • Giảm {appliedPromo.discountPercent}%
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--green-600)" }}>
                        -{formatVnd(discountAmount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Nhập mã voucher (vd: MOVIX50, CHAOMOI, CINEVIP)..."
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                      }}
                      style={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "0 18px", flexShrink: 0 }}>
                      Áp dụng
                    </button>
                  </form>
                )}

                {promoError && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 12px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "var(--red-500)",
                      fontWeight: 600,
                    }}
                  >
                    ✕ {promoError}
                  </div>
                )}

                {/* Danh sách voucher có sẵn để bấm chọn nhanh */}
                {availablePromos.length > 0 && !appliedPromo && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 8, fontWeight: 600 }}>
                      💡 Hoặc chọn nhanh ưu đãi khả dụng:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {availablePromos.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => applyCode(p.code)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "var(--ink-0)",
                            border: "1px dashed var(--brand-300)",
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand-600)")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--brand-300)")}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                background: "var(--brand-100)",
                                color: "var(--brand-700)",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontWeight: 800,
                                fontSize: 12,
                                letterSpacing: "0.5px",
                              }}
                            >
                              {p.code}
                            </span>
                            <span style={{ fontSize: 12.5, color: "var(--ink-700)" }}>
                              {p.description || p.title}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--brand-600)",
                              whiteSpace: "nowrap",
                              marginLeft: 8,
                            }}
                          >
                            Áp dụng →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar tóm tắt đơn hàng */}
        <div className="card summary-card">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            {(movie.posterUrl || movie.thumbnail) && (movie.posterUrl || movie.thumbnail).startsWith("http") ? (
              <img
                src={movie.posterUrl || movie.thumbnail}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, FALLBACK_POSTER)}
                style={{ width: 46, height: 66, objectFit: "cover", borderRadius: 6, flexShrink: 0, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
              />
            ) : null}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 16, margin: 0, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {movie.title}
              </h3>
              <div style={{ fontSize: 12, color: "var(--brand-600)", fontWeight: 600, marginTop: 3 }}>
                {movie.format || "2D, 3D"} · {movie.ageRating || "P"} · {movie.duration || 120}p
              </div>
            </div>
          </div>
          <div className="summary-row">
            <span>Rạp</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600, textAlign: "right" }}>
              {cinema.name}
            </span>
          </div>
          <div className="summary-row">
            <span>Phòng chiếu</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600 }}>{room.name || "Phòng 1"}</span>
          </div>
          <div className="summary-row">
            <span>Suất chiếu</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 600 }}>
              {time} ({date})
            </span>
          </div>

          <div className="summary-divider" />
          <div className="summary-row">
            <span>Ghế đã chọn ({selectedSeats.length})</span>
          </div>
          {selectedSeats.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--ink-300)", fontStyle: "italic" }}>
              Chưa chọn ghế nào
            </p>
          ) : (
            <div className="chip-list">
              {selectedSeats.map((s) => {
                const sObj = seatIndex[s];
                const label = sObj?.type === "couple" ? "Đôi" : sObj?.vip ? "VIP" : "Thường";
                return (
                  <span className="chip" key={s} style={{ background: sObj?.type === "couple" ? "#fdf2f8" : sObj?.vip ? "var(--amber-100)" : "var(--ink-50)" }}>
                    {s} ({label})
                  </span>
                );
              })}
            </div>
          )}

          {/* Chi tiết từng khoản tiền */}
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Tiền vé ({selectedSeats.length} ghế)</span>
            <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>{formatVnd(seatTotal)}</span>
          </div>
          {comboTotal > 0 && (
            <div className="summary-row">
              <span>Bắp nước combo</span>
              <span>{formatVnd(comboTotal)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: "var(--green-500)" }}>
              <span>Giảm giá ({appliedPromo?.code})</span>
              <span>-{formatVnd(discountAmount)}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span style={{ color: "var(--brand-600)" }}>{formatVnd(grandTotal)}</span>
          </div>

          {bookingError && (
            <div
              role="alert"
              style={{
                marginTop: 14,
                padding: "8px 12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 6,
                fontSize: 13,
                color: "var(--red-500)",
                fontWeight: 600,
              }}
            >
              ✕ {bookingError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <button
              className="btn btn-primary btn-block"
              onClick={goNext}
            >
              {step === "seats"
                ? "Tiếp tục chọn bắp nước →"
                : step === "combo"
                ? "Tiếp tục thanh toán →"
                : "Xác nhận thanh toán ngay"}
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={goBack}>
              ← {step === "seats" ? "Quay lại trang trước" : step === "combo" ? "Quay lại chọn ghế" : "Quay lại chọn bắp nước"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SeatButton({ seat, selected, onClick }) {
  const cls = ["seat"];
  if (seat.couple) cls.push("couple");
  else if (seat.vip) cls.push("vip");
  if (selected) cls.push("selected");
  if (seat.taken) cls.push("taken");

  return (
    <button
      className={cls.join(" ")}
      onClick={onClick}
      disabled={seat.taken}
      title={
        seat.taken
          ? "Ghế đã có người đặt"
          : `Ghế ${seat.id} (${seat.couple ? "Ghế đôi Sweetbox" : seat.vip ? "VIP" : "Thường"})`
      }
    >
      {seat.couple ? `👫 ${seat.id}` : seat.num < 10 ? `0${seat.num}` : seat.num}
    </button>
  );
}

function PaymentOptions({ method, setMethod }) {
  const options = [
    { key: "card", label: "Thẻ Visa / Mastercard / JCB", emoji: "💳" },
    { key: "momo", label: "Ví điện tử MoMo", emoji: "🅜" },
    { key: "banking", label: "Quét mã chuyển khoản VietQR 24/7", emoji: "🏦" },
  ];
  return (
    <div className="combo-list">
      {options.map((o) => (
        <div
          key={o.key}
          className="combo-row"
          style={{
            cursor: "pointer",
            borderColor: method === o.key ? "var(--brand-500)" : "var(--ink-100)",
            background: method === o.key ? "var(--brand-50)" : "white",
          }}
          onClick={() => setMethod(o.key)}
        >
          <div className="combo-icon" style={{ fontSize: 24 }}>{o.emoji}</div>
          <div className="combo-info">
            <div className="name" style={{ fontWeight: 600 }}>{o.label}</div>
          </div>
          <div
            className={`seat ${method === o.key ? "selected" : ""}`}
            style={{ borderRadius: "50%", width: 26, height: 26 }}
          >
            {method === o.key ? "✓" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}