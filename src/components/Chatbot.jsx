import React, { useState, useEffect, useRef } from "react";
import { dbService, cfService, isOrderMatchingUser } from "../lib/supabaseClient.js";
import { getLocalYMD, normalizeDateToYMD, isPastShowtime, formatDateVN } from "../utils/timeUtils.js";

const TOOL_LABELS = {
  get_svd_recommendations: "SVD AI",
  search_movies_and_showtimes: "Phim & Suất chiếu",
  navigate_movix_page: "Điều hướng nhanh",
  get_active_promotions: "Khuyến mãi",
  check_tickets_and_watch_history: "Tra cứu vé",
  get_ticket_pricing_and_combos: "Giá vé & Combo",
};

const ORDER_STATUS_VI = {
  pending: "Chờ nhân viên duyệt",
  confirmed: "Đã duyệt · Đã xem",
  used: "Đã soát vé · Đã xem",
  cancelled: "Đã hủy",
};

function stripVN(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function extractDateYMDFromText(rawText) {
  const plain = stripVN(rawText);
  if (plain.includes("hom nay")) return getLocalYMD(0);
  if (plain.includes("ngay mai") || /\bmai\b/.test(plain)) return getLocalYMD(1);
  if (plain.includes("ngay kia") || plain.includes("ngay mot")) return getLocalYMD(2);

  const ymdMatch = rawText.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, "0")}-${ymdMatch[3].padStart(2, "0")}`;
  }
  const dmyFull = rawText.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (dmyFull) {
    return `${dmyFull[3]}-${dmyFull[2].padStart(2, "0")}-${dmyFull[1].padStart(2, "0")}`;
  }
  const dmyShort = rawText.match(/(?:ngay\s*)?(\d{1,2})[/-](\d{1,2})\b/);
  if (dmyShort) {
    const day = Number(dmyShort[1]);
    const month = Number(dmyShort[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${new Date().getFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  const dayOnly = plain.match(/ngay\s+(\d{1,2})\b/);
  if (dayOnly) {
    const day = Number(dayOnly[1]);
    if (day >= 1 && day <= 31) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return "";
}

function findCityInText(rawText, cities) {
  const plain = stripVN(rawText);
  for (const ct of cities || []) {
    const ctPlain = stripVN(ct.name);
    if (ctPlain && plain.includes(ctPlain)) return ct;
    if (ctPlain.includes("ho chi minh")) {
      if (plain.includes("tp hcm") || plain.includes("tphcm") || plain.includes("hcm") || plain.includes("sai gon") || plain.includes("ho chi minh")) {
        return ct;
      }
    }
  }
  return null;
}

function findCinemaInText(rawText, cinemas) {
  const plain = stripVN(rawText);
  const aliases = [
    { key: "ba trieu", id: "cin-1" },
    { key: "landmark", id: "cin-2" },
    { key: "keangnam", id: "cin-2" },
    { key: "quang trung", id: "cin-3" },
    { key: "nguyen du", id: "cin-4" },
    { key: "thao dien", id: "cin-5" },
    { key: "da nang", id: "cin-6" },
    { key: "ninh kieu", id: "cin-7" },
    { key: "imperia", id: "cin-8" },
    { key: "thanh xuan", id: "cin-9" },
    { key: "hai chau", id: "cin-10" },
  ];
  for (const cin of cinemas || []) {
    if (plain.includes(stripVN(cin.name))) return cin;
  }
  for (const al of aliases) {
    if (plain.includes(al.key)) {
      const hit = (cinemas || []).find((c) => c.id === al.id);
      if (hit) return hit;
    }
  }
  return null;
}

function compactText(str) {
  return stripVN(str).replace(/[^a-z0-9]/g, "");
}

function findFilmInText(rawText, films) {
  const plain = stripVN(rawText);
  const compactQuery = compactText(rawText);
  if (!plain || !compactQuery) return null;

  // Tránh nhầm từ "mai" trong "ngày mai", "tối mai", "mai mốt" với phim "Mai (Trấn Thành)"
  const plainWithoutTimeMai = plain
    .replace(/\b(ngay|sang|trua|chieu|toi|dem)\s+mai\b/g, " ")
    .replace(/\bmai\s+(mot|nay|sau)\b/g, " ");

  const stopTokens = new Set([
    "the", "and", "part", "two", "one", "of", "in", "on", "to", "a", "an",
    "phim", "tap", "phan", "cua", "va", "mot", "nhung", "bi", "an", "dieu", "uoc"
  ]);

  let bestFilm = null;
  let bestScore = 0;

  for (const f of films || []) {
    const rawCandidates = [
      f.title,
      ...(Array.isArray(f.otherTitles) ? f.otherTitles : []),
    ].filter(Boolean);

    const expandedCandidates = [];
    for (const cand of rawCandidates) {
      expandedCandidates.push(cand);
      const beforeColon = cand.split(":")[0]?.trim();
      if (beforeColon && beforeColon !== cand) {
        expandedCandidates.push(beforeColon);
        const withoutNum = beforeColon.replace(/\s+\d+$/, "").trim();
        if (withoutNum && withoutNum !== beforeColon) expandedCandidates.push(withoutNum);
      }
      const beforeParen = cand.split("(")[0]?.trim();
      if (beforeParen && beforeParen !== cand) expandedCandidates.push(beforeParen);
    }

    let filmScore = 0;

    for (const cand of expandedCandidates) {
      const candPlain = stripVN(cand);
      const candCompact = compactText(cand);
      if (!candCompact) continue;

      if (candCompact.length <= 3) {
        const re = new RegExp(`\\b${candPlain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        if (re.test(plainWithoutTimeMai)) {
          filmScore = Math.max(filmScore, 90);
        }
        continue;
      }

      if (plain.includes(candPlain)) {
        filmScore = Math.max(filmScore, 100 + candCompact.length);
      } else if (compactQuery.includes(candCompact)) {
        filmScore = Math.max(filmScore, 80 + candCompact.length);
      }
    }

    if (filmScore === 0) {
      const titleWords = stripVN([f.title, ...(f.otherTitles || [])].join(" "))
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4 && !stopTokens.has(w));
      let tokenHits = 0;
      let hitLen = 0;
      for (const w of new Set(titleWords)) {
        if (plain.includes(w) || compactQuery.includes(w)) {
          tokenHits += 1;
          hitLen += w.length;
        }
      }
      if (tokenHits > 0) {
        filmScore = tokenHits * 30 + hitLen;
      }
    }

    if (filmScore > bestScore) {
      bestScore = filmScore;
      bestFilm = f;
    }
  }

  return bestScore >= 30 ? bestFilm : null;
}

function parseShowtimeDateObj(ymd, hm) {
  const [y, m, d] = (ymd || "").split("-").map(Number);
  const [hh, mm] = (hm || "00:00").split(":").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
}

function formatTimeRemainingVN(totalMinutes) {
  const mins = Math.max(1, Math.round(totalMinutes));
  const totalHours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const hmPart = remMins > 0 ? `${totalHours} giờ ${remMins} phút` : `${totalHours} giờ`;
    const dayPart = `${days} ngày${hours > 0 ? ` ${hours} giờ` : ""}${remMins > 0 ? ` ${remMins} phút` : ""}`;
    return `${hmPart} (${dayPart})`;
  }
  if (totalHours > 0) {
    return remMins > 0 ? `${totalHours} giờ ${remMins} phút` : `${totalHours} giờ`;
  }
  return `${remMins} phút`;
}

function extractTimeWindow(rawLower, plain) {
  if (/\bsáng\b/.test(rawLower) || /\b(buoi sang|sang nay|sang mai)\b/.test(plain)) {
    return { label: "buổi sáng", minHM: "06:00", maxHM: "11:59" };
  }
  if (/\btrưa\b/.test(rawLower) || /\b(buoi trua|trua nay|trua mai)\b/.test(plain)) {
    return { label: "buổi trưa", minHM: "11:30", maxHM: "14:00" };
  }
  if (/\bchiều\b/.test(rawLower) || /\b(buoi chieu|chieu nay|chieu mai)\b/.test(plain)) {
    return { label: "buổi chiều", minHM: "12:00", maxHM: "17:59" };
  }
  if (/\btối\b/.test(rawLower) || /\b(buoi toi|toi nay|toi mai)\b/.test(plain)) {
    return { label: "buổi tối", minHM: "18:00", maxHM: "21:59" };
  }
  if (/\b(khuya|đêm)\b/.test(rawLower) || /\b(suat muon|chieu muon|dem nay)\b/.test(plain)) {
    return { label: "suất khuya", minHM: "22:00", maxHM: "23:59" };
  }
  return null;
}

function isFilmAllowedForAge(film, age) {
  if (!Number.isFinite(age)) return true;
  const rating = (film?.ageRating || "P").toUpperCase();
  if (age < 18 && (rating === "C18" || rating === "T18" || rating === "18+")) return false;
  if (age < 16 && (rating === "T16" || rating === "C16" || rating === "16+")) return false;
  if (age < 13 && (rating === "T13" || rating === "13+")) return false;
  return true;
}

