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
        "Gợi ý phim hợp gu tôi (SVD)",
        "Có mã giảm giá nào?",
      ]
    : [
        "Lịch chiếu hôm nay ở Hà Nội",
        "Gợi ý phim hợp gu tôi (SVD)",
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
      genre: f.genre,
      ageRating: f.ageRating || "P",
      duration: f.duration,
      rating: f.rating,
      status: f.status,
      posterUrl: f.posterUrl && !String(f.posterUrl).startsWith("data:") ? f.posterUrl : "",
      description: (f.description || "").slice(0, 180),
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

    return {
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

  // BƯỚC 1: Xử lý trực tiếp nối SVD + Khuyến mãi + Tra cứu vé + Lọc lịch chiếu ngày/khu vực + Điều hướng thẳng (không cần LLM)
  async function generateDirectResponse(userMsg) {
    const raw = (userMsg || "").trim().toLowerCase();
    const plain = stripVN(raw);
    const films = dbService.getFilms() || [];
    const cities = dbService.getCities() || [];
    const cinemas = dbService.getCinemas() || [];
    const showtimes = dbService.getShowtimes() || [];
    const promos = dbService.getPromotions() || [];
    const orders = dbService.getOrders() || [];
    const combos = dbService.getComboFoods() || [];

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

    // 1b. Điều hướng thẳng tới Lịch chiếu theo Ngày / Thành phố / Rạp / Phim (vd: "tôi muốn xem lịch chiếu ngày 20/11 các rạp ở Hà Nội")
    const requestedDateYMD = extractDateYMDFromText(raw);
    const requestedCity = findCityInText(raw, cities);
    const requestedCinema = findCinemaInText(raw, cinemas);
    const requestedFilm = films.find((f) => plain.includes(stripVN(f.title)));
    const isShowtimeQuery =
      plain.includes("lich chieu") ||
      plain.includes("suat chieu") ||
      plain.includes("gio chieu") ||
      Boolean(requestedDateYMD) ||
      Boolean(requestedCity && (plain.includes("rap") || plain.includes("xem"))) ||
      Boolean(requestedCinema);

    if (isShowtimeQuery && (requestedDateYMD || requestedCity || requestedCinema || requestedFilm)) {
      const targetDate = requestedDateYMD || getLocalYMD(0);
      const targetCityId = requestedCity?.id || requestedCinema?.cityId || "";
      const targetCinemaId = requestedCinema?.id || "";

      // Chỉ xem danh sách rạp (không hỏi giờ/lịch chiếu/ngày cụ thể) -> có thể mở trang Rạp nếu hỏi đúng "các rạp ở ..."
      const isPureCinemaList =
        (plain.includes("cac rap") || plain.includes("he thong rap") || plain.includes("rap nao")) &&
        !plain.includes("lich chieu") &&
        !plain.includes("suat chieu") &&
        !requestedDateYMD &&
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
        if (targetCinemaId && st.cinemaId !== targetCinemaId) return false;
        if (targetCityId) {
          const cin = cinemas.find((c) => c.id === st.cinemaId);
          if (!cin || cin.cityId !== targetCityId) return false;
        }
        return !isPastShowtime(stYMD, st.startTime) && (st.seatsBooked?.length || 0) < (st.totalSeats || 96);
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
          ? `Tìm thấy ${matchingShowtimes.length} suất chiếu còn ghế tại ${areaName} ngày ${dateVN}:\n\n${summaryLines.join("\n")}\n\nBấm nút bên dưới để mở trang Lịch chiếu với bộ lọc sẵn:`
          : `Hiện chưa có suất chiếu còn ghế tại ${areaName} ngày ${dateVN}. Bạn có thể bấm nút bên dưới để mở trang Lịch chiếu (${areaName}) kiểm tra hoặc chọn ngày lân cận:`;

      return {
        text: textSummary,
        toolsUsed: ["search_movies_and_showtimes", "navigate_movix_page"],
        actions,
      };
    }

    // 2. Gợi ý cá nhân hóa trực tiếp từ SVD (AI_Recommendation)
    if (
      raw.includes("svd") ||
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

    // 4. Giá vé & Combo
    if (raw.includes("giá vé") || raw.includes("bao nhiêu tiền") || raw.includes("bảng giá") || raw.includes("combo")) {
      const comboText = combos
        .slice(0, 3)
        .map((c) => `• ${c.name}: ${(c.price || 0).toLocaleString("vi-VN")}đ`)
        .join("\n");
      return {
        text: `Bảng giá vé Movix:\n• Ghế Thường (Standard): 80.000đ\n• Ghế VIP: 95.000đ\n• Ghế đôi Sweetbox: 150.000đ/cặp\n\nCombo bắp nước:\n${comboText || "• Combo Solo: 79.000đ"}`,
        toolsUsed: ["get_ticket_pricing_and_combos"],
        actions: [{ type: "navigate", route: "showtimes", label: "🕒 Xem lịch chiếu & Đặt vé" }],
      };
    }

    // 5. Độ tuổi (tuyệt đối chặn C18/T16/T13 không phù hợp)
    const ageMatch = raw.match(/(\d{1,2})\s*tuổi/);
    if (ageMatch || raw.includes("tuổi")) {
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 15;
      const allowed = films.filter((f) => {
        const rating = (f.ageRating || "P").toUpperCase();
        if (age < 18 && (rating === "C18" || rating === "18+")) return false;
        if (age < 16 && (rating === "T16" || rating === "C16" || rating === "16+")) return false;
        if (age < 13 && (rating === "T13" || rating === "13+")) return false;
        return true;
      });
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

    // 6. Hỏi suất chiếu hoặc mở chi tiết của 1 phim cụ thể
    const matchedFilm = films.find((f) => plain.includes(stripVN(f.title)));
    if (matchedFilm) {
      const todayStr = getLocalYMD(0);
      const filmSt = showtimes.filter((st) => {
        const stYMD = normalizeDateToYMD(st.date) || todayStr;
        return (
          st.filmId === matchedFilm.id &&
          !isPastShowtime(stYMD, st.startTime) &&
          (st.seatsBooked?.length || 0) < (st.totalSeats || 96)
        );
      });
      const stActions = filmSt.slice(0, 3).map((st) => {
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
      const timesText = filmSt
        .slice(0, 5)
        .map((st) => `${st.startTime} (${formatDateVN(normalizeDateToYMD(st.date) || todayStr)})`)
        .join(", ");
      const navFilmShowtimes = {
        type: "navigate",
        route: "showtimes",
        params: { movieId: matchedFilm.id, date: todayStr },
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
      return {
        text:
          filmSt.length > 0
            ? `Phim "${matchedFilm.title}" hiện có các suất chiếu còn ghế: ${timesText}. Bấm nút bên dưới để chọn ghế ngay:`
            : `Phim "${matchedFilm.title}" hiện chưa có suất chiếu sắp tới. Bạn có thể xem thông tin chi tiết phim bên dưới.`,
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
          navFilmShowtimes,
          ...stActions,
        ],
        autoNavigate: shouldAutoGo ? autoNavChoice : null,
      };
    }

    // 7. Thể loại hoặc phim đang chiếu (có thể đưa thẳng tới trang Phim kèm bộ lọc thể loại)
    const genres = ["hành động", "kinh dị", "hoạt hình", "tình cảm", "khoa học", "hài", "gia đình"];
    const foundGenre = genres.find((g) => raw.includes(g));
    if (foundGenre || raw.includes("đang chiếu") || raw.includes("phim nào") || raw.includes("có phim gì") || plain.includes("danh sach phim")) {
      const matched = foundGenre
        ? films.filter((f) => `${f.genre} ${f.description}`.toLowerCase().includes(foundGenre))
        : films.filter((f) => f.status === "Đang chiếu");
      const chosen = (matched.length > 0 ? matched : films).slice(0, 3);
      const navMoviesAction = {
        type: "navigate",
        route: "movies",
        params: foundGenre ? { category: foundGenre } : { status: "Đang chiếu" },
        label: foundGenre ? `🎬 Mở trang Phim thể loại ${foundGenre}` : "🎬 Mở Danh sách phim đang chiếu",
      };
      const actions = [
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
      return {
        text: `${foundGenre ? `Phim thể loại ${foundGenre.toUpperCase()} tại Movix:` : "Các phim ĐANG CHIẾU nổi bật tại Movix:"}\n\n${list}`,
        toolsUsed: ["search_movies_and_showtimes"],
        actions,
        autoNavigate: wantsDirectNav ? navMoviesAction : null,
      };
    }

    // Mặc định: Trả lời hướng dẫn các khả năng
    return {
      text: "Bạn có thể hỏi tôi theo ngôn ngữ tự nhiên như:\n• \"Tôi muốn xem lịch chiếu ngày 20/11 các rạp ở Hà Nội\"\n• \"Gợi ý phim hợp gu tôi (SVD)\"\n• \"Vé của tôi hoặc mã MVX-77410\"\n• \"Có mã khuyến mãi nào đang dùng được?\"\n• \"Tôi 15 tuổi tối nay xem phim gì?\"\nHoặc chọn nhanh các gợi ý phía trên nhé!",
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

        // Nếu server trả về HTML (<!doctype ...) hoặc Gemini quá tải/timeout (503/504 trừ thiếu key),
        // tự động chạy tra cứu trực tiếp trên dữ liệu Movix & SVD ngay lập tức, không bắt người dùng bấm nút.
        const isHtmlOrInvalidJson = !data || typeof data !== "object";
        const isTransientOverload =
          (res.status === 503 || res.status === 504) && data?.code !== "MISSING_GEMINI_API_KEY";

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
        if (isAbortOrNetwork) {
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
      const directRes = await generateDirectResponse(query);
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
            background: "linear-gradient(135deg, var(--brand-600), var(--purple-600))",
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "12px 20px",
            boxShadow: "0 8px 24px rgba(99, 87, 232, 0.4)",
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
          <span>Trợ lý Movix AI</span>
        </button>
      )}

      {/* Cửa sổ Chatbot AI */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: "390px",
            maxWidth: "calc(100vw - 24px)",
            height: "560px",
            maxHeight: "calc(100vh - 36px)",
            background: "white",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.22)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            overflow: "hidden",
            border: "1px solid var(--ink-200)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--brand-600), var(--purple-600))",
              color: "white",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🎬
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Trợ lý Movix AI</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>
                  {user ? `${user.fullName || user.name}` : "Hỗ trợ chọn phim & đặt vé"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: 20,
                cursor: "pointer",
                padding: "2px 6px",
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
              background: "var(--ink-50)",
              borderBottom: "1px solid var(--ink-100)",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => handleSend(action)}
                style={{
                  background: "white",
                  border: "1px solid var(--brand-200)",
                  color: "var(--brand-700)",
                  fontSize: 11.5,
                  padding: "4px 10px",
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
              background: "#fafafa",
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
                        ? "var(--brand-600)"
                        : m.isError
                        ? "#fef2f2"
                        : "white",
                    color:
                      m.sender === "user"
                        ? "white"
                        : m.isError
                        ? "#991b1b"
                        : "var(--ink-900)",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    border: m.isError ? "1px solid #fecaca" : "1px solid var(--ink-100)",
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
                    fontSize: 10,
                    color: "var(--ink-400)",
                    marginTop: 3,
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
                  background: "white",
                  padding: "8px 14px",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--ink-500)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
                  color: "#e11d48",
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
                  style={{ background: "none", border: "none", color: "#e11d48", fontWeight: 700, cursor: "pointer" }}
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
              background: "white",
              borderTop: "1px solid var(--ink-100)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Bạn cần giúp gì? (vd: Lịch chiếu ở Hà Nội...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 20,
                border: "1px solid var(--ink-200)",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                background: !input.trim() || isTyping ? "var(--ink-200)" : "var(--brand-600)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
                flexShrink: 0,
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
