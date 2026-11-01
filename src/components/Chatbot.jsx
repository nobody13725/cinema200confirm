import React, { useState, useEffect, useRef } from "react";
import { dbService } from "../lib/supabaseClient.js";

export default function Chatbot({ go }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý AI của Movix. Tôi có thể giúp bạn gợi ý phim, tra cứu giá vé, xem lịch chiếu và hướng dẫn đặt vé nhanh chóng!",
      time: "Vừa xong",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Quick Action Chips
  const quickActions = [
    "Phim nào đang chiếu?",
    "Gợi ý phim hành động",
    "Tôi muốn xem phim vui",
    "Tôi 15 tuổi xem phim gì?",
    "Giá vé bao nhiêu?",
    "Làm sao đặt vé?",
  ];

  // Logic sinh câu trả lời thông minh dựa trên CSDL thực tế của rạp
  function generateBotResponse(userMsg) {
    const raw = (userMsg || "").trim().toLowerCase();
    const films = dbService.getFilms() || [];
    const showtimes = dbService.getShowtimes() || [];

    // TC_AI_09: Câu hỏi ngoài phạm vi (thời tiết, toán học, v.v.)
    const offTopicKeywords = [
      "thời tiết",
      "nhiệt độ",
      "trời mưa",
      "toán",
      "tính toán",
      "cộng",
      "trừ",
      "nhân",
      "chia",
      "phương trình",
      "lịch sử",
      "địa lý",
      "chính trị",
      "bóng đá",
    ];
    if (
      offTopicKeywords.some((kw) => raw.includes(kw)) ||
      /^[0-9+\-*/=^. ]+$/.test(raw)
    ) {
      return {
        text: "Xin lỗi bạn, tôi là trợ lý ảo chuyên trách của cụm rạp Movix. Tôi chỉ có thể hỗ trợ các thông tin về phim ảnh, lịch chiếu, giá vé và hướng dẫn quy trình đặt vé tại rạp Movix thôi ạ!",
      };
    }

    // TC_AI_06: Hỏi giá vé
    if (
      raw.includes("giá vé") ||
      raw.includes("bao nhiêu tiền") ||
      raw.includes("bảng giá") ||
      raw.includes("vé bao nhiêu")
    ) {
      return {
        text: `Bảng giá vé niêm yết tại hệ thống rạp Movix:\n• Ghế thường (Standard): 80.000đ/vé\n• Ghế VIP (hàng ghế trung tâm): 95.000đ/vé\n• Ghế đôi Sweetbox: 150.000đ/cặp\n\nMovix còn có nhiều mã voucher giảm giá 10% - 50% trong mục Khuyến mãi nữa nhé!`,
      };
    }

    // TC_AI_07: Hướng dẫn đặt vé
    if (
      raw.includes("làm sao đặt") ||
      raw.includes("cách đặt vé") ||
      raw.includes("hướng dẫn đặt") ||
      raw.includes("mua vé thế nào")
    ) {
      return {
        text: `Quy trình đặt vé xem phim tại Movix rất đơn giản gồm 5 bước:\n1. Chọn phim bạn muốn xem trên trang chủ hoặc mục "Phim".\n2. Chọn ngày và khung giờ suất chiếu phù hợp.\n3. Chọn ghế ngồi trên sơ đồ phòng chiếu (Thường, VIP hoặc Ghế đôi).\n4. Thêm combo bắp nước thơm ngon nếu thích.\n5. Áp dụng mã voucher giảm giá và xác nhận thanh toán để nhận vé điện tử kèm mã QR quét tại rạp!`,
      };
    }

    // BUG_AI_01 & TC_AI_04: Gợi ý theo độ tuổi người xem (e.g. "Tôi 15 tuổi xem phim gì")
    // Tuyệt đối KHÔNG gợi ý phim C18 hoặc C16 cho người dưới độ tuổi quy định!
    const ageMatch = raw.match(/(\d{1,2})\s*tuổi/);
    if (ageMatch || raw.includes("tuổi")) {
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 15;

      // Lọc các phim có trong hệ thống thỏa mãn độ tuổi
      const allowedFilms = films.filter((f) => {
        const rating = (f.ageRating || "P").toUpperCase();
        if (age < 18 && (rating === "C18" || rating === "18+")) return false;
        if (age < 16 && (rating === "T16" || rating === "C16" || rating === "16+")) return false;
        if (age < 13 && (rating === "T13" || rating === "13+")) return false;
        return true;
      });

      if (allowedFilms.length === 0) {
        return {
          text: `Hiện chưa có phim phù hợp với độ tuổi ${age} đang chiếu. Bạn hãy quay lại sau nhé!`,
        };
      }

      const listStr = allowedFilms
        .slice(0, 4)
        .map((f) => `• ${f.title} (${f.ageRating || "P"} - ${f.duration}p): ${f.genre || "Chiếu rạp"}`)
        .join("\n");

      return {
        text: `Chào bạn, bạn ${age} tuổi nên Movix tuân thủ quy định và TUYỆT ĐỐI KHÔNG gợi ý các phim gắn nhãn C18 (hoặc C16 nếu chưa đủ tuổi). Dưới đây là các bộ phim an toàn và phù hợp nhất dành cho bạn:\n\n${listStr}\n\nBạn có thể nhấn nút "Phim" ở menu để xem chi tiết và đặt vé nhé!`,
      };
    }

    // TC_AI_05: Hỏi suất chiếu của phim hôm nay (e.g. "Phim Avatar hôm nay chiếu mấy giờ")
    const matchedFilm = films.find((f) =>
      raw.includes(f.title.toLowerCase())
    );
    if (
      matchedFilm &&
      (raw.includes("chiếu mấy giờ") ||
        raw.includes("suất chiếu") ||
        raw.includes("lịch chiếu") ||
        raw.includes("giờ chiếu"))
    ) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const filmSt = showtimes.filter(
        (st) => st.filmId === matchedFilm.id && (!st.date || st.date === todayStr)
      );

      if (filmSt.length === 0) {
        return {
          text: `Phim "${matchedFilm.title}" hôm nay hiện chưa có suất chiếu khả dụng tại các rạp gần bạn. Bạn hãy kiểm tra các ngày tiếp theo trong mục "Lịch chiếu" nhé!`,
        };
      }

      const times = filmSt.map((st) => st.startTime).join(", ");
      return {
        text: `Hôm nay phim "${matchedFilm.title}" có các suất chiếu vào các khung giờ: ${times}. Bạn có thể vào mục "Lịch chiếu" hoặc trang chi tiết phim để chọn rạp và đặt vé ngay!`,
      };
    }

    // TC_AI_02: Gợi ý phim theo thể loại (Hành động, Kinh dị, Hoạt hình...)
    if (
      raw.includes("hành động") ||
      raw.includes("kinh dị") ||
      raw.includes("hoạt hình") ||
      raw.includes("tình cảm") ||
      raw.includes("khoa học") ||
      raw.includes("hài") ||
      raw.includes("thể loại")
    ) {
      let targetGenre = "hành động";
      if (raw.includes("kinh dị")) targetGenre = "kinh dị";
      else if (raw.includes("hoạt hình")) targetGenre = "hoạt hình";
      else if (raw.includes("tình cảm")) targetGenre = "tình cảm";
      else if (raw.includes("khoa học")) targetGenre = "khoa học";
      else if (raw.includes("hài")) targetGenre = "hài";

      // TC_AI_13: Chỉ gợi ý phim có trong hệ thống
      const matched = films.filter((f) => {
        const g = (f.genre || f.category || "").toLowerCase();
        const desc = (f.description || "").toLowerCase();
        return g.includes(targetGenre) || desc.includes(targetGenre);
      });

      if (matched.length > 0) {
        const listStr = matched
          .slice(0, 3)
          .map((f) => `• ${f.title} (⭐ ${f.rating || 8.5}/10, ${f.ageRating || "P"}): ${f.description?.slice(0, 90)}...`)
          .join("\n\n");
        return {
          text: `Dưới đây là các phim thể loại ${targetGenre.toUpperCase()} nổi bật đang chiếu tại Movix:\n\n${listStr}\n\nBạn có muốn tôi hỗ trợ đặt vé cho phim nào trong số này không?`,
        };
      }
    }

    // TC_AI_03: Gợi ý phim theo tâm trạng (vui, buồn, hồi hộp, thư giãn...)
    if (
      raw.includes("phim vui") ||
      raw.includes("hài hước") ||
      raw.includes("thư giãn") ||
      raw.includes("giải trí") ||
      raw.includes("tâm trạng")
    ) {
      const funFilms = films.filter((f) => {
        const text = `${f.title} ${f.genre} ${f.description}`.toLowerCase();
        return (
          text.includes("hài") ||
          text.includes("hoạt hình") ||
          text.includes("vui") ||
          text.includes("phiêu lưu")
        );
      });

      const chosen = funFilms.length > 0 ? funFilms.slice(0, 3) : films.slice(0, 3);
      const listStr = chosen
        .map((f) => `• ${f.title} (${f.ageRating || "P"}): Bộ phim giải trí hấp dẫn giúp bạn thư giãn!`)
        .join("\n");

      return {
        text: `Nếu bạn đang muốn tìm cảm giác vui vẻ, sảng khoái, Movix gợi ý cho bạn các tựa phim này nhé:\n\n${listStr}`,
      };
    }

    // TC_AI_08: Phim nào đang chiếu
    if (
      raw.includes("đang chiếu") ||
      raw.includes("danh sách phim") ||
      raw.includes("có phim gì") ||
      raw.includes("phim nào")
    ) {
      const nowShowing = films.filter((f) => f.status === "Đang chiếu");
      const listStr = (nowShowing.length > 0 ? nowShowing : films)
        .slice(0, 4)
        .map((f) => `• ${f.title} (${f.format || "2D"}, ${f.ageRating || "P"}) - ⭐ ${f.rating || 8.5}`)
        .join("\n");

      return {
        text: `Danh sách các phim bom tấn ĐANG CHIẾU tại hệ thống rạp Movix:\n\n${listStr}\n\nBạn hãy nhấp vào menu "Phim" hoặc chọn phim để xem lịch chiếu chi tiết nhé!`,
      };
    }

    // Mặc định: Gợi ý phim ngẫu nhiên có trong hệ thống
    const topFilms = films.slice(0, 3).map((f) => `• ${f.title} (${f.genre || "Chiếu rạp"})`).join("\n");
    return {
      text: `Tôi có thể hỗ trợ bạn tìm phim xem theo sở thích, tra cứu giá vé và suất chiếu hôm nay. Một số phim nổi bật tại Movix:\n${topFilms}\n\nBạn muốn tìm phim thể loại gì hoặc cần thông tin giá vé thế nào cứ nhắn cho tôi nhé!`,
    };
  }

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();

    // TC_AI_10: Không gửi tin nhắn rỗng
    if (!query) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatError("");
    setIsTyping(true);

    // BUG_AI_02 & TC_AI_11, TC_AI_12: Kiểm tra kết nối mạng và xử lý lỗi / timeout
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsTyping(false);
      setChatError("Mất kết nối mạng. Khung chat không thể liên lạc với máy chủ.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          isError: true,
          text: "⚠️ Không thể kết nối đến máy chủ AI (Mất kết nối Internet). Vui lòng kiểm tra lại mạng và thử lại sau.",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      return;
    }

    // Giả lập độ trễ phản hồi tự nhiên (500ms) với xử lý lỗi try/catch an toàn
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const res = generateBotResponse(query);

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: res.text,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      // BUG_AI_02: Báo lỗi thân thiện, giao diện KHÔNG bị treo ở trạng thái typing
      setIsTyping(false);
      setChatError("Dịch vụ AI phản hồi chậm hoặc gặp sự cố.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          isError: true,
          text: "⚠️ Đã xảy ra lỗi khi xử lý câu hỏi. Giao diện đã được phục hồi, bạn có thể thử gửi lại tin nhắn.",
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

      {/* Cửa sổ Chatbot AI (TC_AI_01 đến TC_AI_16) */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            height: "520px",
            maxHeight: "calc(100vh - 40px)",
            background: "white",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
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
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
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
                <div style={{ fontWeight: 700, fontSize: 14 }}>Cinema Ticket Chatbot</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Tư vấn phim & lịch chiếu 24/7</div>
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
                  maxWidth: "85%",
                }}
              >
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
                <span>🎬 Movix AI đang trả lời...</span>
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
              placeholder="Nhập câu hỏi (vd: Tôi 15 tuổi xem phim gì?)..."
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
