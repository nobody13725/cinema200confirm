// Dữ liệu khởi tạo cho 11 bảng chuẩn theo đặc tả Đồ án 01 - Đa dạng thể loại & Hình ảnh sắc nét thực tế
export const INITIAL_CITIES = [
  { id: "city-1", name: "TP. Hồ Chí Minh" },
  { id: "city-2", name: "Hà Nội" },
  { id: "city-3", name: "Đà Nẵng" },
  { id: "city-4", name: "Cần Thơ" },
  { id: "city-5", name: "Hải Phòng" }
];

export const INITIAL_CATEGORIES = [
  { id: "cat-1", title: "Hành động" },
  { id: "cat-2", title: "Khoa học viễn tưởng" },
  { id: "cat-3", title: "Kinh dị & Bí ẩn" },
  { id: "cat-4", title: "Chính kịch & Tâm lý" },
  { id: "cat-5", title: "Hoạt hình & Anime" },
  { id: "cat-6", title: "Hài hước" },
  { id: "cat-7", title: "Gia đình & Tình cảm" }
];

export const INITIAL_CINEMAS = [
  {
    id: "cin-1",
    name: "CGV Vincom Center Bà Triệu",
    address: "191 Bà Triệu, Q. Hai Bà Trưng, Hà Nội",
    hotline: "1900 6017",
    amenities: ["IMAX Laser", "Gold Class", "Dolby Atmos", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-2",
    description: "Cụm rạp hiện đại với phòng chiếu Gold Class sang trọng và âm thanh vòm Dolby Atmos 7.1 đỉnh cao."
  },
  {
    id: "cin-2",
    name: "Lotte Cinema Landmark 72",
    address: "Tầng 5 Keangnam Landmark 72, Nam Từ Liêm, Hà Nội",
    hotline: "1900 5454 36",
    amenities: ["Gold Class", "Dolby Atmos", "Sweetbox", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-2",
    description: "Rạp chiếu chuẩn quốc tế với phòng chiếu Prestige, ghế da ngả 180 độ và quầy lounge phục vụ tận nơi."
  },
  {
    id: "cin-3",
    name: "Beta Cinema Quang Trung",
    address: "645 Quang Trung, P.11, Q. Gò Vấp, TP. Hồ Chí Minh",
    hotline: "1900 638 362",
    amenities: ["Starium", "Dolby Atmos", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-1",
    description: "Rạp chiếu phong cách trẻ trung năng động, thiết kế nghệ thuật rực rỡ, giá vé cực kỳ ưu đãi cho HSSV."
  },
  {
    id: "cin-4",
    name: "Galaxy Cinema Nguyễn Du",
    address: "116 Nguyễn Du, P. Bến Thành, Quận 1, TP. Hồ Chí Minh",
    hotline: "1900 2224",
    amenities: ["IMAX Laser", "Starium", "Dolby Atmos", "Sweetbox"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-1",
    description: "Địa điểm quen thuộc tại trung tâm Sài Gòn, nhiều suất chiếu muộn và màn chiếu siêu sáng Starium."
  },
  {
    id: "cin-5",
    name: "BHD Star Vincom Thảo Điền",
    address: "Tầng 5 Vincom Mega Mall Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
    hotline: "1900 2099",
    amenities: ["Gold Class", "Dolby Atmos", "Sweetbox", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-1",
    description: "Không gian sang trọng chuẩn First Class, ghế bọc nhung êm ái và sảnh chờ tách biệt đẳng cấp."
  },
  {
    id: "cin-6",
    name: "CGV Vincom Plaza Đà Nẵng",
    address: "Tầng 4 Vincom Plaza, 910A Ngô Quyền, Sơn Trà, Đà Nẵng",
    hotline: "1900 6017",
    amenities: ["4DX", "Sweetbox", "Dolby Atmos", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-3",
    description: "Cụm rạp lớn nhất miền Trung với phòng chiếu Sweetbox lãng mạn và màn chiếu cong hiện đại bậc nhất."
  },
  {
    id: "cin-7",
    name: "Lotte Cinema Ninh Kiều Cần Thơ",
    address: "Tầng 3 Lotte Mart Cần Thơ, 84 Mậu Thân, An Hòa, Cần Thơ",
    hotline: "1900 5454 36",
    amenities: ["Dolby Atmos", "Sweetbox", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-4",
    description: "Rạp chiếu quốc tế lớn nhất Tây Đô với không gian rộng rãi, trang thiết bị nhập khẩu từ Hàn Quốc."
  },
  {
    id: "cin-8",
    name: "CGV Vincom Plaza Imperia Hải Phòng",
    address: "Tầng 4 Vincom Plaza Imperia, Khu đô thị Vinhomes Imperia, Hồng Bàng, Hải Phòng",
    hotline: "1900 6017",
    amenities: ["Dolby Atmos", "Sweetbox", "Gold Class", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-5",
    description: "Cụm rạp hiện đại bậc nhất thành phố Cảng với hệ thống âm thanh vòm Dolby Atmos và ghế đôi Sweetbox."
  },
  {
    id: "cin-9",
    name: "Beta Cinema Thanh Xuân",
    address: "Tầng hầm B1 Golden West, Số 2 Lê Văn Thiêm, Thanh Xuân, Hà Nội",
    hotline: "1900 638 362",
    amenities: ["Dolby Atmos", "Starium", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-2",
    description: "Điểm hẹn điện ảnh trẻ trung khu vực Thanh Xuân với giá vé HSSV siêu mềm, bắp rang thơm ngon."
  },
  {
    id: "cin-10",
    name: "Lotte Cinema Hải Châu",
    address: "Tầng 5 Lotte Mart Đà Nẵng, 06 Nại Nam, Hòa Cường Bắc, Hải Châu, Đà Nẵng",
    hotline: "1900 5454 36",
    amenities: ["4DX", "Dolby Atmos", "Bãi đỗ xe"],
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    banner: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
    cityId: "city-3",
    description: "Rạp chiếu trung tâm quận Hải Châu với nhiều khung giờ linh hoạt từ sáng sớm tới đêm muộn."
  }
];

export const INITIAL_ROOMS = [
  {
    id: "room-1",
    cinemaId: "cin-1",
    name: "Phòng 1 (Standard 2D)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12 },
      { row: "G", count: 12 },
      { row: "H", count: 12, vip: true },
      { row: "I", count: 12, vip: true }
    ]
  },
  {
    id: "room-2",
    cinemaId: "cin-1",
    name: "Phòng 2 (IMAX Laser)",
    seatLayout: [
      { row: "A", count: 14 },
      { row: "B", count: 14 },
      { row: "C", count: 14 },
      { row: "D", count: 14 },
      { row: "E", count: 14 },
      { row: "F", count: 14 },
      { row: "G", count: 14, vip: true },
      { row: "H", count: 14, vip: true }
    ]
  },
  {
    id: "room-3",
    cinemaId: "cin-2",
    name: "Phòng 1 (Gold Class VIP)",
    seatLayout: [
      { row: "A", count: 10 },
      { row: "B", count: 10 },
      { row: "C", count: 10 },
      { row: "D", count: 10 },
      { row: "E", count: 10, vip: true }
    ]
  },
  {
    id: "room-4",
    cinemaId: "cin-3",
    name: "Phòng 1 (Standard)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12 },
      { row: "G", count: 12 },
      { row: "H", count: 12, vip: true }
    ]
  },
  {
    id: "room-5",
    cinemaId: "cin-4",
    name: "Phòng 1 (Dolby Atmos)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12 },
      { row: "G", count: 12, vip: true },
      { row: "H", count: 12, vip: true }
    ]
  },
  {
    id: "room-6",
    cinemaId: "cin-6",
    name: "Phòng 1 (ScreenX 270°)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12, vip: true },
      { row: "G", count: 12, vip: true }
    ]
  },
  {
    id: "room-5a",
    cinemaId: "cin-5",
    name: "Phòng 1 (First Class VIP)",
    seatLayout: [
      { row: "A", count: 10 },
      { row: "B", count: 10 },
      { row: "C", count: 10 },
      { row: "D", count: 10, vip: true },
      { row: "E", count: 10, vip: true }
    ]
  },
  {
    id: "room-7",
    cinemaId: "cin-7",
    name: "Phòng 1 (Standard 2D Laser)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12, vip: true },
      { row: "G", count: 12, vip: true }
    ]
  },
  {
    id: "room-4b",
    cinemaId: "cin-3",
    name: "Phòng 2 (Starium 2D)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12, vip: true },
      { row: "G", count: 12, vip: true }
    ]
  },
  {
    id: "room-5b",
    cinemaId: "cin-4",
    name: "Phòng 2 (IMAX Laser)",
    seatLayout: [
      { row: "A", count: 14 },
      { row: "B", count: 14 },
      { row: "C", count: 14 },
      { row: "D", count: 14 },
      { row: "E", count: 14 },
      { row: "F", count: 14 },
      { row: "G", count: 14, vip: true },
      { row: "H", count: 14, vip: true }
    ]
  },
  {
    id: "room-6b",
    cinemaId: "cin-6",
    name: "Phòng 2 (Standard 2D)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12, vip: true },
      { row: "G", count: 12, vip: true }
    ]
  },
  {
    id: "room-8",
    cinemaId: "cin-8",
    name: "Phòng 1 (Dolby Atmos 2D)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12 },
      { row: "G", count: 12, vip: true },
      { row: "H", count: 12, vip: true }
    ]
  },
  {
    id: "room-8b",
    cinemaId: "cin-8",
    name: "Phòng 2 (Sweetbox & VIP)",
    seatLayout: [
      { row: "A", count: 10 },
      { row: "B", count: 10 },
      { row: "C", count: 10 },
      { row: "D", count: 10 },
      { row: "E", count: 10, vip: true },
      { row: "F", count: 10, vip: true }
    ]
  },
  {
    id: "room-9",
    cinemaId: "cin-9",
    name: "Phòng 1 (Beta Youth 2D)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12 },
      { row: "G", count: 12, vip: true },
      { row: "H", count: 12, vip: true }
    ]
  },
  {
    id: "room-10",
    cinemaId: "cin-10",
    name: "Phòng 1 (4DX & Dolby)",
    seatLayout: [
      { row: "A", count: 12 },
      { row: "B", count: 12 },
      { row: "C", count: 12 },
      { row: "D", count: 12 },
      { row: "E", count: 12 },
      { row: "F", count: 12, vip: true },
      { row: "G", count: 12, vip: true }
    ]
  }
];

