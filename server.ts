import "dotenv/config";
import express from "express";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient() {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      timeout: 18000,
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const MOVIX_CHAT_TOOLS: FunctionDeclaration[] = [
  {
    name: "get_svd_recommendations",
    description:
      "Lấy Top phim gợi ý cá nhân hóa từ mô hình Machine Learning SVD (Collaborative Filtering) cho tài khoản người dùng hiện tại. Dùng khi khách hỏi gợi ý phim hợp gu, hôm nay xem gì, hoặc muốn khám phá phim phù hợp.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        top_n: {
          type: Type.INTEGER,
          description: "Số lượng phim gợi ý cần lấy (mặc định 5, tối đa 10).",
        },
        genre_filter: {
          type: Type.STRING,
          description: "Lọc theo thể loại tiếng Việt nếu khách có yêu cầu cụ thể (vd: Hành động, Hoạt hình, Kinh dị, Gia đình, Khoa học viễn tưởng).",
        },
      },
    },
  },
  {
    name: "search_movies_and_showtimes",
    description:
      "Tìm kiếm phim đang chiếu, rạp chiếu theo thành phố/tên rạp và các suất chiếu còn ghế trống theo ngày, thể loại, độ tuổi tối đa. LUÔN gọi tool này khi khách hỏi về lịch chiếu, suất chiếu ngày X ở thành phố Y (vd: lịch chiếu ngày 20/11 các rạp ở Hà Nội), phim theo độ tuổi (vd: 15 tuổi xem phim gì) hoặc rạp còn ghế không.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Từ khóa tên phim hoặc nội dung tìm kiếm.",
        },
        genre: {
          type: Type.STRING,
          description: "Thể loại phim (vd: Hành động, Hoạt hình, Hài, Kinh dị, Tình cảm, Gia đình).",
        },
        max_age: {
          type: Type.INTEGER,
          description: "Độ tuổi của khán giả (vd: 12, 15, 16, 18) để lọc bỏ các phim vượt quá giới hạn tuổi (C18/T16/T13).",
        },
        city: {
          type: Type.STRING,
          description: "Tên thành phố / khu vực rạp (vd: Hà Nội, TP. Hồ Chí Minh, Sài Gòn, Đà Nẵng, Cần Thơ, Hải Phòng).",
        },
        cinema_name: {
          type: Type.STRING,
          description: "Tên rạp cụ thể (vd: CGV Bà Triệu, Lotte Landmark 72, Beta Quang Trung, Galaxy Nguyễn Du).",
        },
        date: {
          type: Type.STRING,
          description: "Ngày chiếu (YYYY-MM-DD, DD/MM/YYYY, DD/MM hoặc 'hôm nay', 'ngày mai', 'ngày kia').",
        },
      },
    },
  },
  {
    name: "navigate_movix_page",
    description:
      "Đưa người dùng đi thẳng tới đúng trang chức năng trên website Movix kèm bộ lọc cài đặt sẵn (Lịch chiếu theo ngày & khu vực/rạp/phim, Danh sách rạp theo thành phố, Danh sách phim theo thể loại, Trang khuyến mãi, Hồ sơ/Lịch sử vé/Phim đã xem, hoặc Cổng nhân viên/admin). GỌI tool này khi khách nói 'tôi muốn xem lịch chiếu...', 'đưa tôi đến...', 'mở trang...', 'cho xem các rạp ở...', 'xem phim thể loại...'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        destination: {
          type: Type.STRING,
          description: "Trang đích: 'showtimes' | 'cinemas' | 'movies' | 'promotions' | 'profile' | 'login' | 'admin'",
        },
        date: {
          type: Type.STRING,
          description: "Ngày chiếu nếu mở showtimes hoặc movies (YYYY-MM-DD, DD/MM/YYYY, DD/MM, 'hôm nay', 'ngày mai').",
        },
        city: {
          type: Type.STRING,
          description: "Khu vực/thành phố cần lọc sẵn (vd: 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ').",
        },
        cinema_name: {
          type: Type.STRING,
          description: "Tên rạp cần lọc sẵn (nếu có).",
        },
        movie_title: {
          type: Type.STRING,
          description: "Tên phim cần lọc sẵn (nếu có).",
        },
        genre: {
          type: Type.STRING,
          description: "Thể loại cần lọc nếu mở trang movies.",
        },
        profile_tab: {
          type: Type.STRING,
          description: "Tab trong profile: 'history' (vé đã đặt) | 'watched' (phim đã xem để đánh giá) | 'reviews'.",
        },
        auto_redirect: {
          type: Type.BOOLEAN,
          description: "Đặt true để tự động chuyển thẳng người dùng tới trang đó ngay lập tức.",
        },
      },
      required: ["destination"],
    },
  },
  {
    name: "get_active_promotions",
    description:
      "Lấy danh sách mã khuyến mãi / voucher đang hoạt động và còn lượt dùng trên Movix, hoặc kiểm tra số tiền giảm cho một mã cụ thể.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        promo_code: {
          type: Type.STRING,
          description: "Mã giảm giá cụ thể cần kiểm tra (nếu có).",
        },
        subtotal: {
          type: Type.NUMBER,
          description: "Tổng tiền tạm tính (VNĐ) để ước tính số tiền được giảm.",
        },
      },
    },
  },
  {
    name: "check_tickets_and_watch_history",
    description:
      "Tra cứu vé đặt của tài khoản đang đăng nhập (trạng thái chờ duyệt, đã duyệt/đã xem, đã check-in, đã hủy), lịch sử phim đã xem, hoặc tra cứu theo mã vé MVX-xxxxx. Với nhân viên/admin có thể xem tổng quan hàng chờ duyệt vé.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        ticket_code: {
          type: Type.STRING,
          description: "Mã vé cần tra cứu nếu khách cung cấp (vd: MVX-77410).",
        },
      },
    },
  },
  {
    name: "get_ticket_pricing_and_combos",
    description:
      "Lấy bảng giá vé (Standard, VIP, Sweetbox) và danh sách combo bắp nước đang mở bán tại rạp Movix.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

function stripVN(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function addDaysYMD(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function resolveDateYMD(input: string, fallbackTodayYMD: string): string {
  const raw = String(input || "").trim();
  if (!raw) return "";
  const plain = stripVN(raw);
  if (plain.includes("hom nay") || plain === "today") return fallbackTodayYMD;
  if (plain.includes("ngay mai") || plain === "mai" || plain === "tomorrow") return addDaysYMD(1);
  if (plain.includes("ngay kia") || plain.includes("ngay mot")) return addDaysYMD(2);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const full = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (full) {
    return `${full[3]}-${full[2].padStart(2, "0")}-${full[1].padStart(2, "0")}`;
  }
  const short = raw.match(/(\d{1,2})[/-](\d{1,2})/);
  if (short) {
    return `${new Date().getFullYear()}-${short[2].padStart(2, "0")}-${short[1].padStart(2, "0")}`;
  }
  return "";
}

function formatYMDtoVN(ymd: string): string {
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ymd;
}

const PYTHON_ENGINE = path.resolve(__dirname, "flask_cf_demo/svd_engine.py");
const AI_RECOMMEND_SCRIPT = path.resolve(__dirname, "AI_Recommendation/recommend.py");
const AI_EVALUATE_SCRIPT = path.resolve(__dirname, "AI_Recommendation/evaluate_model.py");
const AI_SYNC_SCRIPT = path.resolve(__dirname, "AI_Recommendation/sync_data.py");

function runPythonScript(scriptPath: string, args: string[], stdinPayload?: unknown) {
  const result = spawnSync("python3", [scriptPath, ...args], {
    cwd: __dirname,
    input: stdinPayload !== undefined ? JSON.stringify(stdinPayload) : undefined,
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const errText = result.stderr || result.stdout || "Python engine execution failed";
    try {
      const parsed = JSON.parse(errText);
      const err = new Error(parsed.error || errText);
      (err as Error & { statusCode?: number }).statusCode = 400;
      throw err;
    } catch {
      throw new Error(errText);
    }
  }
  return JSON.parse(result.stdout);
}

function runPythonEngine(args: string[], stdinPayload?: unknown) {
  return runPythonScript(PYTHON_ENGINE, args, stdinPayload);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Luôn trả về JSON cho lỗi middleware / body-parser trên /api/* (không trả HTML <!DOCTYPE html>)
  app.use(
    (
      err: Error & { status?: number; statusCode?: number; type?: string },
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (req.path.startsWith("/api/") && err) {
        const status =
          err.status || err.statusCode || (err.type === "entity.too.large" ? 413 : 400);
        return res.status(status).json({
          error:
            err.type === "entity.too.large"
              ? "Dữ liệu gửi lên vượt giới hạn cho phép (413)."
              : err.message || "Lỗi định dạng dữ liệu gửi lên.",
          code: err.type === "entity.too.large" ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
        });
      }
      return next(err);
    }
  );

  // Initialize SQLite DB & svd_model.pkl on server startup
  try {
    runPythonEngine(["init"]);
    runPythonScript(AI_SYNC_SCRIPT, []);
  } catch (err) {
    console.error("Failed to initialize CF SQLite / SVD model:", err);
  }

  // API Chính (Theo đặc tả ML): GET /api/recommendations/:userId
  // Ưu tiên gọi FastAPI (http://127.0.0.1:8000) nếu đang chạy; nếu không chạy fallback qua recommend.py (CHỈ load model đã lưu, không train lại)
  app.get("/api/recommendations/:userId", async (req, res) => {
    const userId = String(req.params.userId || "guest");
    const topNNum = Number(req.query.top_n || 5);
    const topN = Number.isFinite(topNNum) && topNNum > 0 ? Math.min(20, Math.trunc(topNNum)) : 5;
    const fastApiBase = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 900);
      const fastRes = await fetch(
        `${fastApiBase}/api/recommendations/${encodeURIComponent(userId)}?top_n=${topN}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (fastRes.ok) {
        const fastData = await fastRes.json();
        return res.json({ ...fastData, via: "fastapi" });
      }
    } catch {
      // FastAPI chưa khởi động -> sử dụng loader Python đọc trực tiếp AI_Recommendation/model/svd_model.pkl
    }

    try {
      const data = runPythonScript(AI_RECOMMEND_SCRIPT, [userId, "--top-n", String(topN), "--json"]);
      return res.json({ ...data, via: "saved_model_loader" });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Kiểm tra trạng thái model & chỉ số đánh giá RMSE / MAE từ evaluate_model.py
  app.get("/api/ai/status", (_req, res) => {
    try {
      const evalData = runPythonScript(AI_EVALUATE_SCRIPT, ["--json"]);
      res.json(evalData);
    } catch (err) {
      res.json({ ok: false, error: (err as Error).message });
    }
  });

  // API (Viewer): Get generated personalized recommendations for homepage/movie detail (no admin SVD internals)
  app.get("/api/cf/viewer-recommendations", (req, res) => {
    try {
      const payload = {
        web_user_id: req.query.webUserId ? String(req.query.webUserId) : undefined,
        email: req.query.email ? String(req.query.email) : undefined,
        user_id: req.query.userId ? Number(req.query.userId) : undefined,
        full_name: req.query.fullName ? String(req.query.fullName) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      const data = runPythonEngine(["viewer_recs"], payload);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API (Side A -> Unified DB): Record watched / booked / rated event and return fresh recommendations
  app.post("/api/cf/activity", (req, res) => {
    try {
      const data = runPythonEngine(["activity"], req.body || {});
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // API (Side A -> Unified DB): Sync Side A films/users/orders/comments into SQLite
  app.post("/api/cf/sync", (req, res) => {
    try {
      const data = runPythonEngine(["sync"], req.body || {});
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Get full CF dashboard state (MovieLens seed, Website activity, SVD model metadata, settings)
  app.get("/api/cf/state", (req, res) => {
    try {
      const uidNum = Number(req.query.userId || 1);
      const userId = Number.isFinite(uidNum) && uidNum > 0 ? String(Math.trunc(uidNum)) : "1";
      const alphaNum = req.query.alpha !== undefined && req.query.alpha !== "" && req.query.alpha !== "null" ? Number(req.query.alpha) : NaN;
      const alpha = Number.isFinite(alphaNum) ? String(alphaNum) : "null";
      const genre = req.query.genre !== undefined && req.query.genre !== "" ? String(req.query.genre) : "null";
      const data = runPythonEngine(["state", userId, alpha, genre]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Update published SVD & Homepage recommendation settings
  app.post("/api/cf/settings", (req, res) => {
    try {
      const data = runPythonEngine(["settings"], req.body || {});
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Demo account login against SQLite users table
  app.post("/api/cf/login", (req, res) => {
    try {
      const data = runPythonEngine(["login"], req.body || {});
      res.json(data);
    } catch (err) {
      const code = (err as Error & { statusCode?: number }).statusCode || 401;
      res.status(code).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Save test rating on website -> stored in SQLite website_ratings (included_in_model = 0)
  app.post("/api/cf/rate", (req, res) => {
    try {
      const data = runPythonEngine(["rate"], req.body || {});
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Retrain SVD model combining movielens_ratings + website_ratings and save svd_model.pkl
  app.post("/api/cf/retrain", (req, res) => {
    try {
      const uidNum = Number(req.body?.user_id || 1);
      const userId = Number.isFinite(uidNum) && uidNum > 0 ? String(Math.trunc(uidNum)) : "1";
      const alphaNum = req.body?.alpha !== undefined && req.body?.alpha !== null && req.body?.alpha !== "" ? Number(req.body.alpha) : NaN;
      const alpha = Number.isFinite(alphaNum) ? String(alphaNum) : "null";
      const genre = req.body?.genre_filter !== undefined && req.body?.genre_filter !== null ? String(req.body.genre_filter) : "null";
      const data = runPythonEngine(["retrain", userId, alpha, genre]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API (Admin): Reset website ratings and retrain baseline MovieLens svd_model.pkl
  app.post("/api/cf/reset", (req, res) => {
    try {
      const uidNum = Number(req.body?.user_id || 1);
      const userId = Number.isFinite(uidNum) && uidNum > 0 ? String(Math.trunc(uidNum)) : "1";
      const alphaNum = req.body?.alpha !== undefined && req.body?.alpha !== null && req.body?.alpha !== "" ? Number(req.body.alpha) : NaN;
      const alpha = Number.isFinite(alphaNum) ? String(alphaNum) : "null";
      const genre = req.body?.genre_filter !== undefined && req.body?.genre_filter !== null ? String(req.body.genre_filter) : "null";
      const data = runPythonEngine(["reset", userId, alpha, genre]);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // API (AI Chatbot - Bước 2): Gemini Function Calling kết nối dữ liệu thật Movix & SVD
  app.post("/api/chat", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          "Chưa cấu hình GEMINI_API_KEY trong Settings > Secrets (hoặc file .env) trên máy chủ để dùng chế độ Gemini AI.",
        code: "MISSING_GEMINI_API_KEY",
      });
    }

    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return res.status(400).json({ error: "Nội dung tin nhắn không được để trống." });
    }

    const user = body.user && typeof body.user === "object" ? body.user : null;
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const ctx = body.contextSnapshot && typeof body.contextSnapshot === "object" ? body.contextSnapshot : {};

    const films = Array.isArray(ctx.films) ? ctx.films : [];
    const cities = Array.isArray(ctx.cities) ? ctx.cities : [];
    const cinemas = Array.isArray(ctx.cinemas) ? ctx.cinemas : [];
    const showtimes = Array.isArray(ctx.showtimes) ? ctx.showtimes : [];
    const promotions = Array.isArray(ctx.promotions) ? ctx.promotions : [];
    const comboFoods = Array.isArray(ctx.comboFoods) ? ctx.comboFoods : [];
    const userOrders = Array.isArray(ctx.userOrders) ? ctx.userOrders : [];
    const watchHistory = Array.isArray(ctx.watchHistory) ? ctx.watchHistory : [];
    const pendingStaffCount = Number(ctx.pendingStaffCount || 0);
    const staffLookupOrders = Array.isArray(ctx.staffLookupOrders) ? ctx.staffLookupOrders : [];

    const now = new Date();
    const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const resolveCity = (cityInput: string) => {
      const needle = stripVN(cityInput);
      if (!needle) return null;
      return (
        cities.find((ct: Record<string, unknown>) => {
          const cName = stripVN(String(ct.name || ""));
          if (cName === needle || cName.includes(needle) || needle.includes(cName)) return true;
          if ((needle.includes("hcm") || needle.includes("sai gon") || needle.includes("tp hcm") || needle.includes("ho chi minh")) && cName.includes("ho chi minh")) {
            return true;
          }
          return false;
        }) || null
      );
    };

    const resolveCinema = (cinemaInput: string, cityObj: Record<string, unknown> | null) => {
      const needle = stripVN(cinemaInput);
      if (!needle) return null;
      return (
        cinemas.find((c: Record<string, unknown>) => {
          if (cityObj && c.cityId && c.cityId !== cityObj.id) return false;
          const text = stripVN(`${c.name || ""} ${c.address || ""}`);
          return text.includes(needle);
        }) || null
      );
    };

    const collectedActions: Array<Record<string, unknown>> = [];
    const seenActionKeys = new Set<string>();
    const pushAction = (key: string, action: Record<string, unknown>) => {
      if (!seenActionKeys.has(key) && collectedActions.length < 7) {
        seenActionKeys.add(key);
        collectedActions.push(action);
      }
    };
    let autoNavigateTarget: Record<string, unknown> | null = null;

    const executeToolCall = (name: string, args: Record<string, unknown> = {}) => {
      if (name === "get_svd_recommendations") {
        const uid = user?.id ? String(user.id) : "guest";
        const topN = Math.max(1, Math.min(10, Number(args.top_n) || 5));
        const genreFilter = typeof args.genre_filter === "string" ? args.genre_filter.trim().toLowerCase() : "";
        const data = runPythonScript(AI_RECOMMEND_SCRIPT, [uid, "--top-n", String(genreFilter ? 12 : topN), "--json"]);
        let recs = Array.isArray(data?.recommendations) ? data.recommendations : [];
        if (genreFilter) {
          const filtered = recs.filter((r: Record<string, unknown>) =>
            String(r.genres || "").toLowerCase().includes(genreFilter)
          );
          if (filtered.length > 0) recs = filtered;
        }
        recs = recs.slice(0, topN);
        for (const r of recs.slice(0, 4)) {
          const filmObj = films.find(
            (f: Record<string, unknown>) =>
              f.id === (r.web_film_id || r.movie_id) ||
              String(f.title || "").toLowerCase() === String(r.title || "").toLowerCase()
          );
          const fid = filmObj?.id || r.web_film_id || r.movie_id;
          if (fid) {
            pushAction(`movie:${fid}`, {
              type: "movie",
              filmId: fid,
              title: filmObj?.title || r.title,
              posterUrl: filmObj?.posterUrl || r.poster_url || r.poster || "",
              genre: filmObj?.genre || r.genres || "",
              ageRating: filmObj?.ageRating || "P",
              score: r.predicted_rating,
              reason: r.reason || "",
            });
          }
        }
        return {
          userId: uid,
          strategy: data?.strategy || "svd",
          recommendations: recs,
        };
      }

      if (name === "search_movies_and_showtimes") {
        const q = String(args.query || "").trim().toLowerCase();
        const genre = String(args.genre || "").trim().toLowerCase();
        const maxAge = args.max_age !== undefined && args.max_age !== null ? Number(args.max_age) : null;
        const cityArg = String(args.city || "").trim();
        const cinemaArg = String(args.cinema_name || "").trim();
        const resolvedCity = resolveCity(cityArg || cinemaArg);
        const resolvedCinema = cinemaArg && !resolveCity(cinemaArg) ? resolveCinema(cinemaArg, resolvedCity) : null;
        const dateFilter = resolveDateYMD(String(args.date || ""), todayYMD);

        const matchedFilms = films.filter((f: Record<string, unknown>) => {
          const title = String(f.title || "").toLowerCase();
          const fGenre = String(f.genre || "").toLowerCase();
          const desc = String(f.description || "").toLowerCase();
          const ratingStr = String(f.ageRating || "P").toUpperCase();

          if (maxAge !== null && Number.isFinite(maxAge)) {
            if (maxAge < 18 && (ratingStr === "C18" || ratingStr === "18+")) return false;
            if (maxAge < 16 && (ratingStr === "T16" || ratingStr === "C16" || ratingStr === "16+")) return false;
            if (maxAge < 13 && (ratingStr === "T13" || ratingStr === "13+")) return false;
          }
          if (q && !stripVN(title).includes(stripVN(q)) && !stripVN(desc).includes(stripVN(q)) && !stripVN(fGenre).includes(stripVN(q))) {
            return false;
          }
          if (genre && !stripVN(fGenre).includes(stripVN(genre)) && !stripVN(desc).includes(stripVN(genre))) return false;
          return true;
        });

        const typedMatchedFilms = matchedFilms as Array<Record<string, unknown>>;
        const results: Array<{ film: Record<string, unknown>; upcomingShowtimes: Array<Record<string, unknown>> }> = typedMatchedFilms
          .map((f) => {
            const fShowtimes = showtimes
              .filter((st: Record<string, unknown>) => {
                if (st.filmId !== f.id) return false;
                const stDate = resolveDateYMD(String(st.date || ""), todayYMD) || todayYMD;
                const stTime = String(st.startTime || "");
                if (dateFilter && stDate !== dateFilter) return false;
                if (stDate < todayYMD || (stDate === todayYMD && stTime <= nowHM)) return false;
                const cin = cinemas.find((c: Record<string, unknown>) => c.id === st.cinemaId);
                if (resolvedCity && cin?.cityId !== resolvedCity.id) return false;
                if (resolvedCinema && cin?.id !== resolvedCinema.id) return false;
                if (!resolvedCity && !resolvedCinema && cinemaArg) {
                  const cinText = stripVN(`${cin?.name || ""} ${cin?.city || ""} ${cin?.address || ""}`);
                  if (!cinText.includes(stripVN(cinemaArg))) return false;
                }
                const bookedCount =
                  typeof st.seatsBookedCount === "number"
                    ? st.seatsBookedCount
                    : Array.isArray(st.seatsBooked)
                    ? st.seatsBooked.length
                    : 0;
                const avail = (Number(st.totalSeats) || 96) - bookedCount;
                return avail > 0;
              })
              .slice(0, 4)
              .map((st: Record<string, unknown>) => {
                const cin = cinemas.find((c: Record<string, unknown>) => c.id === st.cinemaId);
                const stDate = resolveDateYMD(String(st.date || ""), todayYMD) || todayYMD;
                const bookedCount =
                  typeof st.seatsBookedCount === "number"
                    ? st.seatsBookedCount
                    : Array.isArray(st.seatsBooked)
                    ? st.seatsBooked.length
                    : 0;
                const avail = (Number(st.totalSeats) || 96) - bookedCount;
                return {
                  showtimeId: st.id,
                  cinemaId: st.cinemaId,
                  cinemaName: cin?.name || "Rạp Movix",
                  cityName: cities.find((ct: Record<string, unknown>) => ct.id === cin?.cityId)?.name || cin?.city || "",
                  date: stDate,
                  startTime: st.startTime,
                  basePrice: Number(st.basePrice || 80000),
                  availableSeats: avail,
                };
              });

            return {
              film: f,
              upcomingShowtimes: fShowtimes,
            };
          })
          .filter((item) => (!dateFilter && !resolvedCity && !resolvedCinema) || item.upcomingShowtimes.length > 0)
          .slice(0, 6);

        const navParams: Record<string, unknown> = {};
        if (dateFilter) navParams.date = dateFilter;
        if (resolvedCity) navParams.cityId = resolvedCity.id;
        if (resolvedCinema) navParams.cinemaId = resolvedCinema.id;
        if (q && results.length === 1) navParams.movieId = results[0].film.id;

        if (Object.keys(navParams).length > 0) {
          const areaText = resolvedCinema ? String(resolvedCinema.name) : resolvedCity ? String(resolvedCity.name) : "tất cả rạp";
          const dateText = dateFilter ? `ngày ${formatYMDtoVN(dateFilter)}` : "hôm nay";
          pushAction("showtimes:filtered", {
            type: "navigate",
            route: "showtimes",
            params: navParams,
            label: `🗓️ Xem Lịch chiếu ${areaText} (${dateText})`,
          });
        }

        for (const item of results) {
          const f = item.film;
          pushAction(`movie:${f.id}`, {
            type: "movie",
            filmId: f.id,
            title: f.title,
            posterUrl: f.posterUrl || "",
            genre: f.genre || "",
            ageRating: f.ageRating || "P",
            rating: f.rating,
          });
          if (item.upcomingShowtimes[0]) {
            const firstSt = item.upcomingShowtimes[0];
            pushAction(`st:${firstSt.showtimeId}`, {
              type: "seatSelect",
              movieId: f.id,
              cinemaId: firstSt.cinemaId,
              showtimeId: firstSt.showtimeId,
              time: firstSt.startTime,
              date: firstSt.date,
              label: `🎟️ Đặt ${f.title} (${firstSt.startTime} · ${formatYMDtoVN(String(firstSt.date))})`,
            });
          }
        }

        return {
          todayYMD,
          appliedFilters: {
            date: dateFilter || null,
            city: resolvedCity ? resolvedCity.name : null,
            cinema: resolvedCinema ? resolvedCinema.name : null,
          },
          matchedCount: results.length,
          movies: results.map((item) => ({
            id: item.film.id,
            title: item.film.title,
            genre: item.film.genre,
            ageRating: item.film.ageRating || "P",
            duration: item.film.duration,
            rating: item.film.rating,
            status: item.film.status,
            upcomingShowtimes: item.upcomingShowtimes,
          })),
        };
      }

      if (name === "navigate_movix_page") {
        const destRaw = String(args.destination || "showtimes").trim();
        const allowedDest = new Set(["showtimes", "cinemas", "movies", "promotions", "profile", "login", "admin"]);
        const dest = allowedDest.has(destRaw) ? destRaw : "showtimes";

        const resolvedCity = resolveCity(String(args.city || ""));
        const resolvedCinema = args.cinema_name ? resolveCinema(String(args.cinema_name), resolvedCity) : null;
        const dateYMD = resolveDateYMD(String(args.date || ""), todayYMD);
        const movieTitleNeedle = stripVN(String(args.movie_title || ""));
        const matchedFilm = movieTitleNeedle
          ? films.find((f: Record<string, unknown>) => stripVN(String(f.title || "")).includes(movieTitleNeedle))
          : null;

        const navParams: Record<string, unknown> = {};
        let label = "🔗 Mở trang Movix";

        if (dest === "showtimes") {
          if (dateYMD) navParams.date = dateYMD;
          if (resolvedCity) navParams.cityId = resolvedCity.id;
          if (resolvedCinema) navParams.cinemaId = resolvedCinema.id;
          if (matchedFilm) navParams.movieId = matchedFilm.id;
          const areaLabel = resolvedCinema ? String(resolvedCinema.name) : resolvedCity ? String(resolvedCity.name) : "tất cả rạp";
          const dateLabel = dateYMD ? formatYMDtoVN(dateYMD) : "hôm nay";
          label = `🗓️ Mở Lịch chiếu ${areaLabel} (${dateLabel})`;
        } else if (dest === "cinemas") {
          if (resolvedCity) navParams.cityId = resolvedCity.id;
          label = resolvedCity ? `🏢 Xem cụm rạp tại ${resolvedCity.name}` : "🏢 Xem Hệ thống rạp Movix";
        } else if (dest === "movies") {
          if (args.genre) navParams.category = String(args.genre);
          if (dateYMD) navParams.date = dateYMD;
          if (matchedFilm) navParams.q = String(matchedFilm.title);
          label = args.genre ? `🎬 Xem phim thể loại ${args.genre}` : "🎬 Xem Danh sách phim";
        } else if (dest === "promotions") {
          label = "🏷️ Mở trang Khuyến mãi Movix";
        } else if (dest === "profile") {
          const pTab = String(args.profile_tab || "history");
          navParams.tab = pTab;
          label = pTab === "watched" ? "🎬 Mở Lịch sử phim đã xem" : "🎟️ Mở Lịch sử vé của tôi";
        } else if (dest === "admin") {
          const isStaffOrAdmin = user?.role === "admin" || user?.role === "administrator" || user?.role === "employee" || user?.role === "staff";
          if (!isStaffOrAdmin) {
            return { error: "Tài khoản hiện tại không có quyền mở trang Nhân viên/Quản trị." };
          }
          navParams.tab = "ticketApproval";
          label = "🎫 Mở Cổng Duyệt vé & Soát vé";
        } else if (dest === "login") {
          label = "🔐 Mở trang Đăng nhập";
        }

        const navAction = {
          type: "navigate",
          route: dest,
          params: navParams,
          label,
        };
        pushAction(`nav:${dest}:${JSON.stringify(navParams)}`, navAction);

        return {
          buttonCreated: true,
          route: dest,
          params: navParams,
          label,
        };
      }

      if (name === "get_active_promotions") {
        const promoCodeQ = String(args.promo_code || "").trim().toUpperCase();
        const subtotal = Number(args.subtotal || 0);
        const activePromos = promotions.filter((p: Record<string, unknown>) => {
          const stLower = String(p.status || "").toLowerCase();
          const active = !p.status || stLower.includes("hoạt động") || stLower.includes("active");
          if (!active) return false;
          const pStart = p.startDate ? resolveDateYMD(String(p.startDate), todayYMD) : "";
          const pEnd = p.endDate ? resolveDateYMD(String(p.endDate), todayYMD) : "";
          if (pStart && pStart > todayYMD) return false;
          if (pEnd && pEnd < todayYMD) return false;
          if (p.usageLimit && Number(p.usedCount || 0) >= Number(p.usageLimit)) return false;
          if (promoCodeQ && String(p.code || "").trim().toUpperCase() !== promoCodeQ) return false;
          return true;
        });

        const formatted = activePromos.slice(0, 6).map((p: Record<string, unknown>) => {
          let estimatedDiscount = 0;
          if (subtotal > 0) {
            if (p.discountPercent) {
              estimatedDiscount = Math.round((subtotal * Number(p.discountPercent)) / 100);
              if (p.maxDiscount) estimatedDiscount = Math.min(estimatedDiscount, Number(p.maxDiscount));
            } else if (p.maxDiscount) {
              estimatedDiscount = Math.min(Number(p.maxDiscount), subtotal);
            }
          }
          return {
            code: p.code,
            title: p.title || p.description,
            discountPercent: p.discountPercent || 0,
            maxDiscount: p.maxDiscount || 0,
            endDate: p.endDate || "Không giới hạn",
            estimatedDiscount,
          };
        });

        if (formatted.length > 0) {
          pushAction("promotions:view", {
            type: "navigate",
            route: "promotions",
            label: "🏷️ Xem tất cả mã khuyến mãi",
          });
        }

        return {
          activePromotions: formatted,
        };
      }

      if (name === "check_tickets_and_watch_history") {
        const codeQ = String(args.ticket_code || "").trim().toLowerCase();
        const isStaffOrAdmin = user?.role === "admin" || user?.role === "employee" || user?.role === "staff";

        if (codeQ && isStaffOrAdmin && staffLookupOrders.length > 0) {
          const foundStaff = staffLookupOrders.find(
            (o: Record<string, unknown>) =>
              String(o.ticketCode || "").toLowerCase() === codeQ ||
              String(o.ticketCode || "").toLowerCase().includes(codeQ)
          );
          if (foundStaff) {
            pushAction("admin:ticketApproval", {
              type: "navigate",
              route: "admin",
              params: { tab: "ticketApproval" },
              label: "🎫 Mở Duyệt vé & Soát vé",
            });
            return {
              staffLookup: true,
              pendingTicketsCount: pendingStaffCount,
              ticket: foundStaff,
            };
          }
        }

        if (!user) {
          pushAction("login:prompt", {
            type: "navigate",
            route: "login",
            label: "🔐 Đăng nhập để xem vé của bạn",
          });
          return {
            loggedIn: false,
            message: "Người dùng chưa đăng nhập nên chưa tra cứu được vé cá nhân.",
          };
        }

        let filteredOrders = userOrders;
        if (codeQ) {
          filteredOrders = userOrders.filter((o: Record<string, unknown>) =>
            String(o.ticketCode || "").toLowerCase().includes(codeQ)
          );
        }

        pushAction("profile:view", {
          type: "navigate",
          route: "profile",
          params: { tab: "history" },
          label: "🎟️ Xem lịch sử vé & phim đã xem",
        });
        if (isStaffOrAdmin) {
          pushAction("admin:ticketApproval", {
            type: "navigate",
            route: "admin",
            params: { tab: "ticketApproval" },
            label: "🎫 Vào cổng Duyệt vé & Soát vé",
          });
        }

        return {
          loggedIn: true,
          userRole: user.role || "customer",
          pendingStaffQueueCount: isStaffOrAdmin ? pendingStaffCount : undefined,
          orders: filteredOrders.slice(0, 6),
          watchedMovies: watchHistory.slice(0, 8),
        };
      }

      if (name === "get_ticket_pricing_and_combos") {
        return {
          seatPricing: {
            standard: 80000,
            vip: 95000,
            sweetboxCouple: 150000,
          },
          comboFoods: comboFoods.slice(0, 6),
        };
      }

      return { error: `Unknown tool: ${name}` };
    };

    const userSummary = user
      ? `Người dùng đang đăng nhập: ${user.fullName || user.name || "Khán giả"} (id=${user.id}, role=${user.role || "customer"}).`
      : "Người dùng hiện là khách vãng lai chưa đăng nhập.";

    const systemInstruction = [
      "Bạn là Trợ lý AI chính thức của hệ thống rạp chiếu phim Movix.",
      userSummary,
      `Ngày giờ hiện tại tại rạp: ${todayYMD} ${nowHM}.`,
      "Quy tắc bắt buộc:",
      "1. Chỉ trả lời các chủ đề liên quan đến phim ảnh, gợi ý phim SVD, lịch chiếu, rạp, giá vé, combo bắp nước, khuyến mãi, vé của tôi, lịch sử đã xem và quy trình duyệt vé/đánh giá tại Movix. Từ chối lịch sự nếu câu hỏi ngoài phạm vi (thời tiết, toán học, chính trị...).",
      "2. LUÔN dùng Function Calling để tra dữ liệu thật trước khi trả lời về phim, suất chiếu, gợi ý SVD, mã giảm giá hoặc trạng thái vé. Tuyệt đối KHÔNG bịa tên phim, giờ chiếu hoặc mã giảm giá không có trong kết quả tool.",
      "3. Khi người dùng muốn xem/đi tới một trang có bộ lọc cụ thể (vd: 'tôi muốn xem lịch chiếu ngày 20/11 các rạp ở Hà Nội', 'cho xem các rạp ở TP.HCM', 'tìm phim hoạt hình', 'mở trang khuyến mãi', 'xem lịch sử phim đã xem'), HÃY gọi search_movies_and_showtimes (nếu hỏi suất chiếu) VÀ/HOẶC navigate_movix_page để hệ thống tạo nút bấm mở sẵn trang kèm bộ lọc chính xác.",
      "4. Tuân thủ nghiêm giới hạn độ tuổi: nếu khách nêu tuổi nhỏ hơn 18/16/13, truyền max_age vào search_movies_and_showtimes và tuyệt đối không gợi ý phim vượt tuổi.",
      "5. Nhớ nguyên tắc Movix: vé đang chờ duyệt (pending) chưa tính là đã xem; khi nhân viên duyệt vé (confirmed) hoặc check-in (used) thì phim được tính là đã xem và mở khóa quyền đánh giá.",
      "6. Trả lời bằng tiếng Việt tự nhiên, ngắn gọn, rõ ràng, nêu rõ rạp/giờ chiếu và nhắc khách bấm nút bên dưới để mở trang tương ứng (không tự nhận là đang tự động chuyển trang).",
      "7. Nếu user có vai trò employee (nhân viên), tuyệt đối không tiết lộ doanh thu hay chức năng quản trị của Admin.",
    ].join("\n");

    try {
      const contents: Array<Record<string, unknown>> = [];
      for (const h of history) {
        if (h && typeof h.text === "string" && h.text.trim()) {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text.trim() }],
          });
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const toolsUsed: string[] = [];
      let response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: contents as never,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: MOVIX_CHAT_TOOLS }],
        },
      });

      for (let step = 0; step < 4; step++) {
        const calls = response.functionCalls;
        if (!calls || calls.length === 0) break;

        const previousContent = response.candidates?.[0]?.content;
        if (!previousContent) break;
        contents.push(previousContent as unknown as Record<string, unknown>);

        const responseParts: Array<Record<string, unknown>> = [];
        for (const call of calls) {
          const fnName = call.name || "";
          toolsUsed.push(fnName);
          let fnResult: unknown;
          try {
            fnResult = executeToolCall(fnName, (call.args || {}) as Record<string, unknown>);
          } catch (toolErr) {
            fnResult = { error: (toolErr as Error).message };
          }
          responseParts.push({
            functionResponse: {
              id: call.id,
              name: fnName,
              response: { result: fnResult },
            },
          });
        }

        contents.push({
          role: "user",
          parts: responseParts,
        });

        response = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: contents as never,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: MOVIX_CHAT_TOOLS }],
          },
        });
      }

      const replyText = (response.text || "").trim() || "Tôi đã kiểm tra dữ liệu Movix cho bạn, mời bạn xem các gợi ý bên dưới nhé!";
      return res.json({
        reply: replyText,
        model: "gemini-4-hydrogen",
        toolsUsed: Array.from(new Set(toolsUsed)),
        actions: collectedActions,
        autoNavigate: autoNavigateTarget,
      });
    } catch (err) {
      const msg = (err as Error)?.message || "Không thể kết nối đến Gemini API.";
      const status = msg.includes("403") || msg.includes("PERMISSION_DENIED")
        ? 403
        : msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")
        ? 429
        : msg.includes("503") || msg.includes("UNAVAILABLE")
        ? 503
        : msg.includes("400") || msg.includes("API_KEY_INVALID")
        ? 400
        : 500;
      return res.status(status).json({
        error: `Lỗi Gemini AI (${status}): ${msg}`,
      });
    }
  });

  // Download Word (.docx) tài liệu hướng dẫn thuyết trình & demo SVD
  app.get(["/api/docs/svd-demo.docx", "/Huong_Dan_Thuyet_Trinh_Demo_SVD.docx"], (_req, res) => {
    const docxPath = path.resolve(__dirname, "public/Huong_Dan_Thuyet_Trinh_Demo_SVD.docx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Huong_Dan_Thuyet_Trinh_Demo_SVD.docx"'
    );
    res.sendFile(docxPath);
  });

  // Vite middleware for development; static assets for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Movix full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