export default function Chatbot({ go, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState("");
  const messagesEndRef = useRef(null);

  const isStaffOrAdmin = Boolean(
    user && (user.role === "admin" || user.role === "administrator" || user.role === "employee" || user.role === "staff")
  );

  // Khởi tạo / cập nhật lời chào đơn giản, thân thiện
  useEffect(() => {
    const greeting = "Chào bạn! Bạn cần Movix giúp gì hôm nay ạ?";

    setMessages([
      {
        id: `welcome-${user?.id || "guest"}`,
        sender: "bot",
        text: greeting,
        time: "Vừa xong",
        actions: [],
        toolsUsed: [],
      },
    ]);
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const quickActions = isStaffOrAdmin
    ? [
        "Còn bao nhiêu vé chờ duyệt?",
        "Kiểm tra mã MVX-77410",
        "Lịch chiếu hôm nay ở Hà Nội",
        "Gợi ý phim theo sở thích (SVD)",
        "Có mã giảm giá nào?",
      ]
    : [
        "Lịch chiếu hôm nay ở Hà Nội",
        "Gợi ý phim theo sở thích (SVD)",
        "Vé của tôi thế nào rồi?",
        "Có mã giảm giá nào?",
        "Tôi 15 tuổi xem phim gì?",
        "Giá vé & combo?",
      ];

  // Xây dựng snapshot dữ liệu thật từ CSDL Movix gửi lên server cho Gemini Function Calling
  function buildContextSnapshot() {
    const films = (dbService.getFilms() || []).map((f) => ({
      id: f.id,
      title: f.title,
      otherTitles: Array.isArray(f.otherTitles) ? f.otherTitles : [],
      genre: f.genre,
      ageRating: f.ageRating || "P",
      duration: f.duration,
      rating: f.rating,
      status: f.status,
      format: f.format || "2D",
      actors: Array.isArray(f.actors) ? f.actors.slice(0, 5) : [],
      directors: Array.isArray(f.directors) ? f.directors.slice(0, 3) : [],
      releaseDate: f.releaseDate || "",
      posterUrl: f.posterUrl && !String(f.posterUrl).startsWith("data:") ? f.posterUrl : "",
      description: (f.description || "").slice(0, 220),
    }));

    const cities = (dbService.getCities() || []).map((ct) => ({
      id: ct.id,
      name: ct.name,
    }));

    const cinemas = (dbService.getCinemas() || []).map((c) => ({
      id: c.id,
      name: c.name,
      cityId: c.cityId,
      city: cities.find((ct) => ct.id === c.cityId)?.name || c.city || "",
      address: c.address,
    }));

    const showtimes = (dbService.getShowtimes() || []).map((st) => ({
      id: st.id,
      filmId: st.filmId,
      cinemaId: st.cinemaId,
      date: normalizeDateToYMD(st.date) || st.date,
      startTime: st.startTime,
      basePrice: st.basePrice || 80000,
      totalSeats: st.totalSeats || 96,
      seatsBookedCount: Array.isArray(st.seatsBooked) ? st.seatsBooked.length : 0,
    }));

    const promotions = (dbService.getPromotions() || []).map((p) => ({
      code: p.code,
      title: p.title,
      description: p.description,
      discountPercent: p.discountPercent,
      maxDiscount: p.maxDiscount,
      startDate: p.startDate,
      endDate: p.endDate,
      usageLimit: p.usageLimit,
      usedCount: p.usedCount,
      status: p.status,
    }));

    const comboFoods = (dbService.getComboFoods() || []).map((c) => ({
      id: c.id,
      name: c.name,
      price: c.price,
    }));

    const allOrders = dbService.getOrders() || [];
    const userOrders = user
      ? allOrders
          .filter((o) => isOrderMatchingUser(o, user))
          .map((o) => ({
            ticketCode: o.ticketCode,
            filmId: o.filmId,
            filmTitle: o.filmTitle,
            cinemaName: o.cinemaName,
            roomName: o.roomName,
            showtimeDate: o.showtimeDate,
            showtimeTime: o.showtimeTime,
            seats: (o.seats || []).map((s) => s.seatKey || s),
            orderStatus: o.orderStatus,
            statusLabel: ORDER_STATUS_VI[o.orderStatus] || o.orderStatus,
          }))
      : [];

    const watchHistory = user
      ? (dbService.getUserWatchHistory(user) || []).map((w) => ({
          ticketCode: w.ticketCode,
          filmId: w.filmId,
          filmTitle: w.filmTitle,
          showtimeDate: w.showtimeDate,
          reviewed: Boolean(w.review),
          reviewRate: w.review?.rate || null,
        }))
      : [];

    const pendingStaffCount = isStaffOrAdmin
      ? allOrders.filter((o) => o.orderStatus === "pending").length
      : 0;
    const staffLookupOrders = isStaffOrAdmin
      ? allOrders.slice(0, 20).map((o) => ({
          ticketCode: o.ticketCode,
          userName: o.userName,
          phone: o.phone,
          filmTitle: o.filmTitle,
          cinemaName: o.cinemaName,
          showtimeDate: o.showtimeDate,
          showtimeTime: o.showtimeTime,
          orderStatus: o.orderStatus,
          statusLabel: ORDER_STATUS_VI[o.orderStatus] || o.orderStatus,
        }))
      : [];

    const now = new Date();
    const clientNowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    return {
      clientTodayYMD: getLocalYMD(0),
      clientNowHM,
      films,
      cities,
      cinemas,
      showtimes,
      promotions,
      comboFoods,
      userOrders,
      watchHistory,
      pendingStaffCount,
      staffLookupOrders,
    };
  }

  // BƯỚC 1: Xử lý trực tiếp nối SVD + Khuyến mãi + Tra cứu vé + Lọc lịch chiếu đa điều kiện + Ngữ cảnh hội thoại
  async function generateDirectResponse(userMsg, historyMessages = []) {
    const raw = (userMsg || "").trim().toLowerCase();
    const plain = stripVN(raw);
    const films = dbService.getFilms() || [];
    const cities = dbService.getCities() || [];
    const cinemas = dbService.getCinemas() || [];
    const showtimes = dbService.getShowtimes() || [];
    const promos = dbService.getPromotions() || [];
    const orders = dbService.getOrders() || [];
    const combos = dbService.getComboFoods() || [];

    // Trích xuất ngữ cảnh hội thoại trước đó cho các câu hỏi nối tiếp ("phim đó", "thế còn ngày mai?", "ở Sài Gòn thì sao?")
    const isFollowUpPhrase =
      /\b(phim do|phim nay|the con|con ngay mai|con hom nay|thi sao|dat luon|dat ve do|suat nao|rap nao khac)\b/.test(plain) ||
      plain.length <= 28;
    let contextFilm = null;
    let contextCity = null;
    let contextCinema = null;
    if (Array.isArray(historyMessages) && historyMessages.length > 0) {
      const recentSlice = historyMessages.slice(-5).reverse();
      for (const h of recentSlice) {
        if (!h?.text) continue;
        if (!contextFilm) contextFilm = findFilmInText(h.text, films);
        if (!contextCity) contextCity = findCityInText(h.text, cities);
        if (!contextCinema) contextCinema = findCinemaInText(h.text, cinemas);
      }
    }

    const ageMatchGlobal = raw.match(/(\d{1,2})\s*tuổi/);
    const requestedAge = ageMatchGlobal ? parseInt(ageMatchGlobal[1], 10) : null;
    const requestedTimeWindow = extractTimeWindow(raw, plain);
    const minSeatsMatch = raw.match(/(\d{1,2})\s*(?:ghế|người|vé|chỗ)/);
    const minSeatsRequired = minSeatsMatch ? Math.max(1, parseInt(minSeatsMatch[1], 10)) : 1;

    const wantsDirectNav =
      plain.includes("dua toi") ||
      plain.includes("dua thang") ||
      plain.includes("mo trang") ||
      plain.includes("den trang") ||
      plain.includes("chuyen den") ||
      plain.includes("cho xem") ||
      plain.includes("muon xem") ||
      plain.includes("lich chieu") ||
      plain.includes("cac rap");

    const buildSeatActionForFilm = (film, targetDateYMD = "", targetCityId = "", targetCinemaId = "") => {
      const todayStr = getLocalYMD(0);
      const upcoming = showtimes.find((st) => {
        if (st.filmId !== film.id) return false;
        const stYMD = normalizeDateToYMD(st.date) || todayStr;
        if (targetDateYMD && stYMD !== targetDateYMD) return false;
        if (targetCinemaId && st.cinemaId !== targetCinemaId) return false;
        if (targetCityId) {
          const cin = cinemas.find((c) => c.id === st.cinemaId);
          if (!cin || cin.cityId !== targetCityId) return false;
        }
        return !isPastShowtime(stYMD, st.startTime) && (st.seatsBooked?.length || 0) < (st.totalSeats || 96);
      });
      if (!upcoming) return null;
      const upYMD = normalizeDateToYMD(upcoming.date) || todayStr;
      return {
        type: "seatSelect",
        movieId: film.id,
        cinemaId: upcoming.cinemaId,
        showtimeId: upcoming.id,
        time: upcoming.startTime,
        date: upYMD,
        label: `🎟️ Đặt vé ${upcoming.startTime} (${formatDateVN(upYMD)})`,
      };
    };

    // Ngoài phạm vi
    const offTopicKeywords = ["thời tiết", "nhiệt độ", "trời mưa", "toán", "phương trình", "bóng đá", "chính trị"];
    if (offTopicKeywords.some((kw) => raw.includes(kw)) || /^[0-9+\-*/=^. ]+$/.test(raw)) {
      return {
        text: "Xin lỗi bạn, tôi là trợ lý chuyên trách của rạp Movix. Tôi chỉ hỗ trợ gợi ý phim SVD, lịch chiếu, khuyến mãi, tra cứu vé và đặt vé tại Movix thôi ạ!",
        toolsUsed: [],
        actions: [],
      };
    }

    // 1. Tra cứu vé / trạng thái duyệt vé / lịch sử đã xem
    const codeMatch = raw.match(/mvx-\d+/i);
    if (
      codeMatch ||
      raw.includes("vé của tôi") ||
      raw.includes("kiểm tra vé") ||
      raw.includes("trạng thái vé") ||
      raw.includes("chờ duyệt") ||
      raw.includes("lịch sử xem") ||
      raw.includes("đã xem")
    ) {
      if (codeMatch) {
        const code = codeMatch[0].toUpperCase();
        const found = orders.find((o) => o.ticketCode?.toUpperCase() === code);
        if (!found) {
          return {
            text: `Không tìm thấy vé mã ${code} trong hệ thống.`,
            toolsUsed: ["check_tickets_and_watch_history"],
            actions: [],
          };
        }
        const canSee = isStaffOrAdmin || (user && isOrderMatchingUser(found, user));
        if (!canSee) {
          return {
            text: `Bạn cần đăng nhập đúng tài khoản sở hữu vé ${code} hoặc tài khoản Nhân viên/Admin để xem chi tiết vé này.`,
            toolsUsed: ["check_tickets_and_watch_history"],
            actions: [{ type: "navigate", route: "login", label: "🔐 Đăng nhập ngay" }],
          };
        }
        const seats = (found.seats || []).map((s) => s.seatKey || s).join(", ");
        const stLabel = ORDER_STATUS_VI[found.orderStatus] || found.orderStatus;
        const watchedNote =
          found.orderStatus === "confirmed" || found.orderStatus === "used"
            ? "Phim đã được tính vào Lịch sử đã xem và đủ điều kiện viết đánh giá!"
            : found.orderStatus === "pending"
            ? "Vé đang chờ nhân viên duyệt; sau khi duyệt sẽ tính là đã xem."
            : "";
        return {
          text: `Thông tin vé #${found.ticketCode}:\n• Phim: ${found.filmTitle}\n• Khách: ${found.userName}\n• Rạp: ${found.cinemaName} (${found.showtimeTime} · ${found.showtimeDate})\n• Ghế: ${seats || "—"}\n• Trạng thái: ${stLabel}\n${watchedNote}`,
          toolsUsed: ["check_tickets_and_watch_history"],
          actions: [
            isStaffOrAdmin
              ? { type: "navigate", route: "admin", label: "🎫 Mở Duyệt vé & Soát vé" }
              : { type: "navigate", route: "profile", label: "🎟️ Xem lịch sử vé & đã xem" },
          ],
        };
      }

      if (isStaffOrAdmin && (raw.includes("chờ duyệt") || raw.includes("bao nhiêu vé") || plain.includes("duyet ve"))) {
        const pendingOrders = orders.filter((o) => o.orderStatus === "pending");
        const list = pendingOrders
          .slice(0, 4)
          .map((o) => `• #${o.ticketCode} — ${o.userName} (${o.filmTitle})`)
          .join("\n");
        const navAction = {
          type: "navigate",
          route: "admin",
          params: { tab: "ticketApproval" },
          label: "🎫 Mở cổng Duyệt vé & Soát vé",
        };
        return {
          text:
            pendingOrders.length > 0
              ? `Hiện có ${pendingOrders.length} vé đang chờ duyệt:\n${list}`
              : "Hiện không có vé nào đang chờ duyệt!",
          toolsUsed: ["check_tickets_and_watch_history"],
          actions: [navAction],
          autoNavigate: wantsDirectNav ? navAction : null,
        };
      }

      if (!user) {
        return {
          text: "Vui lòng đăng nhập để tôi kiểm tra vé và lịch sử phim đã xem của riêng bạn!",
          toolsUsed: ["check_tickets_and_watch_history"],
          actions: [{ type: "navigate", route: "login", label: "🔐 Đăng nhập ngay" }],
        };
      }

      const myOrders = orders.filter((o) => isOrderMatchingUser(o, user));
      const myWatched = dbService.getUserWatchHistory(user);
      if (myOrders.length === 0) {
        return {
          text: `Tài khoản ${user.fullName || user.name} hiện chưa có đơn đặt vé nào. Bạn hãy chọn phim để đặt vé ngay nhé!`,
          toolsUsed: ["check_tickets_and_watch_history"],
          actions: [{ type: "navigate", route: "movies", label: "🎬 Khám phá phim đang chiếu" }],
        };
      }
      const orderLines = myOrders
        .slice(0, 4)
        .map((o) => `• #${o.ticketCode} (${o.filmTitle}): ${ORDER_STATUS_VI[o.orderStatus] || o.orderStatus}`)
        .join("\n");
      const targetProfileTab = plain.includes("da xem") || plain.includes("danh gia") ? "watched" : "history";
      const profileAction = {
        type: "navigate",
        route: "profile",
        params: { tab: targetProfileTab },
        label: targetProfileTab === "watched" ? "🎬 Mở Lịch sử phim đã xem" : "🎟️ Mở Lịch sử vé & Đã xem",
      };
      return {
        text: `Tài khoản ${user.fullName || user.name} hiện có ${myOrders.length} vé và ${myWatched.length} phim đã xem:\n\n${orderLines}`,
        toolsUsed: ["check_tickets_and_watch_history"],
        actions: [profileAction],
        autoNavigate: wantsDirectNav ? profileAction : null,
      };
    }

    // 1a. Điều hướng nhanh Đăng nhập / Đăng ký / Trang chủ
    if (plain.includes("dang nhap") || plain.includes("dang ky") || plain.includes("trang chu")) {
      const targetRoute = plain.includes("dang ky") ? "register" : plain.includes("trang chu") ? "home" : "login";
      const navLabel =
        targetRoute === "register"
          ? "📝 Mở trang Đăng ký tài khoản"
          : targetRoute === "home"
          ? "🏠 Về Trang chủ Movix"
          : "🔐 Mở trang Đăng nhập";
      const navAct = { type: "navigate", route: targetRoute, params: {}, label: navLabel };
      return {
        text: `Bấm nút bên dưới để ${navLabel.replace(/^[^\s]+\s/, "").toLowerCase()}:`,
        toolsUsed: ["navigate_movix_page"],
        actions: [navAct],
      };
    }

    // 1b. Điều hướng thẳng tới Lịch chiếu / hoặc tính thời gian đếm ngược tới suất chiếu gần nhất
    const requestedDateYMD = extractDateYMDFromText(raw);
    let requestedCity = findCityInText(raw, cities);
    let requestedCinema = findCinemaInText(raw, cinemas);
    let requestedFilm = findFilmInText(raw, films);

    // Tự kế thừa phim/thành phố/rạp từ lượt chat trước nếu khách hỏi nối tiếp ("thế còn ngày mai?", "ở TP.HCM thì sao?", "bao nhiêu giờ nữa chiếu?")
    if (!requestedFilm && isFollowUpPhrase && !plain.includes("phim gi") && !plain.includes("phim nao")) {
      requestedFilm = contextFilm;
    }
    if (!requestedCity && !requestedCinema && isFollowUpPhrase && (requestedDateYMD || requestedTimeWindow)) {
      requestedCity = contextCity;
      requestedCinema = contextCinema;
    }

    const genresList = ["hành động", "kinh dị", "hoạt hình", "tình cảm", "khoa học", "hài", "gia đình"];
    const foundGenreInQuery = genresList.find((g) => raw.includes(g));

    const isCountdownQuery =
      plain.includes("bao nhieu gio") ||
      plain.includes("bao nhieu tieng") ||
      plain.includes("may gio nua") ||
      plain.includes("may tieng nua") ||
      plain.includes("bao lau nua") ||
      plain.includes("con may gio") ||
      plain.includes("con may tieng") ||
      plain.includes("con bao lau") ||
      plain.includes("som nhat") ||
      plain.includes("suat dau tien");

    if (isCountdownQuery && (requestedFilm || requestedDateYMD || requestedCity || requestedCinema)) {
      const now = new Date();
      const todayStr = getLocalYMD(0);
      const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const targetCityId = requestedCity?.id || requestedCinema?.cityId || "";
      const targetCinemaId = requestedCinema?.id || "";

      const candidates = showtimes
        .map((st) => {
          const stYMD = normalizeDateToYMD(st.date) || todayStr;
          const dt = parseShowtimeDateObj(stYMD, st.startTime);
          return { st, stYMD, dt };
        })
        .filter(({ st, stYMD, dt }) => {
          if (!dt || dt.getTime() <= now.getTime()) return false;
          if (requestedDateYMD && stYMD !== requestedDateYMD) return false;
          if (requestedFilm && st.filmId !== requestedFilm.id) return false;
          if (requestedTimeWindow && (st.startTime < requestedTimeWindow.minHM || st.startTime > requestedTimeWindow.maxHM)) {
            return false;
          }
          if (targetCinemaId && st.cinemaId !== targetCinemaId) return false;
          if (targetCityId) {
            const cin = cinemas.find((c) => c.id === st.cinemaId);
            if (!cin || cin.cityId !== targetCityId) return false;
          }
          const filmObj = films.find((f) => f.id === st.filmId);
          if (requestedAge !== null && filmObj && !isFilmAllowedForAge(filmObj, requestedAge)) return false;
          const avail = (st.seatsTotal || st.totalSeats || 96) - (st.seatsBooked?.length || 0);
          return !isPastShowtime(stYMD, st.startTime) && avail >= minSeatsRequired;
        })
        .sort((a, b) => a.dt.getTime() - b.dt.getTime());

      if (candidates.length === 0) {
        const targetLabel = requestedFilm ? `phim "${requestedFilm.title}"` : "các phim";
        const dateLabel = requestedDateYMD ? ` ngày ${formatDateVN(requestedDateYMD)}` : "";
        const areaLabel = requestedCinema
          ? ` tại ${requestedCinema.name}`
          : requestedCity
          ? ` tại ${requestedCity.name}`
          : "";
        return {
          text: `Hiện không tìm thấy suất chiếu sắp tới còn ghế nào của ${targetLabel}${areaLabel}${dateLabel}. Bạn có thể bấm nút bên dưới để kiểm tra lịch chiếu các ngày khác:`,
          toolsUsed: ["search_movies_and_showtimes"],
          actions: [
            {
              type: "navigate",
              route: "showtimes",
              params: {
                ...(requestedDateYMD ? { date: requestedDateYMD } : { date: todayStr }),
                ...(targetCityId ? { cityId: targetCityId } : {}),
                ...(targetCinemaId ? { cinemaId: targetCinemaId } : {}),
                ...(requestedFilm ? { movieId: requestedFilm.id } : {}),
              },
              label: "🗓️ Xem Lịch chiếu Movix",
            },
          ],
        };
      }

      const first = candidates[0];
      const diffMinutes = (first.dt.getTime() - now.getTime()) / 60000;
      const waitText = formatTimeRemainingVN(diffMinutes);
      const firstFilm = requestedFilm || films.find((f) => f.id === first.st.filmId);

      // Gom các rạp có cùng giờ chiếu sớm nhất đó
      const sameEarliestSlots = candidates
        .filter((item) => item.stYMD === first.stYMD && item.st.startTime === first.st.startTime)
        .slice(0, 4);

      const cinemaNamesText = sameEarliestSlots
        .map((item) => {
          const cin = cinemas.find((c) => c.id === item.st.cinemaId);
          return cin?.name || "Movix";
        })
        .join(", ");

      const seatButtons = sameEarliestSlots.slice(0, 2).map((item) => {
        const cin = cinemas.find((c) => c.id === item.st.cinemaId);
        return {
          type: "seatSelect",
          movieId: item.st.filmId,
          cinemaId: item.st.cinemaId,
          showtimeId: item.st.id,
          time: item.st.startTime,
          date: item.stYMD,
          label: `🎟️ Đặt suất ${item.st.startTime} (${formatDateVN(item.stYMD)}) · ${cin?.name || "Movix"}`,
        };
      });

      const actions = [];
      if (firstFilm) {
        actions.push({
          type: "movie",
          filmId: firstFilm.id,
          title: firstFilm.title,
          posterUrl: firstFilm.posterUrl || "",
          genre: firstFilm.genre || "",
          ageRating: firstFilm.ageRating || "P",
        });
      }
      actions.push(...seatButtons);
      actions.push({
        type: "navigate",
        route: "showtimes",
        params: {
          date: first.stYMD,
          ...(targetCityId ? { cityId: targetCityId } : {}),
          ...(targetCinemaId ? { cinemaId: targetCinemaId } : {}),
          ...(firstFilm ? { movieId: firstFilm.id } : {}),
        },
        label: `🗓️ Xem thêm lịch chiếu${firstFilm ? ` ${firstFilm.title}` : ""} (${formatDateVN(first.stYMD)})`,
      });

      return {
        text: `⏳ Hiện tại là ${nowHM} (${formatDateVN(todayStr)}).\n\nSuất chiếu sớm nhất${firstFilm ? ` của phim "${firstFilm.title}"` : ""}${requestedDateYMD ? ` ngày ${formatDateVN(requestedDateYMD)}` : ""} sẽ bắt đầu lúc ${first.st.startTime} (${formatDateVN(first.stYMD)}) tại ${cinemaNamesText} — tức còn khoảng ${waitText} nữa!`,
        toolsUsed: ["search_movies_and_showtimes"],
        actions,
      };
    }

    const isShowtimeQuery =
      plain.includes("lich chieu") ||
      plain.includes("suat chieu") ||
      plain.includes("gio chieu") ||
      plain.includes("rap nao") ||
      Boolean(requestedDateYMD) ||
      Boolean(requestedTimeWindow && (requestedCity || requestedCinema || requestedFilm || plain.includes("xem") || plain.includes("chieu"))) ||
      Boolean(requestedCity && (plain.includes("rap") || plain.includes("xem") || plain.includes("chieu"))) ||
      Boolean(requestedCinema);

    // Nếu người dùng hỏi theo ngày / thành phố / rạp / buổi cụ thể -> lọc kết hợp đa điều kiện (kể cả tuổi, thể loại, số ghế).
    if (isShowtimeQuery && (requestedDateYMD || requestedCity || requestedCinema || requestedTimeWindow)) {
      const targetDate = requestedDateYMD || getLocalYMD(0);
      const targetCityId = requestedCity?.id || requestedCinema?.cityId || "";
      const targetCinemaId = requestedCinema?.id || "";

      // Chỉ xem danh sách rạp (không hỏi giờ/lịch chiếu/ngày cụ thể) -> có thể mở trang Rạp nếu hỏi đúng "các rạp ở ..."
      const isPureCinemaList =
        (plain.includes("cac rap") || plain.includes("he thong rap") || plain.includes("rap nao")) &&
        !plain.includes("lich chieu") &&
        !plain.includes("suat chieu") &&
        !requestedDateYMD &&
        !requestedTimeWindow &&
        !requestedFilm;

      if (isPureCinemaList && targetCityId) {
        const cityCinemas = cinemas.filter((c) => c.cityId === targetCityId);
        const cinList = cityCinemas.map((c) => `• ${c.name} (${c.address})`).join("\n");
        const navCinemasAction = {
          type: "navigate",
          route: "cinemas",
          params: { cityId: targetCityId },
          label: `🏢 Xem hệ thống rạp tại ${requestedCity.name}`,
        };
        const navShowtimesAction = {
          type: "navigate",
          route: "showtimes",
          params: { cityId: targetCityId, date: getLocalYMD(0) },
          label: `🗓️ Xem lịch chiếu hôm nay tại ${requestedCity.name}`,
        };
        return {
          text: `Tại ${requestedCity.name} hiện có ${cityCinemas.length} cụm rạp Movix:\n\n${cinList}\n\nBấm nút bên dưới để xem danh sách rạp hoặc lịch chiếu tại ${requestedCity.name}:`,
          toolsUsed: ["navigate_movix_page"],
          actions: [navCinemasAction, navShowtimesAction],
        };
      }

      const matchingShowtimes = showtimes.filter((st) => {
        const stYMD = normalizeDateToYMD(st.date) || getLocalYMD(0);
        if (stYMD !== targetDate) return false;
        if (requestedFilm && st.filmId !== requestedFilm.id) return false;
        if (requestedTimeWindow && (st.startTime < requestedTimeWindow.minHM || st.startTime > requestedTimeWindow.maxHM)) {
          return false;
        }
        const f = films.find((x) => x.id === st.filmId);
        if (requestedAge !== null && f && !isFilmAllowedForAge(f, requestedAge)) return false;
        if (foundGenreInQuery && f && !`${f.genre} ${f.description}`.toLowerCase().includes(foundGenreInQuery)) {
          return false;
        }
        if (targetCinemaId && st.cinemaId !== targetCinemaId) return false;
        if (targetCityId) {
          const cin = cinemas.find((c) => c.id === st.cinemaId);
          if (!cin || cin.cityId !== targetCityId) return false;
        }
        const avail = (st.totalSeats || 96) - (st.seatsBooked?.length || 0);
        return !isPastShowtime(stYMD, st.startTime) && avail >= minSeatsRequired;
      });

      const navParams = {
        date: targetDate,
        ...(targetCityId ? { cityId: targetCityId } : {}),
        ...(targetCinemaId ? { cinemaId: targetCinemaId } : {}),
        ...(requestedFilm ? { movieId: requestedFilm.id } : {}),
      };

      const areaName = requestedCinema
        ? requestedCinema.name
        : requestedCity
        ? `các rạp ở ${requestedCity.name}`
        : "tất cả rạp Movix";
      const dateVN = formatDateVN(targetDate);
      const filterNotes = [
        requestedTimeWindow ? requestedTimeWindow.label : "",
        foundGenreInQuery ? `thể loại ${foundGenreInQuery}` : "",
        requestedAge !== null ? `phù hợp ${requestedAge} tuổi` : "",
        minSeatsRequired > 1 ? `đủ ${minSeatsRequired} ghế` : "",
      ].filter(Boolean);
      const filterSuffix = filterNotes.length > 0 ? ` (${filterNotes.join(", ")})` : "";

      const navShowtimesAction = {
        type: "navigate",
        route: "showtimes",
        params: navParams,
        label: `🗓️ Mở Lịch chiếu ${areaName} (${dateVN})`,
      };

      const actions = [navShowtimesAction];
      const byCinema = {};
      matchingShowtimes.forEach((st) => {
        if (!byCinema[st.cinemaId]) byCinema[st.cinemaId] = [];
        byCinema[st.cinemaId].push(st);
      });

      const summaryLines = Object.entries(byCinema)
        .slice(0, 3)
        .map(([cId, stList]) => {
          const cin = cinemas.find((c) => c.id === cId);
          const times = stList
            .slice(0, 4)
            .map((st) => {
              const f = films.find((x) => x.id === st.filmId);
              return `${st.startTime} (${f?.title || "Phim"})`;
            })
            .join(", ");
          return `• ${cin?.name || "Rạp Movix"}: ${times}`;
        });

      const seenFilms = new Set();
      matchingShowtimes.forEach((st) => {
        if (actions.length >= 5 || seenFilms.has(st.filmId)) return;
        const f = films.find((x) => x.id === st.filmId);
        if (f) {
          seenFilms.add(f.id);
          actions.push({
            type: "movie",
            filmId: f.id,
            title: f.title,
            posterUrl: f.posterUrl || "",
            genre: f.genre || "",
            ageRating: f.ageRating || "P",
            seatAction: buildSeatActionForFilm(f, targetDate, targetCityId, targetCinemaId),
          });
        }
      });

      const textSummary =
        matchingShowtimes.length > 0
          ? `Tìm thấy ${matchingShowtimes.length} suất chiếu còn ghế tại ${areaName} ngày ${dateVN}${filterSuffix}:\n\n${summaryLines.join("\n")}\n\nBấm nút bên dưới để mở trang Lịch chiếu với bộ lọc sẵn:`
          : `Hiện chưa có suất chiếu còn ghế tại ${areaName} ngày ${dateVN}${filterSuffix}. Bạn có thể bấm nút bên dưới để mở trang Lịch chiếu (${areaName}) kiểm tra hoặc chọn ngày lân cận:`;

      return {
        text: textSummary,
        toolsUsed: ["search_movies_and_showtimes", "navigate_movix_page"],
        actions,
      };
    }

    // 2. Gợi ý cá nhân hóa trực tiếp từ SVD (AI_Recommendation)
    if (
      raw.includes("svd") ||
      raw.includes("sở thích") ||
      raw.includes("hợp gu") ||
      raw.includes("gợi ý") ||
      raw.includes("xem gì") ||
      raw.includes("nên xem") ||
      raw.includes("đề xuất")
    ) {
      // Kiểm tra nếu hỏi theo độ tuổi thì ưu tiên lọc tuổi trước
      const ageMatch = raw.match(/(\d{1,2})\s*tuổi/);
      if (!ageMatch && !raw.includes("tuổi")) {
        try {
          const uid = user?.id || "guest";
          const svdRes = await cfService.getRecommendationsByUser(uid, 5);
          const recs = svdRes?.recommendations || [];
          if (recs.length > 0) {
            const actions = [];
            const lines = recs.slice(0, 4).map((r, idx) => {
              const matched =
                films.find((f) => f.id === (r.web_film_id || r.movie_id)) ||
                films.find((f) => f.title?.toLowerCase() === r.title?.toLowerCase());
              if (matched) {
                actions.push({
                  type: "movie",
                  filmId: matched.id,
                  title: matched.title,
                  posterUrl: matched.posterUrl || r.poster_url || r.poster || "",
                  genre: matched.genre || r.genres || "",
                  ageRating: matched.ageRating || "P",
                  score: r.predicted_rating,
                  seatAction: buildSeatActionForFilm(matched),
                });
              }
              return `${idx + 1}. ${r.title} (${r.genres}) — Dự đoán SVD: ${r.predicted_rating}★`;
            });
            const headerNote = user
              ? `Top gợi ý SVD dành riêng cho ${user.fullName || user.name} (${svdRes.strategy}):`
              : "Top phim gợi ý nổi bật từ mô hình SVD (hãy đăng nhập để nhận gợi ý cá nhân hóa theo lịch sử riêng):";
            return {
              text: `${headerNote}\n\n${lines.join("\n")}\n\nBấm trực tiếp thẻ bên dưới để xem chi tiết hoặc đặt vé ngay:`,
              toolsUsed: ["get_svd_recommendations"],
              actions,
            };
          }
        } catch {
          // fallback sang danh sách phim hệ thống nếu API SVD lỗi
        }
      }
    }

    // 3. Khuyến mãi / Voucher
    if (
      raw.includes("khuyến mãi") ||
      raw.includes("giảm giá") ||
      raw.includes("voucher") ||
      raw.includes("mã giảm") ||
      raw.includes("ưu đãi")
    ) {
      const today = new Date().toISOString().slice(0, 10);
      const active = promos.filter((p) => {
        const s = (p.status || "").toLowerCase();
        if (s && !s.includes("hoạt động") && !s.includes("active")) return false;
        if (p.endDate && p.endDate < today) return false;
        if (p.usageLimit && (p.usedCount || 0) >= p.usageLimit) return false;
        return true;
      });
      if (active.length === 0) {
        return {
          text: "Hiện chưa có mã khuyến mãi nào đang mở. Bạn hãy kiểm tra lại mục Khuyến mãi sau nhé!",
          toolsUsed: ["get_active_promotions"],
          actions: [{ type: "navigate", route: "promotions", label: "🏷️ Mở trang Khuyến mãi" }],
        };
      }
      const lines = active
        .slice(0, 4)
        .map(
          (p) =>
            `• ${p.code}: Giảm ${p.discountPercent || 0}% (tối đa ${(p.maxDiscount || 0).toLocaleString("vi-VN")}đ) — ${p.title || p.description}`
        )
        .join("\n");
      const promoNavAction = {
        type: "navigate",
        route: "promotions",
        label: "🏷️ Xem chi tiết & Lấy mã",
      };
      return {
        text: `Các mã khuyến mãi đang áp dụng trên Movix:\n\n${lines}`,
        toolsUsed: ["get_active_promotions"],
        actions: [promoNavAction],
        autoNavigate: wantsDirectNav ? promoNavAction : null,
      };
    }

    // 4. Giá vé, Combo & Tính nhẩm tổng chi phí vé + combo + mã giảm giá
    if (
      raw.includes("giá vé") ||
      raw.includes("bao nhiêu tiền") ||
      raw.includes("bảng giá") ||
      raw.includes("combo") ||
      raw.includes("tính tiền") ||
      raw.includes("hết bao nhiêu")
    ) {
      const vipQtyMatch = plain.match(/(\d+)\s*(?:ve\s*)?vip/);
      const sbQtyMatch = plain.match(/(\d+)\s*(?:ve\s*|cap\s*)?(?:doi|sweetbox)/);
      const stdQtyMatch = plain.match(/(\d+)\s*(?:ve\s*)?(?:thuong|standard)/);
      const genericTicketMatch = plain.match(/(\d+)\s*ve\b/);
      const comboQtyMatch = plain.match(/(\d+)\s*(?:combo|bap\s*nuoc|phan\s*combo)/);

      const vipQty = vipQtyMatch ? parseInt(vipQtyMatch[1], 10) : 0;
      const sbQty = sbQtyMatch ? parseInt(sbQtyMatch[1], 10) : 0;
      let stdQty = stdQtyMatch ? parseInt(stdQtyMatch[1], 10) : 0;
      if (vipQty === 0 && sbQty === 0 && stdQty === 0 && genericTicketMatch) {
        stdQty = parseInt(genericTicketMatch[1], 10);
      }

      const matchedCombo = combos.find((c) => {
        const cPlain = stripVN(c.name);
        return (
          (plain.includes("doi") || plain.includes("couple")) && (cPlain.includes("doi") || cPlain.includes("couple")) ||
          plain.includes("solo") && cPlain.includes("solo") ||
          plain.includes("pho mai") && cPlain.includes("pho mai") ||
          plain.includes("nachos") && cPlain.includes("nachos") ||
          plain.includes("binh nuoc") && cPlain.includes("binh nuoc")
        );
      }) || (comboQtyMatch || plain.includes("combo") ? combos[0] : null);
      const comboQty = comboQtyMatch ? parseInt(comboQtyMatch[1], 10) : matchedCombo && (stdQty + vipQty + sbQty > 0) ? 1 : 0;

      const matchedPromo = promos.find((p) => p.code && plain.includes(String(p.code).toLowerCase()));

      if (stdQty + vipQty + sbQty > 0 || comboQty > 0) {
        const ticketSum = stdQty * 80000 + vipQty * 95000 + sbQty * 150000;
        const comboSum = matchedCombo && comboQty > 0 ? Number(matchedCombo.price || 0) * comboQty : 0;
        const subtotal = ticketSum + comboSum;
        let discount = 0;
        if (matchedPromo && subtotal > 0) {
          if (matchedPromo.discountPercent) {
            discount = Math.round((subtotal * Number(matchedPromo.discountPercent)) / 100);
            if (matchedPromo.maxDiscount) discount = Math.min(discount, Number(matchedPromo.maxDiscount));
          } else if (matchedPromo.maxDiscount) {
            discount = Math.min(Number(matchedPromo.maxDiscount), subtotal);
          }
        }
        const total = Math.max(0, subtotal - discount);
        const breakdown = [
          stdQty > 0 ? `• ${stdQty} vé Thường x 80.000đ = ${(stdQty * 80000).toLocaleString("vi-VN")}đ` : "",
          vipQty > 0 ? `• ${vipQty} vé VIP x 95.000đ = ${(vipQty * 95000).toLocaleString("vi-VN")}đ` : "",
          sbQty > 0 ? `• ${sbQty} ghế đôi Sweetbox x 150.000đ = ${(sbQty * 150000).toLocaleString("vi-VN")}đ` : "",
          comboQty > 0 && matchedCombo
            ? `• ${comboQty} ${matchedCombo.name} x ${Number(matchedCombo.price || 0).toLocaleString("vi-VN")}đ = ${comboSum.toLocaleString("vi-VN")}đ`
            : "",
          matchedPromo ? `• Mã giảm giá ${matchedPromo.code}: -${discount.toLocaleString("vi-VN")}đ` : "",
        ]
          .filter(Boolean)
          .join("\n");

        return {
          text: `Dự toán chi phí đặt vé Movix:\n${breakdown}\n\n👉 Tổng thanh toán: ${total.toLocaleString("vi-VN")}đ`,
          toolsUsed: ["get_ticket_pricing_and_combos"],
          actions: [{ type: "navigate", route: "showtimes", label: "🎟️ Chọn suất chiếu & Đặt vé" }],
        };
      }

      const comboText = combos
        .slice(0, 4)
        .map((c) => `• ${c.name}: ${(c.price || 0).toLocaleString("vi-VN")}đ`)
        .join("\n");
      return {
        text: `Bảng giá vé Movix:\n• Ghế Thường (Standard): 80.000đ\n• Ghế VIP: 95.000đ\n• Ghế đôi Sweetbox: 150.000đ/cặp\n\nCombo bắp nước:\n${comboText || "• Combo Solo: 79.000đ"}\n\nMẹo: Bạn có thể hỏi kiểu "2 vé VIP 1 combo đôi mã MOVIX50 hết bao nhiêu" để tôi tính luôn nhé!`,
        toolsUsed: ["get_ticket_pricing_and_combos"],
        actions: [{ type: "navigate", route: "showtimes", label: "🕒 Xem lịch chiếu & Đặt vé" }],
      };
    }

    // 5. Độ tuổi (tuyệt đối chặn C18/T18/T16/T13 không phù hợp)
    if (requestedAge !== null || raw.includes("tuổi")) {
      const age = requestedAge !== null ? requestedAge : 15;
      const allowed = films.filter((f) => isFilmAllowedForAge(f, age));
      const actions = allowed.slice(0, 3).map((f) => ({
        type: "movie",
        filmId: f.id,
        title: f.title,
        posterUrl: f.posterUrl || "",
        genre: f.genre || "",
        ageRating: f.ageRating || "P",
        seatAction: buildSeatActionForFilm(f),
      }));
      const listStr = allowed
        .slice(0, 4)
        .map((f) => `• ${f.title} (${f.ageRating || "P"} - ${f.duration}p): ${f.genre || "Chiếu rạp"}`)
        .join("\n");
      return {
        text: `Với độ tuổi ${age}, Movix chỉ chọn các phim phù hợp quy định (không hiển thị phim quá tuổi):\n\n${listStr}`,
        toolsUsed: ["search_movies_and_showtimes"],
        actions,
      };
    }

    // 5b. Phim điểm cao nhất / hay nhất / sắp chiếu
    if (plain.includes("diem cao nhat") || plain.includes("hay nhat") || plain.includes("rating cao") || plain.includes("sap chieu")) {
      const isUpcoming = plain.includes("sap chieu");
      const pool = isUpcoming
        ? films.filter((f) => f.status === "Sắp chiếu")
        : [...films].filter((f) => f.status === "Đang chiếu").sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      const top = (pool.length > 0 ? pool : films).slice(0, 4);
      const list = top.map((f, i) => `${i + 1}. ${f.title} (⭐ ${f.rating || 8.5} · ${f.ageRating || "P"} · ${f.duration}p)`).join("\n");
      return {
        text: isUpcoming
          ? `Các phim SẮP CHIẾU trên Movix:\n\n${list}`
          : `Top phim đang chiếu được đánh giá cao nhất trên Movix:\n\n${list}`,
        toolsUsed: ["search_movies_and_showtimes"],
        actions: top.map((f) => ({
          type: "movie",
          filmId: f.id,
          title: f.title,
          posterUrl: f.posterUrl || "",
          genre: f.genre || "",
          ageRating: f.ageRating || "P",
          seatAction: buildSeatActionForFilm(f),
        })),
      };
    }

    // 6. Hỏi rạp đang chiếu / suất chiếu / nội dung / diễn viên / đạo diễn của 1 phim cụ thể
    const matchedFilm = requestedFilm || findFilmInText(raw, films);
    if (matchedFilm) {
      const asksAboutPlotOrCast =
        plain.includes("noi dung") ||
        plain.includes("ke ve") ||
        plain.includes("tom tat") ||
        plain.includes("ai dong") ||
        plain.includes("dien vien") ||
        plain.includes("dao dien") ||
        plain.includes("thoi luong") ||
        plain.includes("may phut") ||
        plain.includes("dinh dang") ||
        plain.includes("co hay khong") ||
        plain.includes("co hay k");

      if (asksAboutPlotOrCast) {
        const cast = Array.isArray(matchedFilm.actors) ? matchedFilm.actors.join(", ") : "Đang cập nhật";
        const dirs = Array.isArray(matchedFilm.directors) ? matchedFilm.directors.join(", ") : "Đang cập nhật";
        return {
          text: `Thông tin phim "${matchedFilm.title}" (⭐ ${matchedFilm.rating || 8.5} · ${matchedFilm.ageRating || "P"} · ${matchedFilm.duration} phút):\n• Đạo diễn: ${dirs}\n• Diễn viên: ${cast}\n• Định dạng: ${matchedFilm.format || "2D"}\n• Nội dung: ${matchedFilm.description || "Đang cập nhật."}`,
          toolsUsed: ["search_movies_and_showtimes"],
          actions: [
            {
              type: "movie",
              filmId: matchedFilm.id,
              title: matchedFilm.title,
              posterUrl: matchedFilm.posterUrl || "",
              genre: matchedFilm.genre || "",
              ageRating: matchedFilm.ageRating || "P",
              seatAction: buildSeatActionForFilm(matchedFilm),
            },
            {
              type: "navigate",
              route: "showtimes",
              params: { movieId: matchedFilm.id, date: getLocalYMD(0) },
              label: `🗓️ Xem lịch chiếu ${matchedFilm.title}`,
            },
          ],
        };
      }

      const todayStr = getLocalYMD(0);
      const filmSt = showtimes
        .filter((st) => {
          const stYMD = normalizeDateToYMD(st.date) || todayStr;
          const avail = (st.totalSeats || 96) - (st.seatsBooked?.length || 0);
          return (
            st.filmId === matchedFilm.id &&
            !isPastShowtime(stYMD, st.startTime) &&
            avail >= minSeatsRequired
          );
        })
        .sort((a, b) => {
          const da = normalizeDateToYMD(a.date) || todayStr;
          const db = normalizeDateToYMD(b.date) || todayStr;
          return `${da} ${a.startTime}`.localeCompare(`${db} ${b.startTime}`);
        });

      const byCinema = {};
      filmSt.forEach((st) => {
        if (!byCinema[st.cinemaId]) byCinema[st.cinemaId] = [];
        byCinema[st.cinemaId].push(st);
      });

      const cinemaEntries = Object.entries(byCinema);
      const cinemaSummaryLines = cinemaEntries.slice(0, 5).map(([cinId, stList]) => {
        const cin = cinemas.find((c) => c.id === cinId);
        const city = cities.find((ct) => ct.id === cin?.cityId);
        const timesStr = stList
          .slice(0, 4)
          .map((st) => `${st.startTime} (${formatDateVN(normalizeDateToYMD(st.date) || todayStr)})`)
          .join(", ");
        return `• ${cin?.name || "Movix"}${city ? ` (${city.name})` : ""}: ${timesStr}${stList.length > 4 ? "..." : ""}`;
      });

      // Chọn tối đa 3-4 nút đặt vé đại diện ở các rạp khác nhau
      const pickedShowtimes = [];
      for (const [, stList] of cinemaEntries) {
        if (pickedShowtimes.length >= 4) break;
        pickedShowtimes.push(stList[0]);
      }
      const stActions = pickedShowtimes.map((st) => {
        const cin = cinemas.find((c) => c.id === st.cinemaId);
        const stYMD = normalizeDateToYMD(st.date) || todayStr;
        return {
          type: "seatSelect",
          movieId: matchedFilm.id,
          cinemaId: st.cinemaId,
          showtimeId: st.id,
          time: st.startTime,
          date: stYMD,
          label: `🎟️ ${st.startTime} (${formatDateVN(stYMD)}) · ${cin?.name || "Movix"}`,
        };
      });

      const firstDateYMD = filmSt.length > 0 ? normalizeDateToYMD(filmSt[0].date) || todayStr : todayStr;
      const navFilmShowtimes = {
        type: "navigate",
        route: "showtimes",
        params: { movieId: matchedFilm.id, date: firstDateYMD },
        label: `🗓️ Xem tất cả lịch chiếu ${matchedFilm.title}`,
      };
      const navFilmDetail = {
        type: "navigate",
        route: "movie",
        params: { id: matchedFilm.id },
        label: `🎬 Mở trang phim ${matchedFilm.title}`,
      };
      const shouldAutoGo = wantsDirectNav || plain.includes("dat ve") || plain.includes("chi tiet");
      const autoNavChoice =
        plain.includes("dat ve") || plain.includes("lich chieu") ? navFilmShowtimes : navFilmDetail;

      const responseText =
        filmSt.length > 0
          ? `Phim "${matchedFilm.title}" hiện đang có ${filmSt.length} suất chiếu còn ghế tại ${cinemaEntries.length} rạp:\n\n${cinemaSummaryLines.join("\n")}\n\nBấm nút bên dưới để đặt vé nhanh hoặc xem lịch chiếu đầy đủ:`
          : matchedFilm.status === "Sắp chiếu"
          ? `Phim "${matchedFilm.title}" hiện đang ở trạng thái Sắp chiếu (khởi chiếu ${matchedFilm.releaseDate || "tới đây"}) nên chưa có suất chiếu mở bán. Bạn có thể xem chi tiết phim bên dưới:`
          : `Hiện tại không còn suất chiếu sắp tới hoặc còn ghế trống cho phim "${matchedFilm.title}" trên hệ thống Movix.`;

      return {
        text: responseText,
        toolsUsed: ["search_movies_and_showtimes"],
        actions: [
          {
            type: "movie",
            filmId: matchedFilm.id,
            title: matchedFilm.title,
            posterUrl: matchedFilm.posterUrl || "",
            genre: matchedFilm.genre || "",
            ageRating: matchedFilm.ageRating || "P",
          },
          ...(filmSt.length > 0 ? [navFilmShowtimes] : [navFilmDetail]),
          ...stActions,
        ],
        autoNavigate: shouldAutoGo ? autoNavChoice : null,
      };
    }

    // 7. Thể loại hoặc phim đang chiếu (có thể đưa thẳng tới trang Phim kèm bộ lọc thể loại)
    const genres = ["hành động", "kinh dị", "hoạt hình", "tình cảm", "khoa học", "hài", "gia đình"];
    const foundGenre = genres.find((g) => raw.includes(g));
    if (
      foundGenre ||
      raw.includes("đang chiếu") ||
      raw.includes("phim nào") ||
      raw.includes("có phim gì") ||
      plain.includes("danh sach phim") ||
      plain.includes("rap nao") ||
      plain.includes("con chieu") ||
      plain.includes("chieu khong") ||
      plain.includes("chieu k")
    ) {
      const matched = foundGenre
        ? films.filter((f) => `${f.genre} ${f.description}`.toLowerCase().includes(foundGenre))
        : films.filter((f) => f.status === "Đang chiếu");
      const chosen = (matched.length > 0 ? matched : films).slice(0, 4);
      const navMoviesAction = {
        type: "navigate",
        route: "movies",
        params: foundGenre ? { category: foundGenre } : { status: "Đang chiếu" },
        label: foundGenre ? `🎬 Mở trang Phim thể loại ${foundGenre}` : "🎬 Mở Danh sách phim đang chiếu",
      };
      const navShowtimesAll = {
        type: "navigate",
        route: "showtimes",
        params: { date: getLocalYMD(0) },
        label: "🗓️ Xem Lịch chiếu các rạp Movix",
      };
      const actions = [
        navShowtimesAll,
        navMoviesAction,
        ...chosen.map((f) => ({
          type: "movie",
          filmId: f.id,
          title: f.title,
          posterUrl: f.posterUrl || "",
          genre: f.genre || "",
          ageRating: f.ageRating || "P",
          seatAction: buildSeatActionForFilm(f),
        })),
      ];
      const list = chosen.map((f) => `• ${f.title} (${f.ageRating || "P"} · ⭐ ${f.rating || 8.5})`).join("\n");
      const isAskingUnmatchedFilm =
        !foundGenre &&
        (plain.includes("rap nao") || plain.includes("con chieu") || plain.includes("chieu khong") || plain.includes("chieu k"));
      return {
        text: isAskingUnmatchedFilm
          ? `Tôi chưa thấy phim bạn nhắc đến trong lịch chiếu hiện tại của Movix. Các phim ĐANG CHIẾU tại hệ thống rạp Movix lúc này gồm:\n\n${list}`
          : `${foundGenre ? `Phim thể loại ${foundGenre.toUpperCase()} tại Movix:` : "Các phim ĐANG CHIẾU nổi bật tại Movix:"}\n\n${list}`,
        toolsUsed: ["search_movies_and_showtimes"],
        actions,
        autoNavigate: wantsDirectNav ? navMoviesAction : null,
      };
    }

    // Mặc định: Trả lời hướng dẫn các khả năng
    return {
      text: "Bạn có thể hỏi tôi theo ngôn ngữ tự nhiên như:\n• \"Tôi muốn xem lịch chiếu ngày 20/11 các rạp ở Hà Nội\"\n• \"Gợi ý phim theo sở thích (SVD)\"\n• \"Vé của tôi hoặc mã MVX-77410\"\n• \"Có mã khuyến mãi nào đang dùng được?\"\n• \"Tôi 15 tuổi tối nay xem phim gì?\"\nHoặc chọn nhanh các gợi ý phía trên nhé!",
      toolsUsed: [],
      actions: [],
    };
  }

  const mergeNavigateAction = (actions = [], autoNav = null) => {
    const list = Array.isArray(actions) ? [...actions] : [];
    if (autoNav && autoNav.route) {
      const exists = list.some(
        (a) =>
          a?.type === "navigate" &&
          a?.route === autoNav.route &&
          JSON.stringify(a?.params || {}) === JSON.stringify(autoNav.params || {})
      );
      if (!exists) {
        list.unshift({
          type: "navigate",
          route: autoNav.route,
          params: autoNav.params || {},
          label: autoNav.label || "🔗 Mở trang với bộ lọc sẵn",
        });
      }
    }
    return list;
  };

  const handleActionClick = (action) => {
    if (!action || typeof go !== "function") return;
    if (action.type === "movie" && action.filmId) {
      go("movie", { id: action.filmId });
      setIsOpen(false);
    } else if (action.type === "seatSelect" && action.movieId) {
      go("seatSelect", {
        movieId: action.movieId,
        cinemaId: action.cinemaId,
        showtimeId: action.showtimeId,
        time: action.time,
        date: action.date,
      });
      setIsOpen(false);
    } else if (action.type === "navigate" && action.route) {
      go(action.route, action.params || {});
      setIsOpen(false);
    }
  };

  const handleSend = async (textToSend, useDirectFallback = false) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time: nowTime,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setChatError("");
    setIsTyping(true);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsTyping(false);
      setChatError("Mất kết nối mạng.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          isError: true,
          text: "⚠️ Không thể kết nối mạng Internet. Vui lòng kiểm tra lại đường truyền.",
          time: nowTime,
        },
      ]);
      return;
    }

    let shouldAutoFallback = useDirectFallback;

    if (!useDirectFallback) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25000);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: query,
            history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
            user: user
              ? {
                  id: user.id,
                  fullName: user.fullName || user.name,
                  email: user.email,
                  role: user.role,
                }
              : null,
            contextSnapshot: buildContextSnapshot(),
          }),
        });
        clearTimeout(timer);

        const rawText = await res.text();
        let data = null;
        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch {
          data = null;
        }

        // Nếu server trả về HTML (<!doctype ...) hoặc Gemini quá tải/timeout (503/504/DEADLINE_EXCEEDED/lỗi 5xx trừ thiếu key),
        // tự động chạy tra cứu trực tiếp trên dữ liệu Movix & SVD ngay lập tức, không bắt người dùng bấm nút.
        const isHtmlOrInvalidJson = !data || typeof data !== "object";
        const isMissingKey = data?.code === "MISSING_GEMINI_API_KEY";
        const errLower = String(data?.error || "").toLowerCase();
        const isTransientOverload =
          !isMissingKey &&
          (res.status === 503 ||
            res.status === 504 ||
            res.status >= 500 ||
            errLower.includes("504") ||
            errLower.includes("503") ||
            errLower.includes("deadline_exceeded") ||
            errLower.includes("deadline expired") ||
            errLower.includes("unavailable") ||
            errLower.includes("high demand") ||
            errLower.includes("timeout"));

        if (isHtmlOrInvalidJson || isTransientOverload) {
          shouldAutoFallback = true;
        } else if (!res.ok) {
          const err = new Error(data?.error || `Máy chủ trả về lỗi HTTP ${res.status}`);
          err.code = data?.code;
          throw err;
        } else {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: data.reply,
              toolsUsed: data.toolsUsed || [],
              actions: mergeNavigateAction(data.actions, data.autoNavigate),
              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }
      } catch (err) {
        const isAbortOrNetwork =
          err?.name === "AbortError" ||
          err?.name === "TypeError" ||
          String(err?.message || "").toLowerCase().includes("failed to fetch");
        const errMsgLower = String(err?.message || "").toLowerCase();
        const isTransientErr =
          err?.code !== "MISSING_GEMINI_API_KEY" &&
          (isAbortOrNetwork ||
            errMsgLower.includes("504") ||
            errMsgLower.includes("503") ||
            errMsgLower.includes("deadline_exceeded") ||
            errMsgLower.includes("deadline expired") ||
            errMsgLower.includes("unavailable") ||
            errMsgLower.includes("high demand") ||
            errMsgLower.includes("timeout"));
        if (isTransientErr) {
          shouldAutoFallback = true;
        } else {
          setIsTyping(false);
          const errText = err?.message || "Không gọi được trợ lý AI.";
          setChatError(errText);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-err-${Date.now()}`,
              sender: "bot",
              isError: true,
              retryDirectQuery: query,
              text: `⚠️ ${errText} Bạn có thể bấm nút bên dưới để tra cứu nhanh ngay:`,
              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }
      }
    }

    if (!shouldAutoFallback) return;

    // Tra cứu trực tiếp trên dữ liệu Movix & SVD (chạy ngay khi bấm nút hoặc tự động dự phòng)
    try {
      const directRes = await generateDirectResponse(query, messages);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: directRes.text,
          toolsUsed: directRes.toolsUsed || [],
          actions: mergeNavigateAction(directRes.actions, directRes.autoNavigate),
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          isError: true,
          text: "⚠️ Đã xảy ra lỗi khi tra cứu dữ liệu rạp Movix. Vui lòng thử lại.",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <>
      {/* Nút bấm mở Chatbot ở góc dưới màn hình */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: "linear-gradient(135deg, #5346d9 0%, #7c3aed 100%)",
            color: "#ffffff",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "50px",
            padding: "12px 20px",
            boxShadow: "0 10px 28px rgba(83, 70, 217, 0.42)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 20 }}>🎬</span>
          <span style={{ color: "#ffffff" }}>Trợ lý Movix AI</span>
        </button>
      )}

      {/* Cửa sổ Chatbot AI */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: "395px",
            maxWidth: "calc(100vw - 24px)",
            height: "570px",
            maxHeight: "calc(100vh - 36px)",
            background: "#ffffff",
            color: "#14152b",
            colorScheme: "light",
            borderRadius: 16,
            boxShadow: "0 16px 44px rgba(20, 21, 43, 0.24)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            overflow: "hidden",
            border: "1px solid #cbd5e1",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #5346d9 0%, #7c3aed 100%)",
              color: "#ffffff",
              padding: "13px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🎬
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: "#ffffff" }}>Trợ lý Movix AI</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.92)" }}>
                  {user ? `${user.fullName || user.name}` : "Hỗ trợ chọn phim & đặt vé"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "none",
                borderRadius: 8,
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
              title="Đóng chat"
            >
              ✕
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div
            style={{
              padding: "8px 12px",
              background: "#f1f5f9",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => handleSend(action)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #c7d2fe",
                  color: "#4338ca",
                  fontSize: 11.5,
                  padding: "5px 10px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "#f8fafc",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                }}
              >
                {m.sender === "bot" && (m.badge || (m.toolsUsed && m.toolsUsed.length > 0)) && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                    {m.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 6,
                          background: "#eef2ff",
                          color: "#3730a3",
                        }}
                      >
                        {m.badge}
                      </span>
                    )}
                    {(m.toolsUsed || []).map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 6,
                          background: "#ecfdf5",
                          color: "#065f46",
                        }}
                      >
                        🔧 {TOOL_LABELS[t] || t}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    background:
                      m.sender === "user"
                        ? "#5346d9"
                        : m.isError
                        ? "#fef2f2"
                        : "#ffffff",
                    color:
                      m.sender === "user"
                        ? "#ffffff"
                        : m.isError
                        ? "#991b1b"
                        : "#14152b",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.55,
                    whiteSpace: "pre-line",
                    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)",
                    border:
                      m.sender === "user"
                        ? "1px solid #4536b8"
                        : m.isError
                        ? "1px solid #fecaca"
                        : "1px solid #e2e8f0",
                  }}
                >
                  {m.text}
                </div>

                {/* Nút tra cứu nhanh nếu Gemini API tạm bận */}
                {m.isError && m.retryDirectQuery && (
                  <button
                    type="button"
                    onClick={() => handleSend(m.retryDirectQuery, true)}
                    style={{
                      marginTop: 6,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #10b981",
                      background: "#ecfdf5",
                      color: "#065f46",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ⚡ Tra cứu nhanh ngay
                  </button>
                )}

                {/* Thẻ phim & Nút bấm Đặt vé / Xem chi tiết ngay trong tin nhắn */}
                {m.sender === "bot" && Array.isArray(m.actions) && m.actions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                    {m.actions.map((act, idx) => {
                      if (act.type === "movie") {
                        const cardPoster =
                          act.posterUrl ||
                          (dbService.getFilms() || []).find((f) => f.id === act.filmId)?.posterUrl ||
                          "";
                        return (
                          <div
                            key={`${m.id}-act-${idx}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: 8,
                              background: "white",
                              borderRadius: 10,
                              border: "1px solid var(--ink-200)",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            }}
                          >
                            {cardPoster && (
                              <img
                                src={cardPoster}
                                alt={act.title}
                                style={{ width: 38, height: 52, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 12.5,
                                  color: "var(--ink-900)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {act.title}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>
                                {act.ageRating || "P"} · {act.genre || "Chiếu rạp"}
                                {act.score ? ` · SVD ${act.score}★` : ""}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                              <button
                                type="button"
                                onClick={() => handleActionClick(act)}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  border: "1px solid var(--brand-200)",
                                  background: "var(--brand-50)",
                                  color: "var(--brand-700)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Xem phim
                              </button>
                              {act.seatAction && (
                                <button
                                  type="button"
                                  onClick={() => handleActionClick(act.seatAction)}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "var(--brand-600)",
                                    color: "white",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Đặt vé
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }

                      const isNavBtn = act.type === "navigate";
                      const isSeatBtn = act.type === "seatSelect";
                      return (
                        <button
                          key={`${m.id}-act-${idx}`}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            textAlign: "left",
                            padding: isNavBtn ? "9px 12px" : "7px 11px",
                            borderRadius: 9,
                            border: isNavBtn
                              ? "1.5px solid var(--brand-400)"
                              : "1px solid var(--brand-200)",
                            background: isSeatBtn
                              ? "var(--brand-600)"
                              : isNavBtn
                              ? "linear-gradient(135deg, var(--brand-50), #eef2ff)"
                              : "white",
                            color: isSeatBtn ? "white" : "var(--brand-700)",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: isNavBtn ? "0 2px 6px rgba(99, 87, 232, 0.14)" : "none",
                          }}
                        >
                          <span>{act.label || "Mở trang"}</span>
                          <span style={{ fontSize: 13, opacity: 0.85, flexShrink: 0 }}>→</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div
                  style={{
                    fontSize: 10.5,
                    color: "#64748b",
                    marginTop: 4,
                    textAlign: m.sender === "user" ? "right" : "left",
                    padding: "0 4px",
                  }}
                >
                  {m.time}
                </div>
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "8px 14px",
                  borderRadius: 12,
                  fontSize: 12.5,
                  color: "#475569",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
                }}
              >
                <span>Trợ lý Movix đang tìm thông tin...</span>
              </div>
            )}

            {chatError && (
              <div
                style={{
                  padding: "6px 10px",
                  background: "#fff1f2",
                  color: "#be123c",
                  border: "1px solid #fecdd3",
                  fontSize: 11.5,
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{chatError}</span>
                <button
                  type="button"
                  onClick={() => setChatError("")}
                  style={{ background: "none", border: "none", color: "#be123c", fontWeight: 700, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: 10,
              background: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              placeholder="Bạn cần giúp gì? (vd: Lịch chiếu ở Hà Nội...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: 20,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#14152b",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                background: !input.trim() || isTyping ? "#cbd5e1" : "#5346d9",
                color: !input.trim() || isTyping ? "#475569" : "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 700,
              }}
              title="Gửi câu hỏi"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