export const INITIAL_FILMS = [
  {
    id: "film-1",
    title: "Avatar: The Way of Water",
    otherTitles: ["Avatar 2", "Dòng Chảy Của Nước"],
    categoryIds: ["cat-2", "cat-1"],
    actors: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
    directors: ["James Cameron"],
    rating: 8.8,
    releaseDate: "2026-08-20",
    duration: 192,
    ageRating: "T13",
    trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    format: "3D, IMAX Laser, 2D",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Jake Sully và Neytiri cùng các con khám phá các rạn san hô kỳ vĩ trên Pandora và chiến đấu quả cảm để bảo vệ gia đình trước cuộc xâm lăng của loài người.",
    status: "Đang chiếu"
  },
  {
    id: "film-2",
    title: "Dune: Part Two",
    otherTitles: ["Hành Tinh Cát: Phần Hai"],
    categoryIds: ["cat-2", "cat-1", "cat-4"],
    actors: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler"],
    directors: ["Denis Villeneuve"],
    rating: 9.1,
    releaseDate: "2026-08-25",
    duration: 166,
    ageRating: "T16",
    trailer: "https://www.youtube.com/embed/Way9Dexny3w",
    thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    format: "IMAX Laser, 2D Digital",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Paul Atreides hợp lực cùng Chani và tộc người Fremen thực hiện cuộc trả thù chống lại những kẻ đã hủy diệt gia tộc mình, quyết định vận mệnh của toàn vũ trụ.",
    status: "Đang chiếu"
  },
  {
    id: "film-3",
    title: "Deadpool & Wolverine",
    otherTitles: ["Deadpool Và Wolverine"],
    categoryIds: ["cat-1", "cat-6", "cat-2"],
    actors: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"],
    directors: ["Shawn Levy"],
    rating: 8.9,
    releaseDate: "2026-08-15",
    duration: 128,
    ageRating: "T18",
    trailer: "https://www.youtube.com/embed/73_1biulkYk",
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
    format: "2D, IMAX 3D, 4DX",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Deadpool buộc phải tái xuất giang hồ và tìm kiếm sự hỗ trợ từ một Wolverine đang suy sụp để bảo vệ dòng thời gian và vũ trụ của mình.",
    status: "Đang chiếu"
  },
  {
    id: "film-4",
    title: "Spider-Man: Across the Spider-Verse",
    otherTitles: ["Người Nhện: Du Hành Vũ Trụ Nhện"],
    categoryIds: ["cat-5", "cat-1", "cat-2"],
    actors: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    directors: ["Joaquim Dos Santos", "Kemp Powers"],
    rating: 9.2,
    releaseDate: "2026-09-01",
    duration: 140,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/cqGjhVJWtEg",
    thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
    format: "2D Lồng tiếng, 2D Phụ đề",
    language: "Tiếng Anh / Lồng tiếng Việt",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Miles Morales phóng qua đa vũ trụ, chạm trán với một Quân đoàn Người Nhện chịu trách nhiệm bảo vệ sự tồn vong của các thực tại song song.",
    status: "Đang chiếu"
  },
  {
    id: "film-5",
    title: "Lật Mặt 7: Một Điều Ước",
    otherTitles: ["Face Off 7: One Wish"],
    categoryIds: ["cat-7", "cat-4", "cat-6"],
    actors: ["Thanh Hiền", "Trương Minh Cường", "Đinh Y Nhung", "Quách Ngọc Tuyên"],
    directors: ["Lý Hải"],
    rating: 9.3,
    releaseDate: "2026-08-10",
    duration: 138,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/yV4J46r93j8",
    thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    format: "2D Digital",
    language: "Tiếng Việt",
    subtitles: "Phụ đề Tiếng Anh",
    description: "Bộ phim cảm động về tình mẫu tử thiêng liêng của bà Hai và năm người con, chạm đến trái tim của hàng triệu khán giả Việt với thông điệp sum vầy gia đình.",
    status: "Đang chiếu"
  },
  {
    id: "film-6",
    title: "Mai (Trấn Thành)",
    otherTitles: ["Mai - A Story of Love & Healing"],
    categoryIds: ["cat-4", "cat-7"],
    actors: ["Phương Anh Đào", "Tuấn Trần", "Hồng Đào", "Trấn Thành"],
    directors: ["Trấn Thành"],
    rating: 9.0,
    releaseDate: "2026-08-05",
    duration: 131,
    ageRating: "T18",
    trailer: "https://www.youtube.com/embed/3aGZk_sE3bA",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
    format: "2D Digital",
    language: "Tiếng Việt",
    subtitles: "Phụ đề Tiếng Anh",
    description: "Câu chuyện tình yêu đầy trắc trở giữa Mai - một phụ nữ làm nghề massage trị liệu chịu nhiều định kiến, và Dương - chàng nhạc công lãng tử trẻ tuổi.",
    status: "Đang chiếu"
  },
  {
    id: "film-7",
    title: "Oppenheimer",
    otherTitles: ["Cha Đẻ Bom Nguyên Tử"],
    categoryIds: ["cat-4", "cat-1"],
    actors: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    directors: ["Christopher Nolan"],
    rating: 9.3,
    releaseDate: "2026-08-01",
    duration: 180,
    ageRating: "T18",
    trailer: "https://www.youtube.com/embed/uYPbbksJxIg",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    format: "IMAX Laser, 2D Digital",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Thiên sử thi về nhà vật lý học lý thuyết J. Robert Oppenheimer, người lãnh đạo dự án Manhattan chế tạo vũ khí hạt nhân làm thay đổi lịch sử nhân loại.",
    status: "Đang chiếu"
  },
  {
    id: "film-8",
    title: "Inside Out 2",
    otherTitles: ["Những Mảnh Ghép Cảm Xúc 2"],
    categoryIds: ["cat-5", "cat-6", "cat-7"],
    actors: ["Amy Poehler", "Maya Hawke", "Kensington Tallman"],
    directors: ["Kelsey Mann"],
    rating: 8.9,
    releaseDate: "2026-09-02",
    duration: 96,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/LEjhY15eCx0",
    thumbnail: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
    format: "2D Lồng tiếng, 3D",
    language: "Tiếng Anh / Lồng tiếng Việt",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Bộ chỉ huy tâm trí của cô bé Riley bỗng xáo trộn dữ dội khi bước vào tuổi dậy thì với sự xuất hiện bất ngờ của những cảm xúc mới: Lo Âu, Ganh Tị, Xấu Hổ và Chán Nản.",
    status: "Đang chiếu"
  },
  {
    id: "film-9",
    title: "Godzilla x Kong: The New Empire",
    otherTitles: ["Godzilla Và Kong: Đế Chế Mới"],
    categoryIds: ["cat-1", "cat-2"],
    actors: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens"],
    directors: ["Adam Wingard"],
    rating: 8.5,
    releaseDate: "2026-09-15",
    duration: 115,
    ageRating: "T13",
    trailer: "https://www.youtube.com/embed/lV1OOlGwExM",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    format: "3D, IMAX, 4DX",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Hai đại quái thú huyền thoại Godzilla và Kong phải gạt bỏ hiềm khích để cùng hợp lực chống lại một mối đe dọa khổng lồ ẩn sâu trong Trái Đất Rỗng.",
    status: "Sắp chiếu"
  },
  {
    id: "film-10",
    title: "Exhuma: Quật Mộ Trùng Ma",
    otherTitles: ["Quật Mộ Trùng Ma - Bí Ẩn Mộ Cổ"],
    categoryIds: ["cat-3", "cat-4"],
    actors: ["Choi Min-sik", "Kim Go-eun", "Lee Do-hyun", "Yoo Hae-jin"],
    directors: ["Jang Jae-hyun"],
    rating: 8.7,
    releaseDate: "2026-09-18",
    duration: 134,
    ageRating: "T18",
    trailer: "https://www.youtube.com/embed/wXU3q8d1b1k",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    format: "2D Digital",
    language: "Tiếng Hàn",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Bộ đôi pháp sư và thầy phong thủy nhận lời khai quật một ngôi mộ cổ kỳ quái trên đỉnh núi hoang vu, vô tình giải thoát một thế lực ma quỷ tàn độc.",
    status: "Sắp chiếu"
  },
  {
    id: "film-11",
    title: "Detective Conan: The Million-dollar Pentagram",
    otherTitles: ["Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh 1 Triệu Đô"],
    categoryIds: ["cat-5", "cat-1", "cat-3"],
    actors: ["Minami Takayama", "Wakana Yamazaki", "Rikiya Koyama"],
    directors: ["Chika Nagaoka"],
    rating: 9.0,
    releaseDate: "2026-09-22",
    duration: 110,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/8vB1C9Xf0-g",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    format: "2D Lồng tiếng, 2D Phụ đề",
    language: "Tiếng Nhật / Lồng tiếng Việt",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Cuộc đối đầu kịch tính giữa Siêu đạo chích Kid và Kiếm sĩ Hattori Heiji tại Hakodate xoay quanh thanh kiếm Nhật cổ cất giấu kho báu triệu đô thời Edo.",
    status: "Sắp chiếu"
  },
  {
    id: "film-12",
    title: "The Wild Robot",
    otherTitles: ["Robot Hoang Dã"],
    categoryIds: ["cat-5", "cat-7", "cat-2"],
    actors: ["Lupita Nyong'o", "Pedro Pascal", "Kit Connor", "Bill Nighy"],
    directors: ["Chris Sanders"],
    rating: 9.4,
    releaseDate: "2026-09-25",
    duration: 102,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/67vbA5ZJdKQ",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    format: "2D Lồng tiếng, 3D",
    language: "Tiếng Anh / Lồng tiếng Việt",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Tác phẩm hoạt hình cảm động nhất năm của DreamWorks kể về robot Roz bị đắm tàu dạt vào hòn đảo hoang, học cách hòa nhập và nuôi nấng một chú ngỗng non côi cút.",
    status: "Sắp chiếu"
  },
  {
    id: "film-13",
    title: "A Quiet Place: Day One",
    otherTitles: ["Vùng Đất Câm Lặng: Ngày Một", "Vùng Đất Câm Lặng"],
    categoryIds: ["cat-3", "cat-2", "cat-1"],
    actors: ["Lupita Nyong'o", "Joseph Quinn", "Djimon Hounsou", "Alex Wolff"],
    directors: ["Michael Sarnoski"],
    rating: 8.6,
    releaseDate: "2026-08-28",
    duration: 99,
    ageRating: "T16",
    trailer: "https://www.youtube.com/embed/YPY7J-flzE8",
    thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
    format: "2D Digital, IMAX, Dolby Atmos",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Phần tiền truyện kịch tính đưa khán giả trở lại ngày đầu tiên thành phố New York rơi vào thảm họa sinh vật ngoài hành tinh săn mồi bằng âm thanh.",
    status: "Đang chiếu"
  },
  {
    id: "film-14",
    title: "Kung Fu Panda 4",
    otherTitles: ["Gấu Trúc Kung Fu 4", "Kung Fu Panda"],
    categoryIds: ["cat-5", "cat-6", "cat-1"],
    actors: ["Jack Black", "Awkwafina", "Viola Davis", "Dustin Hoffman"],
    directors: ["Mike Mitchell"],
    rating: 8.7,
    releaseDate: "2026-08-22",
    duration: 94,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/_inKs4eeHiI",
    thumbnail: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80",
    format: "2D Lồng tiếng, 2D Phụ đề, 3D",
    language: "Tiếng Anh / Lồng tiếng Việt",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Thần Long Đại Hiệp Po bước vào hành trình mới tìm kiếm người kế vị tại Thung lũng Bình Yên và đối đầu phù thủy tắc kè hoa đầy mưu mô.",
    status: "Đang chiếu"
  },
  {
    id: "film-15",
    title: "Interstellar (IMAX Re-release)",
    otherTitles: ["Hố Đen Tử Thần", "Interstellar"],
    categoryIds: ["cat-2", "cat-4"],
    actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    directors: ["Christopher Nolan"],
    rating: 9.5,
    releaseDate: "2026-08-18",
    duration: 169,
    ageRating: "T13",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
    thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1200&q=80",
    format: "IMAX Laser, 2D Digital",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Kiệt tác du hành không gian của đạo diễn Christopher Nolan trở lại màn ảnh rộng IMAX: nhóm phi hành gia vượt qua lỗ sâu vũ trụ tìm hành tinh mới cho nhân loại.",
    status: "Đang chiếu"
  },
  {
    id: "film-16",
    title: "Ma Da",
    otherTitles: ["Ma Da: Truyền Thuyết Sông Nước"],
    categoryIds: ["cat-3", "cat-4"],
    actors: ["Việt Hương", "Trung Dân", "Dạ Chúc", "Thành Lộc"],
    directors: ["Nguyễn Hữu Hoàng"],
    rating: 8.2,
    releaseDate: "2026-08-29",
    duration: 95,
    ageRating: "T18",
    trailer: "https://www.youtube.com/embed/yV4J46r93j8",
    thumbnail: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    format: "2D Digital",
    language: "Tiếng Việt",
    subtitles: "Phụ đề Tiếng Anh",
    description: "Phim kinh dị dân gian miền Tây xoay quanh bà Lệ làm nghề vớt xác trên sông, phải đối mặt lời nguyền Ma Da rùng rợn để cứu đứa con gái bé bỏng.",
    status: "Đang chiếu"
  },
  {
    id: "film-17",
    title: "Transformers One",
    otherTitles: ["Transformers Một", "Nguồn Gốc Cybertron"],
    categoryIds: ["cat-5", "cat-1", "cat-2"],
    actors: ["Chris Hemsworth", "Brian Tyree Henry", "Scarlett Johansson", "Keegan-Michael Key"],
    directors: ["Josh Cooley"],
    rating: 8.8,
    releaseDate: "2026-09-27",
    duration: 104,
    ageRating: "P",
    trailer: "https://www.youtube.com/embed/u2NuUWuwNJ4",
    thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    format: "2D Lồng tiếng, 3D, IMAX",
    language: "Tiếng Anh / Lồng tiếng Việt",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Câu chuyện chưa từng kể về thời trẻ của Optimus Prime và Megatron khi cả hai vẫn là những người anh em sát cánh trên hành tinh Cybertron.",
    status: "Sắp chiếu"
  },
  {
    id: "film-18",
    title: "Venom: The Last Dance",
    otherTitles: ["Venom 3", "Venom: Kèo Cuối"],
    categoryIds: ["cat-1", "cat-2", "cat-6"],
    actors: ["Tom Hardy", "Chiwetel Ejiofor", "Juno Temple", "Rhys Ifans"],
    directors: ["Kelly Marcel"],
    rating: 8.4,
    releaseDate: "2026-10-02",
    duration: 109,
    ageRating: "T16",
    trailer: "https://www.youtube.com/embed/__2bjWbetsA",
    thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=600&q=80",
    posterUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    format: "2D, IMAX 3D, 4DX",
    language: "Tiếng Anh",
    subtitles: "Phụ đề Tiếng Việt",
    description: "Eddie Brock và Venom bước vào cuộc chạy trốn sinh tử cuối cùng khi bị cả lực lượng quân đội lẫn thế lực symbiote hùng mạnh ngoài vũ trụ truy sát.",
    status: "Sắp chiếu"
  }
];

