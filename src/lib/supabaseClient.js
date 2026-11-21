import { createClient } from "@supabase/supabase-js";
import {
  INITIAL_CITIES,
  INITIAL_CATEGORIES,
  INITIAL_CINEMAS,
  INITIAL_ROOMS,
  INITIAL_FILMS,
  INITIAL_USERS,
  INITIAL_COMBOFOODS,
  INITIAL_PROMOTIONS,
  INITIAL_BANNERS,
  INITIAL_SHOWTIMES,
  INITIAL_COMMENTS,
  INITIAL_ORDERS,
  getTodayStr,
} from "../data/initialDbData.js";

const STORAGE_KEY_DB = "movix_db_v7";
const STORAGE_KEY_CONFIG = "movix_supabase_config_v1";
const STORAGE_KEY_AUTH = "movix_current_user_v2";

export const authService = {
  getCurrentUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  },
  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } else {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    }
  },
  logout() {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },
  isAdmin(user) {
    return Boolean(user && (user.role === "admin" || user.role === "administrator"));
  },
  isEmployee(user) {
    return Boolean(user && (user.role === "employee" || user.role === "staff"));
  },
  isStaffOrAdmin(user) {
    return Boolean(this.isAdmin(user) || this.isEmployee(user));
  },
};

function requireAdminRole(actionLabel = "thực hiện thao tác quản trị") {
  const cur = authService.getCurrentUser();
  if (cur && !authService.isAdmin(cur)) {
    throw new Error(`Từ chối quyền: Chỉ Quản trị viên (Admin) mới được phép ${actionLabel}.`);
  }
}

export function isWatchedOrderStatus(status) {
  return status === "confirmed" || status === "used";
}

export function isOrderMatchingUser(order, user) {
  if (!order || !user) return false;
  if (order.userId && user.id && order.userId === user.id) return true;
  if (user.email && order.email && order.email.toLowerCase() === user.email.toLowerCase()) return true;
  if (user.phone && order.phone && order.phone === user.phone) return true;
  const userNameNorm = (user.fullName || user.name || "").trim().toLowerCase();
  if (userNameNorm && order.userName && order.userName.trim().toLowerCase() === userNameNorm) return true;
  return false;
}

// 1. Quản lý cấu hình Supabase
export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Lỗi đọc cấu hình Supabase:", e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  };
}

export function saveSupabaseConfig(url, anonKey) {
  const config = { url: url.trim(), anonKey: anonKey.trim() };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  // Reset cached client
  cachedClient = null;
  return config;
}

let cachedClient = null;
export function getSupabaseClient() {
  if (cachedClient) return cachedClient;
  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      cachedClient = createClient(config.url, config.anonKey);
      return cachedClient;
    } catch (e) {
      console.warn("Không thể khởi tạo Supabase Client:", e);
    }
  }
  return null;
}

