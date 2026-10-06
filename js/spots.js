/**
 * SNU 4 Spots Dataset & Video Configurations
 * 자하연, 잔디광장, 관정도서관, 사회대 16동 라운지
 */

const SNU_SPOTS = [
  {
    id: "jahayeon",
    name: "자하연",
    engName: "Jahayeon Pond",
    tagline: "연못 물결과 푸른 수목, 물소리가 주는 평온함",
    category: "자연 & 힐링",
    badge: "명소 1",
    // 고화질 앰비언트 루프 비디오 (무료 Pexels/CDN 소스 - 연못 물결 및 자연)
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4",
    localVideo: "videos/jahayeon.mp4",
    poster: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80",
    defaultSound: "water",
    description: "인문대와 학생회관 사이에 위치한 서울대학교의 상징적인 연못. 잔잔한 수면과 오리, 수양버들이 어우러져 복잡한 머리를 식히며 사색하기에 가장 좋은 장소입니다.",
    studyTip: "생각이 막히거나 아이디어가 필요할 때, 창밖의 물결을 보며 멍때리기 추천!"
  },
  {
    id: "grass-square",
    name: "잔디광장 (버들골)",
    engName: "Grass Square / Beodeolgol",
    tagline: "탁 트인 하늘과 초록빛 잔디가 선사하는 해방감",
    category: "야외 & 개방감",
    badge: "명소 2",
    // 푸른 잔디와 바람에 흔들리는 나무 앰비언트 비디오
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sun-over-a-green-meadow-41838-large.mp4",
    localVideo: "videos/grass-square.mp4",
    poster: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80",
    defaultSound: "nature",
    description: "관악산 자락을 배경으로 펼쳐진 드넓은 잔디밭. 돗자리를 펴고 태블릿이나 노트북으로 논문과 과제를 읽는 학우들이 즐겨 찾는 여유로운 힐링 스팟입니다.",
    studyTip: "시야가 탁 트인 야외 무드에서 큰 그림을 그리거나 기획안을 작성하기 좋습니다."
  },
  {
    id: "kwanjeong",
    name: "관정도서관",
    engName: "Kwanjeong Library",
    tagline: "정갈한 서가와 학구적인 열기가 가득한 몰입의 전당",
    category: "초집중 & 열람실",
    badge: "명소 3",
    // 도서관 서가 및 서재 앰비언트 비디오
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-books-in-a-library-shelf-42407-large.mp4",
    localVideo: "videos/kwanjeong.mp4",
    poster: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80",
    defaultSound: "library",
    description: "서울대학교 중앙도서관 관정관. 현대적인 인테리어와 수많은 학우들의 열기가 모여 있는 곳. 25분간 한 치의 흐트러짐 없이 몰입하기에 가장 완벽한 환경입니다.",
    studyTip: "아이스 아메리카노 한 잔과 함께 깊은 코딩, 암기, 문제 풀이에 최적화되어 있습니다."
  },
  {
    id: "bldg16-lounge",
    name: "사회대 16동 라운지",
    engName: "Bldg 16 Social Science Lounge",
    tagline: "통창 너머 관악산 뷰와 따뜻한 조명이 감도는 세련된 라운지",
    category: "카페 & 라운지",
    badge: "명소 4",
    // 모던 라운지 / 카페 앰비언트 비디오
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-on-a-wooden-table-in-a-cafe-42526-large.mp4",
    localVideo: "videos/bldg16-lounge.mp4",
    poster: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80",
    defaultSound: "cafe",
    description: "사회과학대학 16동의 탁 트인 통창 라운지. 은은한 커피 향과 채광, 관악산의 사계절 풍경이 한눈에 들어오는 학생들의 숨은 최애 카공 스팟입니다.",
    studyTip: "달콤한 리딸라나 따뜻한 라떼를 곁들여 토론 준비나 에세이 작성에 추천합니다."
  }
];

window.SNU_SPOTS = SNU_SPOTS;