export const INITIAL_USERS = [
  {
    id: "usr-admin-01",
    fullName: "Quản trị viên Movix",
    username: "admin",
    email: "admin@movix.vn",
    phone: "0988888888",
    role: "admin",
    password: "123",
    status: "active",
    point: 9999,
    tier: "Quản trị viên"
  },
  {
    id: "usr-1",
    fullName: "Nguyễn Toàn Thắng",
    username: "thangnguyen",
    email: "thangnguyen13725@gmail.com",
    phone: "0987654321",
    role: "customer",
    password: "123",
    status: "active",
    point: 450,
    tier: "Thành viên"
  },
  {
    id: "usr-2",
    fullName: "Lê Phương Thảo",
    username: "thaole",
    email: "thaole@gmail.com",
    phone: "0901112233",
    role: "customer",
    password: "123",
    status: "active",
    point: 220,
    tier: "Thành viên"
  },
  {
    id: "usr-3",
    fullName: "Trần Minh Anh",
    username: "minhanh",
    email: "minhanh@gmail.com",
    phone: "0933445566",
    role: "customer",
    password: "123",
    status: "active",
    point: 80,
    tier: "Thành viên"
  },
  {
    id: "usr-staff-01",
    fullName: "Nguyễn Văn Nhân Viên",
    username: "nhanvien",
    email: "nhanvien@movix.vn",
    phone: "0911223344",
    role: "employee",
    password: "123",
    status: "active",
    point: 100,
    tier: "Nhân viên"
  },
  {
    id: "usr-locked-01",
    fullName: "Tài Khoản Bị Khóa",
    username: "taikhoankhoa",
    email: "khoa@movix.vn",
    phone: "0999888777",
    role: "customer",
    password: "123",
    status: "Tạm khóa",
    point: 0,
    tier: "Thành viên"
  },
  {
    id: "usr-4",
    fullName: "Phạm Hoàng Nam",
    username: "nampham",
    email: "nampham@gmail.com",
    phone: "0912345678",
    role: "customer",
    password: "123",
    status: "active",
    point: 360,
    tier: "Thành viên"
  },
  {
    id: "usr-5",
    fullName: "Đỗ Khánh Linh",
    username: "linhdo",
    email: "linhdo@gmail.com",
    phone: "0977889900",
    role: "customer",
    password: "123",
    status: "active",
    point: 510,
    tier: "Thành viên"
  },
  {
    id: "usr-6",
    fullName: "Vũ Đức Hải",
    username: "haivu",
    email: "haivu@gmail.com",
    phone: "0966554433",
    role: "customer",
    password: "123",
    status: "active",
    point: 150,
    tier: "Thành viên"
  },
  {
    id: "usr-staff-02",
    fullName: "Trần Thị Thu Hà",
    username: "nhanvien2",
    email: "thuha@movix.vn",
    phone: "0922334455",
    role: "employee",
    password: "123",
    status: "active",
    point: 120,
    tier: "Nhân viên"
  }
];