// 2. Local Database Repository (Đồng bộ thời gian thực cho ứng dụng)
function initLocalDb() {
  const existing = localStorage.getItem(STORAGE_KEY_DB);
  if (existing) {
    try {
      const db = JSON.parse(existing);
      let changed = false;

      // Bảo đảm mảng promotions luôn đầy đủ và có các mã mới nhất
      if (!db.promotions || !Array.isArray(db.promotions) || db.promotions.length === 0) {
        db.promotions = [...INITIAL_PROMOTIONS];
        changed = true;
      } else {
        // Đồng bộ các mã mới nếu thiếu (ví dụ: CHAOMOI, VIP20, MOMO15)
        for (const initP of INITIAL_PROMOTIONS) {
          const foundIndex = db.promotions.findIndex(
            (p) => p.code && p.code.trim().toUpperCase() === initP.code.toUpperCase()
          );
          if (foundIndex === -1) {
            db.promotions.push(initP);
            changed = true;
          } else if (!db.promotions[foundIndex].bannerUrl || !db.promotions[foundIndex].title) {
            db.promotions[foundIndex] = {
              ...initP,
              ...db.promotions[foundIndex],
              bannerUrl: initP.bannerUrl,
              title: initP.title,
              category: initP.category,
            };
            changed = true;
          }
        }
      }

      // Bảo đảm mảng banners quảng cáo luôn sẵn sàng
      if (!db.banners || !Array.isArray(db.banners) || db.banners.length === 0) {
        db.banners = [...INITIAL_BANNERS];
        changed = true;
      }

      // Bảo đảm mảng users luôn có đầy đủ tài khoản mẫu (Admin & Khách hàng)
      if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
        db.users = [...INITIAL_USERS];
        changed = true;
      } else {
        for (const initU of INITIAL_USERS) {
          const idx = db.users.findIndex(
            (u) => u.id === initU.id || u.email?.toLowerCase() === initU.email?.toLowerCase()
          );
          if (idx === -1) {
            db.users.push(initU);
            changed = true;
          } else {
            // Đảm bảo mật khẩu và vai trò chuẩn xác
            if (!db.users[idx].password) {
              db.users[idx].password = initU.password || "123";
              changed = true;
            }
            if (initU.role === "admin" && db.users[idx].role !== "admin") {
              db.users[idx].role = "admin";
              changed = true;
            }
            // Chuẩn hoá phân quyền: Quản trị viên, Nhân viên và Thành viên
            if (initU.role === "admin" || db.users[idx].role === "admin") {
              db.users[idx].role = "admin";
              db.users[idx].tier = "Quản trị viên";
            } else if (initU.role === "employee" || db.users[idx].role === "employee") {
              db.users[idx].role = "employee";
              db.users[idx].tier = "Nhân viên";
            } else {
              db.users[idx].role = "customer";
              db.users[idx].tier = "Thành viên";
            }
          }
        }
      }

      // Helper gộp dữ liệu mẫu mới theo id mà không ghi đè dữ liệu người dùng đã chỉnh/đặt
      const mergeMissingById = (key, initialArr, enrichExisting) => {
        if (!Array.isArray(db[key]) || db[key].length === 0) {
          db[key] = [...initialArr];
          changed = true;
          return;
        }
        const existingMap = new Map(db[key].map((item, idx) => [item.id, idx]));
        for (const initItem of initialArr) {
          const existingIdx = existingMap.get(initItem.id);
          if (existingIdx === undefined) {
            db[key].push(initItem);
            existingMap.set(initItem.id, db[key].length - 1);
            changed = true;
          } else if (typeof enrichExisting === "function") {
            const updated = enrichExisting(db[key][existingIdx], initItem);
            if (updated) {
              db[key][existingIdx] = updated;
              changed = true;
            }
          }
        }
      };

      mergeMissingById("cities", INITIAL_CITIES);
      mergeMissingById("categories", INITIAL_CATEGORIES);
      mergeMissingById("cinemas", INITIAL_CINEMAS, (cur, initC) => {
        if (!cur.hotline || !Array.isArray(cur.amenities) || !cur.status) {
          return {
            ...initC,
            ...cur,
            hotline: cur.hotline || initC.hotline,
            amenities: Array.isArray(cur.amenities) && cur.amenities.length > 0 ? cur.amenities : initC.amenities,
            status: cur.status || initC.status,
          };
        }
        return null;
      });
      mergeMissingById("rooms", INITIAL_ROOMS);
      mergeMissingById("films", INITIAL_FILMS);
      mergeMissingById("combofoods", INITIAL_COMBOFOODS);
      mergeMissingById("comments", INITIAL_COMMENTS);

      // Bảo đảm lịch chiếu luôn khớp với ngày hiện tại và bổ sung các suất mới
      const todayStr = getTodayStr(0);
      const hasTodayShowtimes =
        db.showtimes &&
        Array.isArray(db.showtimes) &&
        db.showtimes.some((st) => st.date === todayStr);

      if (!hasTodayShowtimes || !Array.isArray(db.showtimes) || db.showtimes.length === 0) {
        db.showtimes = [...INITIAL_SHOWTIMES];
        changed = true;
      } else {
        mergeMissingById("showtimes", INITIAL_SHOWTIMES);
      }

      // Bảo đảm luôn có đầy đủ đơn vé mẫu (confirmed, used, pending, cancelled)
      mergeMissingById("orders", INITIAL_ORDERS);

      if (changed) {
        localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
      }

      return db;
    } catch (e) {
      console.error("Lỗi parse DB từ localStorage, khởi tạo lại:", e);
    }
  }

  const initial = {
    cities: INITIAL_CITIES,
    categories: INITIAL_CATEGORIES,
    cinemas: INITIAL_CINEMAS,
    rooms: INITIAL_ROOMS,
    films: INITIAL_FILMS,
    users: INITIAL_USERS,
    combofoods: INITIAL_COMBOFOODS,
    promotions: INITIAL_PROMOTIONS,
    banners: INITIAL_BANNERS,
    showtimes: INITIAL_SHOWTIMES,
    comments: INITIAL_COMMENTS,
    orders: INITIAL_ORDERS,
  };
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(initial));
  return initial;
}

let subscribers = [];
function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribeDb(callback) {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
}

function getDb() {
  return initLocalDb();
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
  notifySubscribers();
}