export const INITIAL_COMBOFOODS = [
  {
    id: "cb-1",
    name: "Combo Solo Bắp Bơ (L) + 1 Coca",
    image: "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&w=600&q=80",
    price: 79000,
    description: "1 bắp lớn vị bơ thơm lừng chuẩn rạp kèm 1 cốc Coca-Cola 32oz mát lạnh sảng khoái.",
    status: "active"
  },
  {
    id: "cb-2",
    name: "Combo Đôi Bạn Thân (Couple Box)",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80",
    price: 119000,
    description: "1 xô bắp khổng lồ mix 2 vị (Phô mai + Caramel) + 2 ly nước ngọt lớn + 1 gói snack khoai tây.",
    status: "active"
  },
  {
    id: "cb-3",
    name: "Bắp Lắc Phô Mai Hảo Hạng (M)",
    image: "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=600&q=80",
    price: 59000,
    description: "Bắp rang bơ lắc bột phô mai Cheddar béo ngậy, hạt nở tròn đều, thơm nức mũi.",
    status: "active"
  },
  {
    id: "cb-4",
    name: "Snack Nachos Sốt Phô Mai Nóng",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
    price: 65000,
    description: "Bánh ngô nướng Nachos Mexico giòn tan chấm cùng sốt phô mai tan chảy và sốt cà salsa cay nhẹ.",
    status: "active"
  },
  {
    id: "cb-5",
    name: "Combo Bình Nước Độc Quyền Phim",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    price: 159000,
    description: "1 Bình nước lưu niệm phiên bản giới hạn khắc laser logo bom tấn + 1 bắp ngọt lớn.",
    status: "active"
  },
  {
    id: "cb-6",
    name: "Combo Gia Đình 4 Người (Family Party)",
    image: "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&w=600&q=80",
    price: 199000,
    description: "2 xô bắp lớn (Ngọt + Phô mai) + 4 ly nước ngọt cỡ L + 2 gói snack khoai tây giòn tan.",
    status: "active"
  },
  {
    id: "cb-7",
    name: "Combo Trà Sữa Trân Châu & Khoai Tây",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
    price: 95000,
    description: "1 ly trà sữa trân châu đường đen size L + 1 phần khoai tây chiên lắc rong biển nóng hổi.",
    status: "active"
  },
  {
    id: "cb-8",
    name: "Combo Healthy Nước Ép & Bắp Ngọt (M)",
    image: "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=600&q=80",
    price: 85000,
    description: "1 chai nước ép cam tươi nguyên chất không đường + 1 bắp rang bơ ít đường size M.",
    status: "active"
  }
];

export const INITIAL_PROMOTIONS = [
  {
    id: "pr-1",
    code: "MOVIX50",
    title: "Thứ 4 Vui Vẻ - Giảm 50% Vé Xem Phim",
    description: "Giảm 50% vé xem phim (tối đa 50.000đ) cho khách hàng mới và suất chiếu giữa tuần",
    discountPercent: 50,
    maxDiscount: 50000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 2000,
    usedCount: 285,
    status: "Đang hoạt động",
    category: "Vé xem phim",
    filmTitle: "Tất cả phim",
    bannerUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pr-2",
    code: "CHAOMOI",
    title: "Chào Bạn Mới - Tặng Ngay 30K",
    description: "Giảm trực tiếp 30.000đ cho đơn đặt vé đầu tiên trên nền tảng Movix",
    discountPercent: 30,
    maxDiscount: 30000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 3000,
    usedCount: 512,
    status: "Đang hoạt động",
    category: "Thành viên",
    filmTitle: "Tất cả phim",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pr-3",
    code: "CINEVIP",
    title: "Trải Nghiệm Đỉnh Cao IMAX Laser & VIP",
    description: "Ưu đãi giảm 30.000đ cho phòng chiếu chuẩn IMAX Laser, 3D và ScreenX",
    discountPercent: 25,
    maxDiscount: 30000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 1500,
    usedCount: 420,
    status: "Đang hoạt động",
    category: "Vé xem phim",
    filmTitle: "Avatar, Dune và phim IMAX",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pr-4",
    code: "HSSV20",
    title: "Đồng Giá Vé Học Sinh - Sinh Viên",
    description: "Đồng giá vé hoặc giảm 20% (tối đa 40.000đ) cho học sinh, sinh viên toàn quốc",
    discountPercent: 20,
    maxDiscount: 40000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 5000,
    usedCount: 1640,
    status: "Đang hoạt động",
    category: "Thành viên",
    filmTitle: "Tất cả phim",
    bannerUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pr-5",
    code: "WEEKENDPOP",
    title: "Tiệc Bắp Nước Cuối Tuần",
    description: "Giảm 15% (tối đa 25.000đ) khi đặt vé kèm các Combo Bắp Nước thứ Bảy & Chủ Nhật",
    discountPercent: 15,
    maxDiscount: 25000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 1000,
    usedCount: 195,
    status: "Đang hoạt động",
    category: "Combo Bắp Nước",
    filmTitle: "Tất cả phim",
    bannerUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pr-6",
    code: "VIP20",
    title: "Khách Hàng Thân Thiết VIP",
    description: "Giảm 20% tối đa 35.000đ cho mọi đơn đặt vé tại tất cả các rạp liên kết",
    discountPercent: 20,
    maxDiscount: 35000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 2500,
    usedCount: 860,
    status: "Đang hoạt động",
    category: "Thành viên",
    filmTitle: "Tất cả phim",
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pr-7",
    code: "MOMO15",
    title: "Thanh Toán MoMo - Giảm Liền 15K",
    description: "Giảm 15% (tối đa 15.000đ) khi thanh toán trực tuyến qua Ví điện tử MoMo",
    discountPercent: 15,
    maxDiscount: 15000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 3000,
    usedCount: 650,
    status: "Đang hoạt động",
    category: "Ví điện tử & Ngân hàng",
    filmTitle: "Tất cả phim",
    bannerUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
  }
];

export const INITIAL_BANNERS = [
  {
    id: "bn-1",
    title: "THỨ 4 VUI VẺ - ĐỒNG GIÁ 55.000Đ",
    tagline: "ĐẠI TIỆC ĐIỆN ẢNH GIỮA TUẦN",
    description: "Giảm đến 50% vé xem phim tại mọi cụm rạp đối tác CGV, BHD, Lotte, Beta trên toàn quốc.",
    promoCode: "MOVIX50",
    badge: "SIÊU ƯU ĐÃI",
    badgeColor: "var(--red-500)",
    bgGradient: "linear-gradient(135deg, #7f1d1d, #1e1b4b)",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Nhận mã ngay",
    actionType: "promo"
  },
  {
    id: "bn-2",
    title: "CHÀO BẠN MỚI - TẶNG NGAY 30.000Đ",
    tagline: "ƯU ĐÃI ĐẶT VÉ ĐẦU TIÊN",
    description: "Nhập mã CHAOMOI khi thanh toán để được giảm ngay 30.000đ trên tổng hóa đơn đặt vé.",
    promoCode: "CHAOMOI",
    badge: "MỚI NHẤT",
    badgeColor: "var(--brand-600)",
    bgGradient: "linear-gradient(135deg, #1e1b4b, #312e81)",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Lấy voucher 30K",
    actionType: "promo"
  },
  {
    id: "bn-3",
    title: "TRẢI NGHIỆM ĐỈNH CAO IMAX LASER & SCREENX",
    tagline: "ÂM THANH VÒM DOLBY ATMOS & MÀN HÌNH KHỔNG LỒ",
    description: "Giảm ngay 30.000đ với mã CINEVIP khi trải nghiệm các phòng chiếu đặc biệt chuẩn quốc tế.",
    promoCode: "CINEVIP",
    badge: "VIP EXPERIENCE",
    badgeColor: "#d97706",
    bgGradient: "linear-gradient(135deg, #451a03, #18181b)",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Khám phá phòng chiếu VIP",
    actionType: "promo"
  },
  {
    id: "bn-4",
    title: "COMBO BẮP NƯỚC GIẢM 15% CUỐI TUẦN",
    tagline: "VỊ BẮP CARAMEL THƠM LỪNG & PEPSI MÁT LẠNH",
    description: "Áp dụng mã WEEKENDPOP để tận hưởng trọn vẹn từng khoảnh khắc phim ảnh với combo bắp nước siêu tiết kiệm.",
    promoCode: "WEEKENDPOP",
    badge: "COMBO HOT",
    badgeColor: "#059669",
    bgGradient: "linear-gradient(135deg, #064e3b, #111827)",
    imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Chọn bắp nước",
    actionType: "promo"
  }
];

export function getTodayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayFormattedVN(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getRecentTimestamp(offsetDays = 0, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const d0 = getTodayStr(0); // Hôm nay
const d1 = getTodayStr(1); // Ngày mai (+1 ngày)
const d2 = getTodayStr(2); // Ngày kia (+2 ngày)
const d3 = getTodayStr(3); // +3 ngày
const d4 = getTodayStr(4); // +4 ngày
const d5 = getTodayStr(5); // +5 ngày (Cuối tuần)
const d6 = getTodayStr(6); // +6 ngày (Cuối tuần)
const d7 = getTodayStr(7); // +7 ngày (Trọn 1 tuần tới)

export const INITIAL_SHOWTIMES = [
  // NGÀY HÔM NAY (d0)
  // CGV Bà Triệu (cin-1, Hà Nội)
  {
    id: "st-1",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "10:15",
    date: d0,
    basePrice: 90000,
    seatsBooked: ["B3", "B4", "B9", "E4", "E5", "E6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-2",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "14:00",
    date: d0,
    basePrice: 125000,
    seatsBooked: ["C5", "C6", "H7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-3",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "19:30",
    date: d0,
    basePrice: 135000,
    seatsBooked: ["G5", "G6", "H5", "H6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-4",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "11:30",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["D4", "D5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-5",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "16:45",
    date: d0,
    basePrice: 130000,
    seatsBooked: ["F5", "F6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-13",
    filmId: "film-7",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "21:15",
    date: d0,
    basePrice: 130000,
    seatsBooked: ["E7", "E8"],
    status: "Đang hoạt động"
  },
  {
    id: "st-15",
    filmId: "film-9",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "20:15",
    date: d0,
    basePrice: 140000,
    seatsBooked: ["F7", "F8"],
    status: "Đang hoạt động"
  },
  {
    id: "st-16",
    filmId: "film-10",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "18:00",
    date: d0,
    basePrice: 100000,
    seatsBooked: ["D6", "D7"],
    status: "Đang hoạt động"
  },

  //Lotte Cinema Landmark 72 (cin-2, Hà Nội)
  {
    id: "st-6",
    filmId: "film-3",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "10:30",
    date: d0,
    basePrice: 110000,
    seatsBooked: ["A1", "A2"],
    status: "Đang hoạt động"
  },
  {
    id: "st-7",
    filmId: "film-3",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "18:00",
    date: d0,
    basePrice: 120000,
    seatsBooked: ["C3", "C4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-17",
    filmId: "film-5",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "14:15",
    date: d0,
    basePrice: 110000,
    seatsBooked: ["D4", "D5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-18",
    filmId: "film-10",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "20:30",
    date: d0,
    basePrice: 130000,
    seatsBooked: ["B3", "B4"],
    status: "Đang hoạt động"
  },

  // Beta Cinema Quang Trung (cin-3, TP.HCM)
  {
    id: "st-8",
    filmId: "film-4",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "09:30",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["B5", "B6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-9",
    filmId: "film-4",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "15:00",
    date: d0,
    basePrice: 80000,
    seatsBooked: ["F5", "F6", "G7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-14",
    filmId: "film-8",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "11:00",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["C3", "C4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-19",
    filmId: "film-11",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "17:15",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["E3", "E4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-20",
    filmId: "film-12",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "19:45",
    date: d0,
    basePrice: 80000,
    seatsBooked: ["D5", "D6"],
    status: "Đang hoạt động"
  },

  // --- Galaxy Cinema Nguyễn Du (cin-4, TP.HCM) ---
  {
    id: "st-10",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "14:15",
    date: d0,
    basePrice: 85000,
    seatsBooked: ["D5", "D6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-11",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "20:00",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["G5", "G6", "H6", "H7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-12",
    filmId: "film-6",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "17:30",
    date: d0,
    basePrice: 90000,
    seatsBooked: ["A5", "A6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-21",
    filmId: "film-2",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "10:45",
    date: d0,
    basePrice: 85000,
    seatsBooked: ["C5"],
    status: "Đang hoạt động"
  },

  // BHD Star Vincom Thảo Điền (cin-5, TP.HCM)
  {
    id: "st-22",
    filmId: "film-1",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "13:30",
    date: d0,
    basePrice: 115000,
    seatsBooked: ["B3", "B4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-23",
    filmId: "film-3",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "16:15",
    date: d0,
    basePrice: 110000,
    seatsBooked: ["C3", "C4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-24",
    filmId: "film-9",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "19:00",
    date: d0,
    basePrice: 120000,
    seatsBooked: ["D4", "D5"],
    status: "Đang hoạt động"
  },

  // CGV Vincom Đà Nẵng (cin-6, Đà Nẵng)
  {
    id: "st-25",
    filmId: "film-1",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "10:30",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["B1", "B2"],
    status: "Đang hoạt động"
  },
  {
    id: "st-26",
    filmId: "film-2",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "15:45",
    date: d0,
    basePrice: 100000,
    seatsBooked: ["C6", "C7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-27",
    filmId: "film-6",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "19:15",
    date: d0,
    basePrice: 100000,
    seatsBooked: ["E5", "E6"],
    status: "Đang hoạt động"
  },

  // Lotte Cinema Cần Thơ (cin-7, Cần Thơ)
  {
    id: "st-28",
    filmId: "film-5",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "11:00",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["D2", "D3"],
    status: "Đang hoạt động"
  },
  {
    id: "st-29",
    filmId: "film-4",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "16:30",
    date: d0,
    basePrice: 80000,
    seatsBooked: ["F4", "F5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-30",
    filmId: "film-8",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "20:00",
    date: d0,
    basePrice: 80000,
    seatsBooked: ["C4", "C5"],
    status: "Đang hoạt động"
  },

  // NGÀY MAI (d1)
  {
    id: "st-31",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "10:15",
    date: d1,
    basePrice: 135000,
    seatsBooked: ["D3", "D4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-32",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "14:30",
    date: d1,
    basePrice: 135000,
    seatsBooked: ["E5", "E6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-33",
    filmId: "film-4",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "11:00",
    date: d1,
    basePrice: 75000,
    seatsBooked: ["C1", "C2"],
    status: "Đang hoạt động"
  },
  {
    id: "st-34",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "19:00",
    date: d1,
    basePrice: 90000,
    seatsBooked: ["B4", "B5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-35",
    filmId: "film-11",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "15:30",
    date: d1,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-36",
    filmId: "film-12",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "18:00",
    date: d1,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-44",
    filmId: "film-3",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "16:30",
    date: d1,
    basePrice: 120000,
    seatsBooked: ["A3", "A4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-45",
    filmId: "film-6",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "19:30",
    date: d1,
    basePrice: 100000,
    seatsBooked: ["D5", "D6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-46",
    filmId: "film-8",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "14:00",
    date: d1,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-47",
    filmId: "film-9",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "21:00",
    date: d1,
    basePrice: 140000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // NGÀY KIA (d2)
  // =========================================================================
  {
    id: "st-37",
    filmId: "film-3",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "13:30",
    date: d2,
    basePrice: 115000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-38",
    filmId: "film-7",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "20:15",
    date: d2,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-39",
    filmId: "film-8",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "10:00",
    date: d2,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-40",
    filmId: "film-10",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "16:00",
    date: d2,
    basePrice: 120000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-41",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "20:00",
    date: d2,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-48",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "15:00",
    date: d2,
    basePrice: 135000,
    seatsBooked: ["C3", "C4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-49",
    filmId: "film-2",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "19:15",
    date: d2,
    basePrice: 120000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-50",
    filmId: "film-6",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "18:00",
    date: d2,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-51",
    filmId: "film-4",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "16:45",
    date: d2,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // NGÀY 3 KẾ TIẾP (d3)
  // =========================================================================
  {
    id: "st-42",
    filmId: "film-2",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "18:30",
    date: d3,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-43",
    filmId: "film-9",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "20:00",
    date: d3,
    basePrice: 140000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-52",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "11:15",
    date: d3,
    basePrice: 90000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-53",
    filmId: "film-3",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "15:00",
    date: d3,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-54",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "17:45",
    date: d3,
    basePrice: 90000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-55",
    filmId: "film-12",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "14:15",
    date: d3,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-56",
    filmId: "film-11",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "19:30",
    date: d3,
    basePrice: 115000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-57",
    filmId: "film-8",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "18:00",
    date: d3,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // NGÀY 4 KẾ TIẾP (d4)
  // =========================================================================
  {
    id: "st-58",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "14:00",
    date: d4,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-59",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "17:30",
    date: d4,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-60",
    filmId: "film-3",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "19:00",
    date: d4,
    basePrice: 120000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-61",
    filmId: "film-4",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "13:30",
    date: d4,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-62",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "20:15",
    date: d4,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-63",
    filmId: "film-6",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "16:00",
    date: d4,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-64",
    filmId: "film-7",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "19:45",
    date: d4,
    basePrice: 125000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-65",
    filmId: "film-10",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "15:30",
    date: d4,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // NGÀY 5 KẾ TIẾP (d5 - CUỐI TUẦN SÔI ĐỘNG)
  // =========================================================================
  {
    id: "st-66",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "09:30",
    date: d5,
    basePrice: 135000,
    seatsBooked: ["A1", "A2"],
    status: "Đang hoạt động"
  },
  {
    id: "st-67",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "19:15",
    date: d5,
    basePrice: 145000,
    seatsBooked: ["G5", "G6", "H6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-68",
    filmId: "film-2",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "14:30",
    date: d5,
    basePrice: 125000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-69",
    filmId: "film-3",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "16:45",
    date: d5,
    basePrice: 100000,
    seatsBooked: ["E4", "E5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-70",
    filmId: "film-5",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "18:00",
    date: d5,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-71",
    filmId: "film-8",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "10:30",
    date: d5,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-72",
    filmId: "film-9",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "20:00",
    date: d5,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-73",
    filmId: "film-12",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "13:30",
    date: d5,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // NGÀY 6 KẾ TIẾP (d6 - CUỐI TUẦN BLOCKBUSTER)
  // =========================================================================
  {
    id: "st-74",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "10:00",
    date: d6,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-75",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "20:30",
    date: d6,
    basePrice: 145000,
    seatsBooked: ["F5", "F6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-76",
    filmId: "film-1",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "15:15",
    date: d6,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-77",
    filmId: "film-4",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "14:00",
    date: d6,
    basePrice: 115000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-78",
    filmId: "film-6",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "19:00",
    date: d6,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-79",
    filmId: "film-7",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "18:30",
    date: d6,
    basePrice: 125000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-80",
    filmId: "film-10",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "11:00",
    date: d6,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-81",
    filmId: "film-11",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "17:15",
    date: d6,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // NGÀY 7 KẾ TIẾP (d7 - TRỌN VẸN 1 TUẦN TỚI)
  // =========================================================================
  {
    id: "st-82",
    filmId: "film-1",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "14:15",
    date: d7,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-83",
    filmId: "film-2",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "19:45",
    date: d7,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-84",
    filmId: "film-3",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "16:00",
    date: d7,
    basePrice: 115000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-85",
    filmId: "film-5",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "18:30",
    date: d7,
    basePrice: 90000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-86",
    filmId: "film-6",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "15:00",
    date: d7,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-87",
    filmId: "film-8",
    cinemaId: "cin-3",
    roomId: "room-4",
    startTime: "10:30",
    date: d7,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-88",
    filmId: "film-9",
    cinemaId: "cin-6",
    roomId: "room-6",
    startTime: "20:15",
    date: d7,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-89",
    filmId: "film-12",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "16:15",
    date: d7,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // =========================================================================
  // BỔ SUNG LỊCH CHIẾU PHONG PHÚ ĐỦ 5 TỈNH THÀNH & PHIM MỚI (d0 - d7)
  // =========================================================================
  // Hôm nay (d0) - Spider-Man đa thành phố, phim mới (film-13..film-16) & rạp Hải Phòng, Thanh Xuân, Hải Châu
  {
    id: "st-90",
    filmId: "film-4",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "13:15",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["C4", "C5", "D7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-91",
    filmId: "film-4",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "18:45",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["B4", "B5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-92",
    filmId: "film-4",
    cinemaId: "cin-6",
    roomId: "room-6b",
    startTime: "20:00",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["E5", "E6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-93",
    filmId: "film-4",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "19:30",
    date: d0,
    basePrice: 90000,
    seatsBooked: ["D4", "D5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-94",
    filmId: "film-13",
    cinemaId: "cin-4",
    roomId: "room-5b",
    startTime: "21:30",
    date: d0,
    basePrice: 125000,
    seatsBooked: ["E6", "E7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-95",
    filmId: "film-13",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "22:00",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["F4", "F5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-96",
    filmId: "film-14",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "10:30",
    date: d0,
    basePrice: 80000,
    seatsBooked: ["C3", "C4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-97",
    filmId: "film-14",
    cinemaId: "cin-3",
    roomId: "room-4b",
    startTime: "14:30",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["D3", "D4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-98",
    filmId: "film-14",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "16:15",
    date: d0,
    basePrice: 75000,
    seatsBooked: ["E4", "E5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-99",
    filmId: "film-15",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "22:15",
    date: d0,
    basePrice: 140000,
    seatsBooked: ["G7", "G8", "H7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-100",
    filmId: "film-15",
    cinemaId: "cin-4",
    roomId: "room-5b",
    startTime: "19:15",
    date: d0,
    basePrice: 135000,
    seatsBooked: ["F5", "F6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-101",
    filmId: "film-16",
    cinemaId: "cin-8",
    roomId: "room-8b",
    startTime: "21:15",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["C2", "C3"],
    status: "Đang hoạt động"
  },
  {
    id: "st-102",
    filmId: "film-16",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "20:45",
    date: d0,
    basePrice: 90000,
    seatsBooked: ["D5", "D6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-103",
    filmId: "film-2",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "17:00",
    date: d0,
    basePrice: 95000,
    seatsBooked: ["E3", "E4"],
    status: "Đang hoạt động"
  },
  {
    id: "st-104",
    filmId: "film-5",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "18:15",
    date: d0,
    basePrice: 85000,
    seatsBooked: ["B6", "B7"],
    status: "Đang hoạt động"
  },

  // Ngày mai (d1)
  {
    id: "st-105",
    filmId: "film-4",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "15:00",
    date: d1,
    basePrice: 95000,
    seatsBooked: ["D4", "D5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-106",
    filmId: "film-4",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "19:15",
    date: d1,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-107",
    filmId: "film-13",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "20:00",
    date: d1,
    basePrice: 120000,
    seatsBooked: ["C2", "C3"],
    status: "Đang hoạt động"
  },
  {
    id: "st-108",
    filmId: "film-14",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "09:45",
    date: d1,
    basePrice: 80000,
    seatsBooked: ["B4", "B5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-109",
    filmId: "film-15",
    cinemaId: "cin-4",
    roomId: "room-5b",
    startTime: "16:30",
    date: d1,
    basePrice: 135000,
    seatsBooked: ["G5", "G6"],
    status: "Đang hoạt động"
  },
  {
    id: "st-110",
    filmId: "film-16",
    cinemaId: "cin-3",
    roomId: "room-4b",
    startTime: "21:45",
    date: d1,
    basePrice: 80000,
    seatsBooked: ["E6", "E7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-111",
    filmId: "film-7",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "19:30",
    date: d1,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-112",
    filmId: "film-1",
    cinemaId: "cin-8",
    roomId: "room-8b",
    startTime: "18:30",
    date: d1,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // Ngày kia (d2)
  {
    id: "st-113",
    filmId: "film-13",
    cinemaId: "cin-5",
    roomId: "room-5a",
    startTime: "21:00",
    date: d2,
    basePrice: 120000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-114",
    filmId: "film-14",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "10:15",
    date: d2,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-115",
    filmId: "film-15",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "19:45",
    date: d2,
    basePrice: 140000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-116",
    filmId: "film-16",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "21:30",
    date: d2,
    basePrice: 90000,
    seatsBooked: ["D4", "D5"],
    status: "Đang hoạt động"
  },
  {
    id: "st-117",
    filmId: "film-4",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "15:15",
    date: d2,
    basePrice: 90000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-118",
    filmId: "film-2",
    cinemaId: "cin-8",
    roomId: "room-8b",
    startTime: "19:00",
    date: d2,
    basePrice: 110000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // d3
  {
    id: "st-119",
    filmId: "film-13",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "21:15",
    date: d3,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-120",
    filmId: "film-14",
    cinemaId: "cin-6",
    roomId: "room-6b",
    startTime: "13:45",
    date: d3,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-121",
    filmId: "film-15",
    cinemaId: "cin-4",
    roomId: "room-5b",
    startTime: "20:00",
    date: d3,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-122",
    filmId: "film-16",
    cinemaId: "cin-7",
    roomId: "room-7",
    startTime: "21:30",
    date: d3,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-123",
    filmId: "film-4",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "16:30",
    date: d3,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // d4
  {
    id: "st-124",
    filmId: "film-13",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "20:30",
    date: d4,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-125",
    filmId: "film-14",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "14:00",
    date: d4,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-126",
    filmId: "film-15",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "19:30",
    date: d4,
    basePrice: 140000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-127",
    filmId: "film-16",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "21:45",
    date: d4,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-128",
    filmId: "film-17",
    cinemaId: "cin-3",
    roomId: "room-4b",
    startTime: "17:30",
    date: d4,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // d5 (Cuối tuần)
  {
    id: "st-129",
    filmId: "film-4",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "11:15",
    date: d5,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-130",
    filmId: "film-13",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "21:45",
    date: d5,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-131",
    filmId: "film-14",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "10:00",
    date: d5,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-132",
    filmId: "film-15",
    cinemaId: "cin-4",
    roomId: "room-5b",
    startTime: "19:00",
    date: d5,
    basePrice: 145000,
    seatsBooked: ["F6", "F7"],
    status: "Đang hoạt động"
  },
  {
    id: "st-133",
    filmId: "film-16",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "21:30",
    date: d5,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-134",
    filmId: "film-18",
    cinemaId: "cin-2",
    roomId: "room-3",
    startTime: "20:15",
    date: d5,
    basePrice: 130000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // d6 (Cuối tuần)
  {
    id: "st-135",
    filmId: "film-4",
    cinemaId: "cin-8",
    roomId: "room-8",
    startTime: "14:30",
    date: d6,
    basePrice: 90000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-136",
    filmId: "film-13",
    cinemaId: "cin-4",
    roomId: "room-5",
    startTime: "21:30",
    date: d6,
    basePrice: 100000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-137",
    filmId: "film-14",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "09:30",
    date: d6,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-138",
    filmId: "film-15",
    cinemaId: "cin-1",
    roomId: "room-2",
    startTime: "16:30",
    date: d6,
    basePrice: 145000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-139",
    filmId: "film-16",
    cinemaId: "cin-3",
    roomId: "room-4b",
    startTime: "22:00",
    date: d6,
    basePrice: 85000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-140",
    filmId: "film-17",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "15:45",
    date: d6,
    basePrice: 90000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },

  // d7
  {
    id: "st-141",
    filmId: "film-4",
    cinemaId: "cin-1",
    roomId: "room-1",
    startTime: "13:30",
    date: d7,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-142",
    filmId: "film-13",
    cinemaId: "cin-8",
    roomId: "room-8b",
    startTime: "20:30",
    date: d7,
    basePrice: 105000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-143",
    filmId: "film-14",
    cinemaId: "cin-3",
    roomId: "room-4b",
    startTime: "11:00",
    date: d7,
    basePrice: 75000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-144",
    filmId: "film-15",
    cinemaId: "cin-4",
    roomId: "room-5b",
    startTime: "19:30",
    date: d7,
    basePrice: 135000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-145",
    filmId: "film-16",
    cinemaId: "cin-9",
    roomId: "room-9",
    startTime: "21:15",
    date: d7,
    basePrice: 80000,
    seatsBooked: [],
    status: "Đang hoạt động"
  },
  {
    id: "st-146",
    filmId: "film-18",
    cinemaId: "cin-10",
    roomId: "room-10",
    startTime: "19:00",
    date: d7,
    basePrice: 95000,
    seatsBooked: [],
    status: "Đang hoạt động"
  }
];

export const INITIAL_COMMENTS = [
  {
    id: "cm-1",
    userId: "usr-1",
    userName: "Nguyễn Toàn Thắng",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    filmId: "film-1",
    filmTitle: "Avatar: The Way of Water",
    rate: 5,
    content: "Kỹ xảo 3D trên màn hình IMAX Laser chân thực đến từng bọt nước! Âm thanh đại dương bao la sống động tuyệt đối. Đặt vé trên Movix cực nhanh.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: "2026-09-02T10:15:00Z"
  },
  {
    id: "cm-2",
    userId: "usr-2",
    userName: "Lê Phương Thảo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    filmId: "film-2",
    filmTitle: "Dune: Part Two",
    rate: 5,
    content: "Đỉnh cao điện ảnh sci-fi thế kỷ 21! Nhạc nền Hans Zimmer rung chuyển cả rạp, diễn xuất Timothée quá xuất thần.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: "2026-08-30T16:20:00Z"
  },
  {
    id: "cm-3",
    userId: "usr-3",
    userName: "Trần Minh Anh",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    filmId: "film-5",
    filmTitle: "Lật Mặt 7: Một Điều Ước",
    rate: 5,
    content: "Phim lấy đi nhiều nước mắt nhất từ đầu năm đến giờ. Diễn xuất của Má Hai quá chân thực, xem xong chỉ muốn bắt chuyến xe về nhà ngay với mẹ.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: "2026-09-03T20:05:00Z"
  },
  {
    id: "cm-4",
    userId: "usr-2",
    userName: "Lê Phương Thảo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    filmId: "film-4",
    filmTitle: "Spider-Man: Across the Spider-Verse",
    rate: 5,
    content: "Mỗi khung hình là một kiệt tác nghệ thuật đồ họa! Nhịp phim dồn dập, sáng tạo vượt qua mọi giới hạn phim hoạt hình.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: "2026-09-03T21:40:00Z"
  },
  {
    id: "cm-5",
    userId: "usr-locked-01",
    userName: "spambot_warning",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    filmId: "film-3",
    filmTitle: "Deadpool & Wolverine",
    rate: 1,
    content: "Đây là nội dung thử nghiệm tính năng báo cáo vi phạm và kiểm duyệt bình luận của quản trị viên.",
    report: true,
    reportedBy: "mod_inspector",
    reportReason: "Bình luận thử nghiệm tính năng kiểm duyệt bình luận (UC18).",
    createdAt: "2026-09-03T11:45:00Z"
  },
  {
    id: "cm-6",
    userId: "usr-4",
    userName: "Phạm Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    filmId: "film-7",
    filmTitle: "Oppenheimer",
    rate: 5,
    content: "Một tác phẩm lịch sử tiểu sử đầy ám ảnh và căng thẳng đến nghẹt thở. Cillian Murphy quá xứng đáng tượng vàng Oscar.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-3, 21, 10)
  },
  {
    id: "cm-7",
    userId: "usr-5",
    userName: "Đỗ Khánh Linh",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    filmId: "film-6",
    filmTitle: "Mai (Trấn Thành)",
    rate: 5,
    content: "Diễn xuất tinh tế của Phương Anh Đào khiến mình rưng rưng suốt nửa cuối phim. Góc quay và ánh sáng cực kỳ điện ảnh.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-2, 22, 0)
  },
  {
    id: "cm-8",
    userId: "usr-5",
    userName: "Đỗ Khánh Linh",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    filmId: "film-13",
    filmTitle: "A Quiet Place: Day One",
    rate: 4,
    content: "Không khí ngột ngạt từng giây, cả rạp im phăng phắc không dám thở mạnh luôn. Xem rạp Dolby Atmos cực phê!",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-1, 20, 45)
  },
  {
    id: "cm-9",
    userId: "usr-6",
    userName: "Vũ Đức Hải",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    filmId: "film-14",
    filmTitle: "Kung Fu Panda 4",
    rate: 5,
    content: "Hài hước, duyên dáng từ đầu đến cuối, cả nhà mình đi xem ai cũng cười nghiêng ngả. Bản lồng tiếng rất tự nhiên.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-1, 15, 20)
  },
  {
    id: "cm-10",
    userId: "usr-1",
    userName: "Nguyễn Toàn Thắng",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    filmId: "film-15",
    filmTitle: "Interstellar (IMAX Re-release)",
    rate: 5,
    content: "Xem lại Interstellar trên màn hình IMAX Laser thực sự nổi da gà ở phân cảnh cập bến tàu quay và hành tinh sóng thần!",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-2, 23, 15)
  },
  {
    id: "cm-11",
    userId: "usr-4",
    userName: "Phạm Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    filmId: "film-15",
    filmTitle: "Interstellar (IMAX Re-release)",
    rate: 5,
    content: "Âm nhạc No Time For Caution của Hans Zimmer vang lên trong phòng IMAX xứng đáng 10/10.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-1, 19, 30)
  },
  {
    id: "cm-12",
    userId: "usr-6",
    userName: "Vũ Đức Hải",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    filmId: "film-16",
    filmTitle: "Ma Da",
    rate: 4,
    content: "Bối cảnh sông nước miền Tây ma mị chân thật, cô Việt Hương nhập vai cực kỳ xúc động.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-1, 22, 10)
  },
  {
    id: "cm-13",
    userId: "usr-2",
    userName: "Lê Phương Thảo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    filmId: "film-8",
    filmTitle: "Inside Out 2",
    rate: 5,
    content: "Nhân vật Lo Âu cực kỳ đồng cảm với người trẻ hiện đại. Hoạt hình Pixar chưa bao giờ làm mình thất vọng!",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(-1, 14, 50)
  },
  {
    id: "cm-14",
    userId: "usr-3",
    userName: "Trần Minh Anh",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    filmId: "film-12",
    filmTitle: "The Wild Robot",
    rate: 5,
    content: "Tác phẩm hoạt hình ấm áp nhất năm, âm nhạc và hình ảnh đẹp như một bức tranh sơn dầu.",
    report: false,
    reportedBy: null,
    reportReason: null,
    createdAt: getRecentTimestamp(0, 8, 40)
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ord-1",
    ticketCode: "MVX-92813",
    userId: "usr-1",
    userName: "Nguyễn Toàn Thắng",
    phone: "0987654321",
    filmId: "film-1",
    filmTitle: "Avatar: The Way of Water",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-1",
    cinemaName: "CGV Vincom Center Bà Triệu",
    roomName: "Phòng 2 (IMAX Laser)",
    city: "Hà Nội",
    showtimeDate: "04/09/2026",
    showtimeTime: "19:30",
    seats: [
      { seatKey: "G5", type: "vip", unitPrice: 135000 },
      { seatKey: "G6", type: "vip", unitPrice: 135000 }
    ],
    comboFoods: [
      { comboId: "cb-1", name: "Combo Solo Bắp Bơ (L) + 1 Coca", quantity: 1, price: 79000 }
    ],
    seatSubtotal: 270000,
    comboSubtotal: 79000,
    promotionCode: "CINEVIP",
    discountAmount: 30000,
    totalAmount: 319000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-92813",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    createdAt: "2026-09-04T01:15:00Z"
  },
  {
    id: "ord-2",
    ticketCode: "MVX-64019",
    userId: "usr-2",
    userName: "Lê Phương Thảo",
    phone: "0901112233",
    filmId: "film-2",
    filmTitle: "Dune: Part Two",
    posterUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-1",
    cinemaName: "CGV Vincom Center Bà Triệu",
    roomName: "Phòng 2 (IMAX Laser)",
    city: "Hà Nội",
    showtimeDate: "04/09/2026",
    showtimeTime: "16:45",
    seats: [
      { seatKey: "F5", type: "standard", unitPrice: 120000 },
      { seatKey: "F6", type: "standard", unitPrice: 120000 }
    ],
    comboFoods: [
      { comboId: "cb-2", name: "Combo Đôi Bạn Thân (Couple Box)", quantity: 1, price: 119000 }
    ],
    seatSubtotal: 240000,
    comboSubtotal: 119000,
    promotionCode: "MOVIX50",
    discountAmount: 50000,
    totalAmount: 309000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-64019",
    paymentMethod: "VietQR",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    createdAt: "2026-09-03T18:40:00Z"
  },
  {
    id: "ord-3",
    ticketCode: "MVX-11204",
    userId: "usr-3",
    userName: "Trần Minh Anh",
    phone: "0933445566",
    filmId: "film-5",
    filmTitle: "Lật Mặt 7: Một Điều Ước",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-4",
    cinemaName: "Galaxy Cinema Nguyễn Du",
    roomName: "Phòng 1 (Dolby Atmos)",
    city: "TP. Hồ Chí Minh",
    showtimeDate: "04/09/2026",
    showtimeTime: "20:00",
    seats: [
      { seatKey: "G5", type: "standard", unitPrice: 85000 },
      { seatKey: "G6", type: "standard", unitPrice: 85000 }
    ],
    comboFoods: [
      { comboId: "cb-3", name: "Bắp Lắc Phô Mai Hảo Hạng (M)", quantity: 1, price: 59000 }
    ],
    seatSubtotal: 170000,
    comboSubtotal: 59000,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 229000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-11204",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: "2026-09-03T09:10:00Z"
  },
  {
    id: "ord-4",
    ticketCode: "MVX-77410",
    userId: "usr-1",
    userName: "Nguyễn Toàn Thắng",
    phone: "0987654321",
    filmId: "film-2",
    filmTitle: "Dune: Part Two",
    posterUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-1",
    cinemaName: "CGV Vincom Center Bà Triệu",
    roomName: "Phòng 2 (IMAX Laser)",
    city: "Hà Nội",
    showtimeDate: d1,
    showtimeTime: "19:00",
    seats: [
      { seatKey: "E5", type: "standard", unitPrice: 120000 },
      { seatKey: "E6", type: "standard", unitPrice: 120000 }
    ],
    comboFoods: [
      { comboId: "cb-1", name: "Combo Solo Bắp Bơ (L) + 1 Coca", quantity: 1, price: 79000 }
    ],
    seatSubtotal: 240000,
    comboSubtotal: 79000,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 319000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-77410",
    paymentMethod: "Thanh toán tại quầy",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: getRecentTimestamp(0, 9, 30)
  },
  {
    id: "ord-5",
    ticketCode: "MVX-88320",
    userId: "usr-2",
    userName: "Lê Phương Thảo",
    phone: "0901112233",
    filmId: "film-4",
    filmTitle: "Spider-Man: Across the Spider-Verse",
    posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-4",
    cinemaName: "Galaxy Cinema Nguyễn Du",
    roomName: "Phòng 1 (Dolby Atmos)",
    city: "TP. Hồ Chí Minh",
    showtimeDate: d1,
    showtimeTime: "20:15",
    seats: [
      { seatKey: "F7", type: "standard", unitPrice: 95000 }
    ],
    comboFoods: [],
    seatSubtotal: 95000,
    comboSubtotal: 0,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 95000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-88320",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    createdAt: getRecentTimestamp(0, 10, 15)
  },
  {
    id: "ord-6",
    ticketCode: "MVX-55102",
    userId: "usr-4",
    userName: "Phạm Hoàng Nam",
    phone: "0912345678",
    filmId: "film-7",
    filmTitle: "Oppenheimer",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-9",
    cinemaName: "Beta Cinema Thanh Xuân",
    roomName: "Phòng 1 (Beta Youth 2D)",
    city: "Hà Nội",
    showtimeDate: getTodayStr(-2),
    showtimeTime: "19:30",
    seats: [
      { seatKey: "E5", type: "standard", unitPrice: 80000 },
      { seatKey: "E6", type: "standard", unitPrice: 80000 }
    ],
    comboFoods: [
      { comboId: "cb-1", name: "Combo Solo Bắp Bơ (L) + 1 Coca", quantity: 1, price: 79000 }
    ],
    seatSubtotal: 160000,
    comboSubtotal: 79000,
    promotionCode: "HSSV20",
    discountAmount: 32000,
    totalAmount: 207000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-55102",
    paymentMethod: "VietQR",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-3, 18, 20)
  },
  {
    id: "ord-7",
    ticketCode: "MVX-44918",
    userId: "usr-5",
    userName: "Đỗ Khánh Linh",
    phone: "0977889900",
    filmId: "film-6",
    filmTitle: "Mai (Trấn Thành)",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-3",
    cinemaName: "Beta Cinema Quang Trung",
    roomName: "Phòng 1 (Standard)",
    city: "TP. Hồ Chí Minh",
    showtimeDate: getTodayStr(-1),
    showtimeTime: "19:00",
    seats: [
      { seatKey: "D4", type: "standard", unitPrice: 80000 },
      { seatKey: "D5", type: "standard", unitPrice: 80000 }
    ],
    comboFoods: [
      { comboId: "cb-7", name: "Combo Trà Sữa Trân Châu & Khoai Tây", quantity: 1, price: 95000 }
    ],
    seatSubtotal: 160000,
    comboSubtotal: 95000,
    promotionCode: "MOMO15",
    discountAmount: 15000,
    totalAmount: 240000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-44918",
    paymentMethod: "MoMo",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-2, 16, 40)
  },
  {
    id: "ord-8",
    ticketCode: "MVX-33821",
    userId: "usr-5",
    userName: "Đỗ Khánh Linh",
    phone: "0977889900",
    filmId: "film-13",
    filmTitle: "A Quiet Place: Day One",
    posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-4",
    cinemaName: "Galaxy Cinema Nguyễn Du",
    roomName: "Phòng 2 (IMAX Laser)",
    city: "TP. Hồ Chí Minh",
    showtimeDate: d0,
    showtimeTime: "21:30",
    seats: [
      { seatKey: "E6", type: "standard", unitPrice: 125000 },
      { seatKey: "E7", type: "standard", unitPrice: 125000 }
    ],
    comboFoods: [
      { comboId: "cb-2", name: "Combo Đôi Bạn Thân (Couple Box)", quantity: 1, price: 119000 }
    ],
    seatSubtotal: 250000,
    comboSubtotal: 119000,
    promotionCode: "VIP20",
    discountAmount: 35000,
    totalAmount: 334000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-33821",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    createdAt: getRecentTimestamp(0, 8, 50)
  },
  {
    id: "ord-9",
    ticketCode: "MVX-22790",
    userId: "usr-6",
    userName: "Vũ Đức Hải",
    phone: "0966554433",
    filmId: "film-14",
    filmTitle: "Kung Fu Panda 4",
    posterUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-8",
    cinemaName: "CGV Vincom Plaza Imperia Hải Phòng",
    roomName: "Phòng 1 (Dolby Atmos 2D)",
    city: "Hải Phòng",
    showtimeDate: d1,
    showtimeTime: "09:45",
    seats: [
      { seatKey: "B4", type: "standard", unitPrice: 80000 },
      { seatKey: "B5", type: "standard", unitPrice: 80000 },
      { seatKey: "B6", type: "standard", unitPrice: 80000 }
    ],
    comboFoods: [
      { comboId: "cb-6", name: "Combo Gia Đình 4 Người (Family Party)", quantity: 1, price: 199000 }
    ],
    seatSubtotal: 240000,
    comboSubtotal: 199000,
    promotionCode: "CHAOMOI",
    discountAmount: 30000,
    totalAmount: 409000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-22790",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    createdAt: getRecentTimestamp(0, 11, 5)
  },
  {
    id: "ord-10",
    ticketCode: "MVX-19405",
    userId: "usr-1",
    userName: "Nguyễn Toàn Thắng",
    phone: "0987654321",
    filmId: "film-15",
    filmTitle: "Interstellar (IMAX Re-release)",
    posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-1",
    cinemaName: "CGV Vincom Center Bà Triệu",
    roomName: "Phòng 2 (IMAX Laser)",
    city: "Hà Nội",
    showtimeDate: getTodayStr(-2),
    showtimeTime: "20:00",
    seats: [
      { seatKey: "G7", type: "vip", unitPrice: 140000 },
      { seatKey: "G8", type: "vip", unitPrice: 140000 }
    ],
    comboFoods: [
      { comboId: "cb-5", name: "Combo Bình Nước Độc Quyền Phim", quantity: 1, price: 159000 }
    ],
    seatSubtotal: 280000,
    comboSubtotal: 159000,
    promotionCode: "CINEVIP",
    discountAmount: 30000,
    totalAmount: 409000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-19405",
    paymentMethod: "VietQR",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-2, 17, 15)
  },
  {
    id: "ord-11",
    ticketCode: "MVX-60812",
    userId: "usr-6",
    userName: "Vũ Đức Hải",
    phone: "0966554433",
    filmId: "film-11",
    filmTitle: "Detective Conan: The Million-dollar Pentagram",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-8",
    cinemaName: "CGV Vincom Plaza Imperia Hải Phòng",
    roomName: "Phòng 1 (Dolby Atmos 2D)",
    city: "Hải Phòng",
    showtimeDate: d2,
    showtimeTime: "21:30",
    seats: [
      { seatKey: "D4", type: "standard", unitPrice: 90000 },
      { seatKey: "D5", type: "standard", unitPrice: 90000 }
    ],
    comboFoods: [
      { comboId: "cb-4", name: "Snack Nachos Sốt Phô Mai Nóng", quantity: 1, price: 65000 }
    ],
    seatSubtotal: 180000,
    comboSubtotal: 65000,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 245000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-60812",
    paymentMethod: "Thanh toán tại quầy",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: getRecentTimestamp(0, 12, 10)
  },
  {
    id: "ord-12",
    ticketCode: "MVX-90531",
    userId: "usr-4",
    userName: "Phạm Hoàng Nam",
    phone: "0912345678",
    filmId: "film-3",
    filmTitle: "Deadpool & Wolverine",
    posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-2",
    cinemaName: "Lotte Cinema Landmark 72",
    roomName: "Phòng 1 (Gold Class VIP)",
    city: "Hà Nội",
    showtimeDate: d0,
    showtimeTime: "18:00",
    seats: [
      { seatKey: "C5", type: "standard", unitPrice: 120000 }
    ],
    comboFoods: [],
    seatSubtotal: 120000,
    comboSubtotal: 0,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 120000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-90531",
    paymentMethod: "PayOS",
    paymentStatus: "refunded",
    orderStatus: "cancelled",
    createdAt: getRecentTimestamp(-1, 10, 0)
  },
  {
    id: "ord-13",
    ticketCode: "MVX-73104",
    userId: "usr-4",
    userName: "Phạm Hoàng Nam",
    phone: "0912345678",
    filmId: "film-15",
    filmTitle: "Interstellar (IMAX Re-release)",
    posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-1",
    cinemaName: "CGV Vincom Center Bà Triệu",
    roomName: "Phòng 2 (IMAX Laser)",
    city: "Hà Nội",
    showtimeDate: getTodayStr(-2),
    showtimeTime: "16:30",
    seats: [
      { seatKey: "F7", type: "vip", unitPrice: 140000 },
      { seatKey: "F8", type: "vip", unitPrice: 140000 }
    ],
    comboFoods: [],
    seatSubtotal: 280000,
    comboSubtotal: 0,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 280000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-73104",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-2, 14, 15)
  },
  {
    id: "ord-14",
    ticketCode: "MVX-61925",
    userId: "usr-6",
    userName: "Vũ Đức Hải",
    phone: "0966554433",
    filmId: "film-16",
    filmTitle: "Ma Da",
    posterUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-8",
    cinemaName: "CGV Vincom Plaza Imperia Hải Phòng",
    roomName: "Phòng 1 (Dolby Atmos 2D)",
    city: "Hải Phòng",
    showtimeDate: getTodayStr(-2),
    showtimeTime: "20:30",
    seats: [
      { seatKey: "E4", type: "standard", unitPrice: 90000 },
      { seatKey: "E5", type: "standard", unitPrice: 90000 }
    ],
    comboFoods: [],
    seatSubtotal: 180000,
    comboSubtotal: 0,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 180000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-61925",
    paymentMethod: "VietQR",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-2, 18, 0)
  },
  {
    id: "ord-15",
    ticketCode: "MVX-52088",
    userId: "usr-2",
    userName: "Lê Phương Thảo",
    phone: "0901112233",
    filmId: "film-8",
    filmTitle: "Inside Out 2",
    posterUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-4",
    cinemaName: "Galaxy Cinema Nguyễn Du",
    roomName: "Phòng 1 (Dolby Atmos)",
    city: "TP. Hồ Chí Minh",
    showtimeDate: getTodayStr(-1),
    showtimeTime: "11:30",
    seats: [
      { seatKey: "D6", type: "standard", unitPrice: 95000 }
    ],
    comboFoods: [
      { comboId: "cb-1", name: "Combo Solo Bắp Bơ (L) + 1 Coca", quantity: 1, price: 79000 }
    ],
    seatSubtotal: 95000,
    comboSubtotal: 79000,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 174000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-52088",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-1, 10, 20)
  },
  {
    id: "ord-16",
    ticketCode: "MVX-41890",
    userId: "usr-3",
    userName: "Trần Minh Anh",
    phone: "0933445566",
    filmId: "film-12",
    filmTitle: "The Wild Robot",
    posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    cinemaId: "cin-4",
    cinemaName: "Galaxy Cinema Nguyễn Du",
    roomName: "Phòng 1 (Dolby Atmos)",
    city: "TP. Hồ Chí Minh",
    showtimeDate: getTodayStr(-1),
    showtimeTime: "15:15",
    seats: [
      { seatKey: "F4", type: "standard", unitPrice: 90000 },
      { seatKey: "F5", type: "standard", unitPrice: 90000 }
    ],
    comboFoods: [
      { comboId: "cb-3", name: "Bắp Lắc Phô Mai Hảo Hạng (M)", quantity: 1, price: 59000 }
    ],
    seatSubtotal: 180000,
    comboSubtotal: 59000,
    promotionCode: null,
    discountAmount: 0,
    totalAmount: 239000,
    ticketQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MVX-41890",
    paymentMethod: "PayOS",
    paymentStatus: "paid",
    orderStatus: "used",
    createdAt: getRecentTimestamp(-1, 14, 0)
  }
];