export const cfService = {
  async getRecommendationsByUser(userId, topN = 5) {
    const uid = encodeURIComponent(String(userId || "guest"));
    const res = await fetch(`/api/recommendations/${uid}?top_n=${topN}`);
    if (!res.ok) throw new Error("Không thể tải gợi ý phim từ hệ thống AI");
    return res.json();
  },
  async getViewerRecommendations(user, limit) {
    const params = new URLSearchParams();
    if (user?.id) params.set("webUserId", String(user.id));
    if (user?.email) params.set("email", String(user.email));
    if (user?.fullName || user?.name) params.set("fullName", String(user.fullName || user.name));
    if (limit) params.set("limit", String(limit));
    const res = await fetch(`/api/cf/viewer-recommendations?${params.toString()}`);
    if (!res.ok) throw new Error("Không thể tải gợi ý phim");
    return res.json();
  },
  async recordActivity(payload) {
    try {
      const res = await fetch("/api/cf/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        notifySubscribers();
        return data;
      }
    } catch (e) {
      console.warn("CF activity sync warning:", e);
    }
    return null;
  },
  async syncCatalog() {
    try {
      const db = getDb();
      await fetch("/api/cf/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          films: db.films || [],
          users: db.users || [],
          orders: db.orders || [],
          comments: db.comments || [],
        }),
      });
    } catch (e) {
      console.warn("CF catalog sync warning:", e);
    }
  },
};

// 3. Database Service API
export const dbService = {
  // Cities & Categories
  getCities() {
    return getDb().cities || [];
  },
  getCategories() {
    return getDb().categories || [];
  },

  // Cinemas
  getCinemas() {
    return getDb().cinemas || [];
  },
  addCinema(data) {
    requireAdminRole("thêm rạp chiếu");
    const db = getDb();
    const newCinema = {
      id: `cin-${Date.now()}`,
      avatar: "🏢",
      ...data,
    };
    db.cinemas.unshift(newCinema);
    saveDb(db);
    return newCinema;
  },
  updateCinema(id, data) {
    requireAdminRole("cập nhật rạp chiếu");
    const db = getDb();
    db.cinemas = db.cinemas.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveDb(db);
  },
  deleteCinema(id) {
    requireAdminRole("xóa rạp chiếu");
    const db = getDb();
    db.cinemas = db.cinemas.filter((c) => c.id !== id);
    saveDb(db);
  },

  // Rooms
  getRooms() {
    return getDb().rooms || [];
  },
  addRoom(data) {
    requireAdminRole("thêm phòng chiếu");
    const db = getDb();
    const newRoom = {
      id: `room-${Date.now()}`,
      seatLayout: [
        { row: "A", count: 12 },
        { row: "B", count: 12 },
        { row: "C", count: 12 },
        { row: "D", count: 12 },
        { row: "E", count: 12 },
        { row: "F", count: 12, vip: true },
        { row: "G", count: 12, vip: true },
      ],
      ...data,
    };
    db.rooms.unshift(newRoom);
    saveDb(db);
    return newRoom;
  },
  updateRoom(id, data) {
    requireAdminRole("cập nhật phòng chiếu");
    const db = getDb();
    db.rooms = db.rooms.map((r) => (r.id === id ? { ...r, ...data } : r));
    saveDb(db);
  },
  deleteRoom(id) {
    requireAdminRole("xóa phòng chiếu");
    const db = getDb();
    const hasShowtimes = (db.showtimes || []).some((st) => st.roomId === id);
    if (hasShowtimes) {
      throw new Error("Không thể xóa phòng chiếu vì phòng đã có suất chiếu. Vui lòng xóa các suất chiếu trước.");
    }
    db.rooms = db.rooms.filter((r) => r.id !== id);
    saveDb(db);
    return true;
  },

  // Films
  getFilms() {
    return getDb().films || [];
  },
  getFilm(id) {
    return getDb().films.find((f) => f.id === id);
  },
  addFilm(data) {
    requireAdminRole("thêm phim mới");
    const db = getDb();
    const newFilm = {
      id: `film-${Date.now()}`,
      rating: 8.5,
      thumbnail: "🎬",
      format: "2D, 3D",
      status: "Đang chiếu",
      releaseDate: new Date().toISOString().slice(0, 10),
      ...data,
    };
    db.films.unshift(newFilm);
    saveDb(db);
    cfService.syncCatalog();
    return newFilm;
  },
  updateFilm(id, data) {
    requireAdminRole("chỉnh sửa thông tin phim");
    const db = getDb();
    db.films = db.films.map((f) => (f.id === id ? { ...f, ...data } : f));
    saveDb(db);
    cfService.syncCatalog();
  },
  deleteFilm(id) {
    requireAdminRole("xóa phim");
    const db = getDb();
    db.films = db.films.filter((f) => f.id !== id);
    saveDb(db);
  },

  // Showtimes
  getShowtimes() {
    return getDb().showtimes || [];
  },
  addShowtime(data) {
    requireAdminRole("tạo suất chiếu");
    const db = getDb();
    const newShowtime = {
      id: `st-${Date.now()}`,
      seatsBooked: [],
      status: "Đang hoạt động",
      ...data,
    };
    db.showtimes.unshift(newShowtime);
    saveDb(db);
    return newShowtime;
  },
  updateShowtime(id, data) {
    requireAdminRole("chỉnh sửa suất chiếu");
    const db = getDb();
    db.showtimes = db.showtimes.map((s) => (s.id === id ? { ...s, ...data } : s));
    saveDb(db);
  },
  deleteShowtime(id) {
    requireAdminRole("xóa suất chiếu");
    const db = getDb();
    const target = (db.showtimes || []).find((s) => s.id === id);
    if (target && target.seatsBooked && target.seatsBooked.length > 0) {
      throw new Error("Không thể xóa suất chiếu đã có vé đặt.");
    }
    const hasActiveOrders = (db.orders || []).some(
      (o) => o.showtimeId === id && o.orderStatus !== "cancelled"
    );
    if (hasActiveOrders) {
      throw new Error("Không thể xóa suất chiếu đã có vé đặt.");
    }
    db.showtimes = db.showtimes.filter((s) => s.id !== id);
    saveDb(db);
    return true;
  },

  // Users
  getUsers() {
    return getDb().users || [];
  },
  getUser(id) {
    return getDb().users.find((u) => u.id === id);
  },
  getUserByIdentity(identity) {
    if (!identity) return null;
    const clean = identity.trim().toLowerCase();
    return (getDb().users || []).find(
      (u) =>
        u.email?.toLowerCase() === clean ||
        u.username?.toLowerCase() === clean ||
        u.phone === clean
    );
  },
  addUser(data) {
    requireAdminRole("tạo tài khoản người dùng/nhân viên");
    const db = getDb();
    const newUser = {
      id: `usr-${Date.now()}`,
      avatar: "🧑",
      role: "member",
      status: "Hoạt động",
      deleted: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    db.users.unshift(newUser);
    saveDb(db);
    cfService.syncCatalog();
    return newUser;
  },
  updateUser(id, data) {
    const cur = authService.getCurrentUser();
    const isSelfUpdate = cur && cur.id === id && !Object.prototype.hasOwnProperty.call(data || {}, "role");
    if (!isSelfUpdate) {
      requireAdminRole("cập nhật tài khoản hoặc phân quyền");
    }
    const db = getDb();
    db.users = db.users.map((u) => (u.id === id ? { ...u, ...data } : u));
    saveDb(db);
  },
  toggleLockUser(id) {
    requireAdminRole("khóa/mở khóa tài khoản");
    const db = getDb();
    db.users = db.users.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === "Tạm khóa" ? "Hoạt động" : "Tạm khóa";
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveDb(db);
  },
  deleteUser(id) {
    requireAdminRole("xóa tài khoản người dùng");
    const db = getDb();
    const target = db.users.find((u) => u.id === id);
    const hasOrders = (db.orders || []).some(
      (o) =>
        o.userId === id ||
        (target?.email && o.email?.toLowerCase() === target.email.toLowerCase())
    );
    if (hasOrders) {
      throw new Error("Không thể xóa khách hàng đã có đơn đặt vé.");
    }
    db.users = db.users.filter((u) => u.id !== id);
    saveDb(db);
    return true;
  },

  // Comments & Moderation
  getComments() {
    return getDb().comments || [];
  },
  hasUserWatchedFilm(user, filmId) {
    if (!user || !filmId) return false;
    const db = getDb();
    return (db.orders || []).some(
      (o) => isOrderMatchingUser(o, user) && o.filmId === filmId && isWatchedOrderStatus(o.orderStatus)
    );
  },
  getUserPendingOrderForFilm(user, filmId) {
    if (!user || !filmId) return null;
    const db = getDb();
    return (
      (db.orders || []).find(
        (o) => isOrderMatchingUser(o, user) && o.filmId === filmId && o.orderStatus === "pending"
      ) || null
    );
  },
  getUserWatchHistory(user) {
    if (!user) return [];
    const db = getDb();
    const films = db.films || [];
    const comments = db.comments || [];
    return (db.orders || [])
      .filter((o) => isOrderMatchingUser(o, user) && isWatchedOrderStatus(o.orderStatus))
      .map((o) => {
        const film = films.find((f) => f.id === o.filmId);
        const review = comments.find(
          (c) =>
            c.filmId === o.filmId &&
            ((user.id && c.userId === user.id) ||
              ((user.fullName || user.name) &&
                c.userName?.trim().toLowerCase() === (user.fullName || user.name).trim().toLowerCase()))
        );
        return {
          orderId: o.id,
          ticketCode: o.ticketCode,
          filmId: o.filmId,
          filmTitle: o.filmTitle || film?.title || "Phim Movix",
          posterUrl: o.posterUrl || film?.posterUrl || film?.thumbnail || "",
          genre: film?.genre || "",
          duration: film?.duration || 120,
          cinemaName: o.cinemaName,
          roomName: o.roomName,
          showtimeDate: o.showtimeDate,
          showtimeTime: o.showtimeTime,
          seats: o.seats || [],
          orderStatus: o.orderStatus,
          approvedBy: o.approvedBy || null,
          checkedInBy: o.checkedInBy || null,
          watchedAt: o.checkedInAt || o.approvedAt || o.watchedAt || o.createdAt,
          review: review || null,
        };
      })
      .sort((a, b) => new Date(b.watchedAt || 0).getTime() - new Date(a.watchedAt || 0).getTime());
  },
  getAllWatchHistory() {
    const db = getDb();
    const films = db.films || [];
    const users = db.users || [];
    const comments = db.comments || [];
    return (db.orders || [])
      .filter((o) => isWatchedOrderStatus(o.orderStatus))
      .map((o) => {
        const film = films.find((f) => f.id === o.filmId);
        const matchedUser = users.find((u) => isOrderMatchingUser(o, u));
        const review = comments.find(
          (c) =>
            c.filmId === o.filmId &&
            ((o.userId && c.userId === o.userId) ||
              (o.userName && c.userName?.trim().toLowerCase() === o.userName.trim().toLowerCase()))
        );
        return {
          orderId: o.id,
          ticketCode: o.ticketCode,
          userId: o.userId || matchedUser?.id || "",
          userName: o.userName || matchedUser?.fullName || "Khán giả",
          phone: o.phone || matchedUser?.phone || "",
          email: o.email || matchedUser?.email || "",
          filmId: o.filmId,
          filmTitle: o.filmTitle || film?.title || "Phim Movix",
          posterUrl: o.posterUrl || film?.posterUrl || "",
          genre: film?.genre || "",
          cinemaName: o.cinemaName,
          roomName: o.roomName,
          showtimeDate: o.showtimeDate,
          showtimeTime: o.showtimeTime,
          seats: o.seats || [],
          orderStatus: o.orderStatus,
          approvedBy: o.approvedBy || null,
          checkedInBy: o.checkedInBy || null,
          watchedAt: o.checkedInAt || o.approvedAt || o.watchedAt || o.createdAt,
          review: review || null,
        };
      })
      .sort((a, b) => new Date(b.watchedAt || 0).getTime() - new Date(a.watchedAt || 0).getTime());
  },
  addComment(data) {
    const db = getDb();
    const curUser = authService.getCurrentUser();
    const targetUser = curUser || (db.users || []).find((u) => u.id === data.userId) || null;
    if (!targetUser || !this.hasUserWatchedFilm(targetUser, data.filmId)) {
      throw new Error(
        "Chỉ khán giả đã xem phim (có vé đã được nhân viên duyệt hoặc check-in) mới được phép đánh giá bộ phim này!"
      );
    }

    const newComment = {
      id: `cm-${Date.now()}`,
      report: false,
      reportedBy: null,
      reportReason: null,
      verifiedWatch: true,
      createdAt: new Date().toISOString(),
      ...data,
    };
    db.comments.unshift(newComment);
    saveDb(db);
    const targetFilm = (db.films || []).find((f) => f.id === data.filmId);
    const syncedUser = (db.users || []).find((u) => u.id === (data.userId || targetUser.id)) || targetUser;
    if (syncedUser) {
      cfService.recordActivity({
        web_user_id: data.userId || syncedUser.id,
        email: syncedUser.email,
        full_name: data.userName || syncedUser.fullName || syncedUser.name,
        web_film_id: data.filmId,
        film_title: data.filmTitle || targetFilm?.title,
        category_ids: targetFilm?.categoryIds,
        genres: targetFilm?.genre,
        description: targetFilm?.description,
        event_type: "rated",
        rating: Number(data.rate) || 5,
        comment: data.content || "",
      });
    }
    return newComment;
  },
  reportComment(id, reason, reportedByName = "Người dùng") {
    const db = getDb();
    db.comments = db.comments.map((c) =>
      c.id === id ? { ...c, report: true, reportReason: reason, reportedBy: reportedByName } : c
    );
    saveDb(db);
  },
  resolveCommentReport(id, action) {
    // action: 'delete' (duyệt gỡ bình luận vi phạm) or 'dismiss' (từ chối báo cáo, giữ bình luận)
    const db = getDb();
    if (action === "delete") {
      db.comments = db.comments.filter((c) => c.id !== id);
    } else {
      db.comments = db.comments.map((c) =>
        c.id === id ? { ...c, report: false, reportReason: null, reportedBy: null } : c
      );
    }
    saveDb(db);
  },

  // Promotions
  getPromotions() {
    return getDb().promotions || [];
  },
  addPromotion(data) {
    requireAdminRole("tạo khuyến mãi");
    const db = getDb();
    const newPromo = {
      id: `pr-${Date.now()}`,
      usedCount: 0,
      status: "Đang hoạt động",
      category: "Vé xem phim",
      ...data,
    };
    db.promotions.unshift(newPromo);
    saveDb(db);
    return newPromo;
  },
  updatePromotion(id, data) {
    requireAdminRole("cập nhật khuyến mãi");
    const db = getDb();
    db.promotions = db.promotions.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveDb(db);
  },
  deletePromotion(id) {
    requireAdminRole("xóa khuyến mãi");
    const db = getDb();
    db.promotions = db.promotions.filter((p) => p.id !== id);
    saveDb(db);
  },
  validatePromo(code, subtotal = 0) {
    const db = getDb();
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, message: "Vui lòng nhập mã khuyến mãi!" };
    }

    const promo = (db.promotions || []).find((p) => {
      if (!p.code) return false;
      const matchCode = p.code.trim().toUpperCase() === cleanCode;
      const statusLower = (p.status || "").toLowerCase();
      const isActive = statusLower.includes("hoạt động") || statusLower.includes("active") || !p.status;
      return matchCode && isActive;
    });

    if (!promo) {
      return { valid: false, message: `Mã khuyến mãi "${cleanCode}" không tồn tại hoặc đã ngưng áp dụng!` };
    }

    // Kiểm tra thời hạn
    const today = new Date().toISOString().slice(0, 10);
    if (promo.startDate && promo.startDate > today) {
      return { valid: false, message: `Mã "${cleanCode}" chỉ có hiệu lực từ ngày ${promo.startDate}!` };
    }
    if (promo.endDate && promo.endDate < today) {
      return { valid: false, message: `Mã "${cleanCode}" đã hết hạn sử dụng vào ngày ${promo.endDate}!` };
    }

    // Kiểm tra lượt dùng
    if (promo.usageLimit && (promo.usedCount || 0) >= promo.usageLimit) {
      return { valid: false, message: `Mã "${cleanCode}" đã đạt giới hạn lượt sử dụng trên hệ thống!` };
    }

    // Tính toán số tiền được giảm
    let discountAmount = 0;
    if (promo.discountPercent) {
      discountAmount = Math.round((subtotal * Number(promo.discountPercent)) / 100);
      if (promo.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(promo.maxDiscount));
      }
    } else if (promo.maxDiscount) {
      discountAmount = Math.min(Number(promo.maxDiscount), subtotal);
    }

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return {
      valid: true,
      promo,
      discountAmount,
      message: `Áp dụng thành công mã ${promo.code}: Giảm ${promo.discountPercent || 0}%`,
    };
  },

  // Banners Quảng cáo & Khuyến mãi
  getBanners() {
    return getDb().banners || [];
  },
  addBanner(data) {
    requireAdminRole("thêm banner quảng cáo");
    const db = getDb();
    const newBanner = {
      id: `bn-${Date.now()}`,
      badge: "ƯU ĐÃI",
      badgeColor: "var(--brand-600)",
      bgGradient: "linear-gradient(135deg, #1e1b4b, #312e81)",
      ...data,
    };
    db.banners.unshift(newBanner);
    saveDb(db);
    return newBanner;
  },
  updateBanner(id, data) {
    requireAdminRole("cập nhật banner quảng cáo");
    const db = getDb();
    db.banners = (db.banners || []).map((b) => (b.id === id ? { ...b, ...data } : b));
    saveDb(db);
  },
  deleteBanner(id) {
    requireAdminRole("xóa banner quảng cáo");
    const db = getDb();
    db.banners = (db.banners || []).filter((b) => b.id !== id);
    saveDb(db);
  },

  // Combo foods
  getComboFoods() {
    return getDb().combofoods || [];
  },
  addComboFood(data) {
    requireAdminRole("thêm combo bắp nước");
    const db = getDb();
    const newCombo = {
      id: `cb-${Date.now()}`,
      image: "🍿",
      status: "active",
      ...data,
    };
    db.combofoods.unshift(newCombo);
    saveDb(db);
    return newCombo;
  },

  // Orders / Bookings
  getOrders() {
    return getDb().orders || [];
  },
  createOrder(data) {
    const db = getDb();
    // BUG_BK_03: Chặn hai người đặt trùng cùng một ghế
    if (data.showtimeId && data.seats && data.seats.length > 0) {
      const targetSt = db.showtimes.find((st) => st.id === data.showtimeId);
      if (targetSt) {
        const currentBooked = targetSt.seatsBooked || [];
        const seatKeys = data.seats.map((s) => (typeof s === "string" ? s : s.seatKey));
        const conflicts = seatKeys.filter((k) => currentBooked.includes(k));
        if (conflicts.length > 0) {
          throw new Error(`Ghế ${conflicts.join(", ")} đã có người đặt trước. Vui lòng chọn ghế khác!`);
        }
      }
    }

    const ticketNum = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `MVX-${ticketNum}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      ticketCode,
      ticketQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${ticketCode}`,
      orderStatus: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      ...data,
    };

    // Cập nhật trạng thái ghế đã đặt trong suất chiếu
    if (data.showtimeId && data.seats && data.seats.length > 0) {
      const seatKeys = data.seats.map((s) => (typeof s === "string" ? s : s.seatKey));
      db.showtimes = db.showtimes.map((st) => {
        if (st.id === data.showtimeId) {
          const updatedBooked = Array.from(new Set([...(st.seatsBooked || []), ...seatKeys]));
          return { ...st, seatsBooked: updatedBooked };
        }
        return st;
      });
    }

    // Tăng lượt dùng mã giảm giá nếu có
    if (data.promotionCode) {
      db.promotions = db.promotions.map((p) =>
        p.code === data.promotionCode ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p
      );
    }

    db.orders.unshift(newOrder);
    saveDb(db);
    const orderedFilm = (db.films || []).find((f) => f.id === data.filmId);
    cfService.recordActivity({
      web_user_id: data.userId,
      email: data.email,
      full_name: data.userName,
      web_film_id: data.filmId,
      film_title: data.filmTitle || orderedFilm?.title,
      category_ids: orderedFilm?.categoryIds,
      genres: orderedFilm?.genre,
      description: orderedFilm?.description,
      event_type: "booked",
      order_id: newOrder.id,
    });
    return newOrder;
  },
  updateOrderStatus(id, newStatus, actorName) {
    const curUser = authService.getCurrentUser();
    const db = getDb();
    const prevOrder = db.orders.find((o) => o.id === id);
    if (!prevOrder) return null;

    if (
      (newStatus === "confirmed" || (prevOrder.orderStatus === "pending" && newStatus === "used")) &&
      curUser &&
      !authService.isStaffOrAdmin(curUser)
    ) {
      throw new Error("Chỉ Nhân viên hoặc Quản trị viên mới có quyền duyệt vé hợp lệ!");
    }

    const currentActor = actorName || curUser?.fullName || curUser?.name || "Nhân viên Movix";
    const nowIso = new Date().toISOString();

    // BUG_ORD_01: Hủy đơn hoàn trả ghế về trạng thái trống
    if (newStatus === "cancelled" && prevOrder.orderStatus !== "cancelled") {
      if (prevOrder.showtimeId && prevOrder.seats && prevOrder.seats.length > 0) {
        const releasedKeys = prevOrder.seats.map((s) => (typeof s === "string" ? s : s.seatKey));
        db.showtimes = db.showtimes.map((st) => {
          if (st.id === prevOrder.showtimeId && st.seatsBooked) {
            return {
              ...st,
              seatsBooked: st.seatsBooked.filter((k) => !releasedKeys.includes(k)),
            };
          }
          return st;
        });
      }
    }

    const patch = { orderStatus: newStatus, updatedAt: nowIso };
    if (newStatus === "confirmed") {
      patch.paymentStatus = "paid";
      patch.approvedBy = currentActor;
      patch.approvedAt = nowIso;
      patch.watchedAt = prevOrder.watchedAt || nowIso;
    } else if (newStatus === "used") {
      patch.paymentStatus = "paid";
      patch.checkedInBy = currentActor;
      patch.checkedInAt = nowIso;
      patch.redeemedAt = nowIso;
      patch.watchedAt = prevOrder.watchedAt || nowIso;
    } else if (newStatus === "cancelled") {
      patch.cancelledBy = currentActor;
      patch.cancelledAt = nowIso;
    }

    db.orders = db.orders.map((o) => (o.id === id ? { ...o, ...patch } : o));
    saveDb(db);
    if (newStatus === "confirmed" || newStatus === "used") {
      const targetFilm = (db.films || []).find((f) => f.id === prevOrder.filmId);
      cfService.recordActivity({
        web_user_id: prevOrder.userId,
        email: prevOrder.email,
        full_name: prevOrder.userName,
        web_film_id: prevOrder.filmId,
        film_title: prevOrder.filmTitle || targetFilm?.title,
        category_ids: targetFilm?.categoryIds,
        genres: targetFilm?.genre,
        event_type: newStatus === "used" ? "order_used" : "order_confirmed",
        order_id: prevOrder.id,
      });
    } else if (newStatus === "cancelled") {
      cfService.syncCatalog();
    }
    return db.orders.find((o) => o.id === id);
  },
  deleteOrder(id) {
    requireAdminRole("xóa vĩnh viễn đơn hàng");
    const db = getDb();
    const prevOrder = db.orders.find((o) => o.id === id);
    if (prevOrder && prevOrder.orderStatus !== "cancelled") {
      if (prevOrder.showtimeId && prevOrder.seats && prevOrder.seats.length > 0) {
        const releasedKeys = prevOrder.seats.map((s) => (typeof s === "string" ? s : s.seatKey));
        db.showtimes = db.showtimes.map((st) => {
          if (st.id === prevOrder.showtimeId && st.seatsBooked) {
            return {
              ...st,
              seatsBooked: st.seatsBooked.filter((k) => !releasedKeys.includes(k)),
            };
          }
          return st;
        });
      }
    }
    db.orders = db.orders.filter((o) => o.id !== id);
    saveDb(db);
    return true;
  },

  // Data management
  exportDataJSON() {
    return JSON.stringify(getDb(), null, 2);
  },
  importDataJSON(jsonString) {
    requireAdminRole("nhập dữ liệu hệ thống (Import JSON)");
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === "object") {
        saveDb(parsed);
        return { success: true };
      }
      return { success: false, message: "Dữ liệu JSON không hợp lệ." };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },
  resetDefaultData() {
    requireAdminRole("khôi phục dữ liệu mặc định");
    localStorage.removeItem(STORAGE_KEY_DB);
    const fresh = initLocalDb();
    notifySubscribers();
    return fresh;
  },

  // Remote Supabase Test & Sync helpers
  async testRemoteConnection() {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: "Chưa cấu hình Supabase URL hoặc Anon Key." };
    }
    try {
      const { data, error } = await client.from("films").select("id, title").limit(1);
      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message || "Không thể kết nối đến Supabase." };
    }
  },

  async pushSeedToRemote() {
    requireAdminRole("đồng bộ dữ liệu lên Supabase");
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Chưa cấu hình Supabase URL và Key.");
    }
    const db = getDb();

    // Insert cities
    if (db.cities?.length) {
      await client.from("cities").upsert(
        db.cities.map((c) => ({ id: c.id, name: c.name }))
      );
    }
    // Insert categories
    if (db.categories?.length) {
      await client.from("categories").upsert(
        db.categories.map((c) => ({ id: c.id, title: c.title }))
      );
    }
    // Insert films
    if (db.films?.length) {
      await client.from("films").upsert(
        db.films.map((f) => ({
          id: f.id,
          title: f.title,
          duration: f.duration,
          rating: f.rating,
          description: f.description,
          status: f.status,
          age_rating: f.ageRating,
          trailer: f.trailer,
          thumbnail: f.thumbnail,
        }))
      );
    }
    return { ok: true, count: db.films.length };
  },

  async pullFromRemote() {
    requireAdminRole("tải dữ liệu từ Supabase");
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Chưa cấu hình Supabase URL.");
    }
    const { data: films, error } = await client.from("films").select("*");
    if (error) throw error;
    if (films && films.length > 0) {
      const db = getDb();
      db.films = films.map((f) => ({
        id: f.id,
        title: f.title,
        duration: f.duration || 120,
        rating: f.rating || 8.0,
        description: f.description || "",
        status: f.status || "Đang chiếu",
        ageRating: f.age_rating || "T13",
        trailer: f.trailer || "",
        thumbnail: f.thumbnail || "🎬",
      }));
      saveDb(db);
      return { ok: true, filmsCount: films.length };
    }
    return { ok: true, filmsCount: 0 };
  },

  resetToInitialData() {
    requireAdminRole("đặt lại dữ liệu gốc hệ thống");
    const initial = {
      cities: INITIAL_CITIES,
      categories: INITIAL_CATEGORIES,
      cinemas: INITIAL_CINEMAS,
      rooms: INITIAL_ROOMS,
      films: INITIAL_FILMS,
      users: INITIAL_USERS,
      combofoods: INITIAL_COMBOFOODS,
      promotions: INITIAL_PROMOTIONS,
      banners: INITIAL_BANNERS,
      showtimes: INITIAL_SHOWTIMES,
      comments: INITIAL_COMMENTS,
      orders: INITIAL_ORDERS,
    };
    saveDb(initial);
    return initial;
  },
};
