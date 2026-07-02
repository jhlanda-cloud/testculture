/* ============================================================
   컬처핏 (CultureFit) — 데이터 계층
   ------------------------------------------------------------
   · PRD 5장 기술 제약: 별도 DB 없이 파일 기반 데이터 관리.
     MVP 단계에서는 이 파일이 단일 데이터 소스(single source of
     truth) 역할을 합니다. (향후 .xlsx → 이 구조로 변환/주입)
   · 표현(app.js)과 데이터를 분리해 콘텐츠 추가가 쉽도록 구성.

   translation 필드 (기능8 다국어):
     'source' = 한국어 원문 / 'ok' = 검수 통과·노출
     'review' = 번역 검토 중 → 해당 언어에서 한국어 원문으로 대체 노출
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- 취향 태그 칩 ↔ 이벤트 태그 매핑 (기능1) ---------- */
  var TASTE_TAGS = ["abstract", "sculpture", "popup", "music", "photo"];

  /* ---------- 이벤트(전시·공연) 데이터 ---------- */
  var EVENTS = [
    {
      id: "bangheaja",
      genre: "exhibition",
      region: "seoul",
      price: 15000,
      free: false,
      tags: ["abstract", "painting"],
      dateStart: "2026-06-10",
      dateEnd: "2026-08-31",
      dateDisplay: "2026.06.10 – 08.31",
      cardImage: "image/bangheaja1.jpg",
      images: ["image/bangheaja1.jpg", "image/bangheaja2.jpeg", "image/bangheaja3.jpeg", "image/bangheaja5.jpg"],
      coords: [37.6106, 126.972],
      purchase: [
        { site: "interpark", url: "https://ticket.interpark.com" },
        { site: "melon", url: "https://ticket.melon.com" }
      ],
      translation: { ko: "source", en: "ok", zh: "ok", ja: "ok" },
      reviewScore: 4.8,
      reviewCount: 96,
      reviews: [
        { author: "김***", rating: 5, text: "빛이 스며드는 듯한 그림 앞에서 한참 머물렀어요." },
        { author: "이**", rating: 5, text: "도록도 훌륭합니다. 조용히 감상하기 좋아요." }
      ],
      nearby: [
        { type: "cafe", walkMin: 6, name: "평창동 산책 카페", rating: 4.5 },
        { type: "restaurant", walkMin: 8, name: "부암동 손칼국수", rating: 4.6 },
        { type: "bookstore", walkMin: 10, name: "환기미술관 아트숍", rating: 4.4 }
      ],
      loc: {
        ko: {
          title: "방혜자: 빛의 그림",
          desc: "종이에 스며든 빛의 결, 반세기의 화업을 담은 회고전.",
          descLong: "50여 년간 빛을 그려온 화가 방혜자의 회고전. 한지와 캔버스에 스며든 고요한 빛의 결을 마주하며, 물질과 정신 사이를 오간 화업의 궤적을 따라갑니다.",
          venue: "서울 종로 · 가나아트센터",
          address: "서울 종로구 평창30길 28 · 경복궁역에서 버스 20분",
          hours: "10:00 – 19:00 (월 휴관)"
        },
        en: {
          title: "Bang Hyeja: Paintings of Light",
          desc: "A retrospective of half a century of work — light seeping into paper.",
          venue: "Jongno, Seoul · Gana Art Center",
          hours: "10:00 – 19:00 (Closed Mon)"
        },
        zh: {
          title: "方惠子：光之绘画",
          desc: "光渗入纸张的纹理，一场跨越半世纪创作生涯的回顾展。",
          venue: "首尔钟路 · 佳纳艺术中心",
          hours: "10:00 – 19:00（周一闭馆）"
        },
        ja: {
          title: "パン・ヘジャ：光の絵画",
          desc: "紙に染み込む光の綾、半世紀の画業をたどる回顧展。",
          venue: "ソウル鍾路 · カナアートセンター",
          hours: "10:00 – 19:00（月休館）"
        }
      }
    },

    {
      id: "shinmikyung",
      genre: "exhibition",
      region: "seoul",
      price: 12000,
      free: false,
      tags: ["sculpture", "installation"],
      dateStart: "2026-05-20",
      dateEnd: "2026-09-15",
      dateDisplay: "2026.05.20 – 09.15",
      cardImage: "image/shinmikyung1.jpg",
      images: ["image/shinmikyung3.jpg", "image/shinmikyung1.jpg", "image/shinmikyung4.jpg", "image/shinmikyung5.jpg"],
      coords: [37.5296, 126.9648],
      purchase: [
        { site: "interpark", url: "https://ticket.interpark.com" },
        { site: "melon", url: "https://ticket.melon.com" }
      ],
      /* 기능8 데모: 일본어는 검토 중 → 일본어 선택 시 한국어 원문으로 대체 노출 */
      translation: { ko: "source", en: "ok", zh: "ok", ja: "review" },
      reviewScore: 4.7,
      reviewCount: 128,
      reviews: [
        { author: "지***", rating: 5, text: "비누 향이 공간을 가득 채워서 조각을 ‘맡으며’ 봤어요. 시간이 지나면 사라진다는 설명이 오래 남습니다." },
        { author: "Emily C.", rating: 4, text: "English caption was clear and helpful. The red gallery room was stunning." },
        { author: "민***", rating: 5, text: "주말 오전에 갔더니 한산해서 좋았습니다. 도슨트 시간 맞춰 가면 더 풍부하게 볼 수 있어요." }
      ],
      nearby: [
        { type: "cafe", walkMin: 4, name: "노티드 용산", rating: 4.6 },
        { type: "restaurant", walkMin: 7, name: "한강로 이탈리안", rating: 4.4 },
        { type: "bookstore", walkMin: 6, name: "용산 아트북스", rating: 4.7 }
      ],
      loc: {
        ko: {
          title: "신미경: 번역된 시간",
          desc: "비누로 빚은 고전 조각, 시간과 번역을 사유하는 설치.",
          descLong: "비누라는 덧없는 재료로 고전 조각과 도자기를 다시 빚어내며 ‘원본과 번역’, ‘시간과 소멸’을 묻는 신미경의 대규모 개인전. 향과 형태가 서서히 변해가는 조각들 사이를 거닐며 시간의 결을 감각합니다.",
          venue: "서울 용산 · 아모레퍼시픽미술관",
          address: "서울 용산구 한강대로 100 · 신용산역 4번 출구 도보 3분",
          hours: "10:00 – 18:00 (월 휴관)"
        },
        en: {
          title: "Shin Meekyoung: Translated Time",
          desc: "Classical sculptures cast in soap — an installation on time and translation.",
          descLong: "A major solo show in which Shin Meekyoung recreates classical sculpture and ceramics in soap, questioning ‘original and translation’, ‘time and disappearance’. Walk among works whose scent and form slowly change, and sense the texture of time.",
          venue: "Yongsan, Seoul · Amorepacific Museum of Art",
          address: "100 Hangang-daero, Yongsan-gu, Seoul · 3 min from Sinyongsan Stn Exit 4",
          hours: "10:00 – 18:00 (Closed Mon)"
        },
        zh: {
          title: "申美璟：被翻译的时间",
          desc: "以肥皂塑造的古典雕塑，思索时间与翻译的装置艺术。",
          descLong: "申美璟以肥皂这一易逝的材料重塑古典雕塑与瓷器，叩问“原作与翻译”“时间与消逝”的大型个展。漫步于气味与形态缓缓变化的作品之间，感受时间的纹理。",
          venue: "首尔龙山 · 爱茉莉太平洋美术馆",
          address: "首尔龙山区汉江大路100 · 新龙山站4号出口步行3分钟",
          hours: "10:00 – 18:00（周一闭馆）"
        },
        ja: {
          title: "シン・ミギョン：翻訳された時間",
          desc: "石鹸で象った古典彫刻、時間と翻訳を思索するインスタレーション。",
          venue: "ソウル龍山 · アモーレパシフィック美術館",
          hours: "10:00 – 18:00（月休館）"
        }
      }
    },

    {
      id: "ohbyungwook",
      genre: "exhibition",
      region: "gyeonggi",
      price: 0,
      free: true,
      tags: ["painting", "abstract"],
      dateStart: "2026-06-01",
      dateEnd: "2026-07-20",
      dateDisplay: "2026.06.01 – 07.20",
      cardImage: "image/ohbyungwook1.jpg",
      images: ["image/ohbyungwook1.jpg"],
      coords: [37.792, 126.696],
      purchase: [],
      translation: { ko: "source", en: "ok", zh: "ok", ja: "ok" },
      reviewScore: 4.5,
      reviewCount: 42,
      reviews: [
        { author: "박**", rating: 5, text: "푸른 화면이 마음을 가라앉혀줍니다." },
        { author: "정**", rating: 4, text: "작품 수는 많지 않지만 여운이 길어요." }
      ],
      nearby: [
        { type: "cafe", walkMin: 3, name: "헤이리 북카페", rating: 4.7 },
        { type: "restaurant", walkMin: 9, name: "파주 장어마을", rating: 4.5 },
        { type: "cafe", walkMin: 12, name: "헤이리 정원 카페", rating: 4.4 }
      ],
      loc: {
        ko: {
          title: "오병욱: 침묵의 바다",
          desc: "수평선과 물결만 남긴 화면, 고요를 응시하는 청색 연작.",
          descLong: "수평선과 물결의 최소한만 남긴 화면으로 침묵과 시간을 담아낸 오병욱의 청색 연작. 무료로 열리는 헤이리 기획전.",
          venue: "경기 파주 · 헤이리 예술마을",
          address: "경기 파주시 탄현면 헤이리마을길 · 무료 관람",
          hours: "11:00 – 18:00 (월 휴관)"
        },
        en: {
          title: "Oh Byungwook: Sea of Silence",
          desc: "Only horizon and ripples remain — a blue series gazing into stillness.",
          venue: "Paju, Gyeonggi · Heyri Art Village",
          hours: "11:00 – 18:00 (Closed Mon)"
        },
        zh: {
          title: "吴炳旭：沉默之海",
          desc: "画面只剩地平线与波纹，凝视静谧的蓝色系列。",
          venue: "京畿坡州 · 坡州艺术村",
          hours: "11:00 – 18:00（周一闭馆）"
        },
        ja: {
          title: "オ・ビョンウク：沈黙の海",
          desc: "水平線と波だけを残した画面、静けさを見つめる青の連作。",
          venue: "京畿坡州 · ヘイリ芸術村",
          hours: "11:00 – 18:00（月休館）"
        }
      }
    },

    {
      id: "hunterpopup",
      genre: "popup",
      region: "seoul",
      price: 0,
      free: true,
      freeEntry: true,
      tags: ["popup", "experience"],
      dateStart: "2026-06-25",
      dateEnd: "2026-07-06",
      dateDisplay: "2026.06.25 – 07.06",
      cardImage: "image/popupstore1.jpg",
      images: ["image/popupstore1.jpg", "image/popupstore4.jpg", "image/popupstore2.jpg", "image/popupstore3.jpg"],
      coords: [37.5445, 127.056],
      purchase: [],
      translation: { ko: "source", en: "ok", zh: "ok", ja: "ok" },
      reviewScore: 4.3,
      reviewCount: 210,
      reviews: [
        { author: "유**", rating: 4, text: "포토존이 예뻐서 사진 많이 찍었어요." },
        { author: "S. Lee", rating: 5, text: "Cute pop-up, loved the boots display!" }
      ],
      nearby: [
        { type: "cafe", walkMin: 5, name: "성수 대림창고", rating: 4.5 },
        { type: "restaurant", walkMin: 8, name: "성수동 수제버거", rating: 4.4 },
        { type: "cafe", walkMin: 6, name: "어니언 성수", rating: 4.7 }
      ],
      loc: {
        ko: {
          title: "HUNTER 팝업 스토어",
          desc: "영국 헤리티지 부츠 브랜드의 여름 팝업, 포토존과 체험 공간.",
          descLong: "영국 헤리티지 부츠 브랜드 HUNTER의 여름 팝업. 시즌 컬렉션 전시와 포토존, 커스터마이징 체험을 무료로 즐길 수 있습니다.",
          venue: "서울 성수 · 팝업 스페이스",
          address: "서울 성동구 성수이로 · 뚝섬역 도보 8분 · 무료 입장",
          hours: "12:00 – 20:00"
        },
        en: {
          title: "HUNTER Pop-up Store",
          desc: "A summer pop-up from the British heritage boots brand — photo zones and experiences.",
          venue: "Seongsu, Seoul · Pop-up Space",
          hours: "12:00 – 20:00"
        },
        zh: {
          title: "HUNTER 快闪店",
          desc: "英国传统靴履品牌的夏季快闪，设有拍照区与体验空间。",
          venue: "首尔圣水 · 快闪空间",
          hours: "12:00 – 20:00"
        },
        ja: {
          title: "HUNTER ポップアップストア",
          desc: "英国ヘリテージブーツブランドの夏ポップアップ。フォトゾーンと体験空間。",
          venue: "ソウル聖水 · ポップアップスペース",
          hours: "12:00 – 20:00"
        }
      }
    },

    {
      id: "silentdisco",
      genre: "performance",
      region: "seoul",
      price: 33000,
      free: false,
      tags: ["music", "experience"],
      dateStart: "2026-07-12",
      dateEnd: "2026-07-12",
      dateDisplay: "2026.07.12 20:00",
      cardImage: "image/silentdisco1.jpg",
      images: ["image/silentdisco1.jpg"],
      coords: [37.5343, 126.9946],
      purchase: [
        { site: "interpark", url: "https://ticket.interpark.com" },
        { site: "melon", url: "https://ticket.melon.com" }
      ],
      translation: { ko: "source", en: "ok", zh: "ok", ja: "ok" },
      reviewScore: 4.6,
      reviewCount: 74,
      reviews: [
        { author: "한**", rating: 5, text: "헤드폰 끼고 춤추니 색다른 경험이었어요!" },
        { author: "조**", rating: 4, text: "채널 세 개를 골라 듣는 재미가 있어요." }
      ],
      nearby: [
        { type: "restaurant", walkMin: 4, name: "이태원 타코", rating: 4.5 },
        { type: "cafe", walkMin: 6, name: "경리단 루프탑 바", rating: 4.6 },
        { type: "restaurant", walkMin: 9, name: "해방촌 파스타", rating: 4.4 }
      ],
      loc: {
        ko: {
          title: "사일런트 디스코 파티",
          desc: "무선 헤드폰으로 즐기는 도심 속 밤의 댄스 파티.",
          descLong: "무선 헤드폰으로 세 개의 채널을 골라 들으며 즐기는 도심 속 밤의 댄스 파티. 소음 없이 각자의 리듬으로 춤추는 색다른 체험.",
          venue: "서울 이태원 · 이태원 광장",
          address: "서울 용산구 이태원로 · 이태원역 도보 5분",
          hours: "20:00 – 24:00 (당일)"
        },
        en: {
          title: "Silent Disco Party",
          desc: "A night dance party in the city, enjoyed through wireless headphones.",
          venue: "Itaewon, Seoul · Itaewon Square",
          hours: "20:00 – 24:00 (one night)"
        },
        zh: {
          title: "无声迪斯科派对",
          desc: "戴上无线耳机，在城市中央享受的夜间舞会。",
          venue: "首尔梨泰院 · 梨泰院广场",
          hours: "20:00 – 24:00（当天）"
        },
        ja: {
          title: "サイレントディスコパーティー",
          desc: "ワイヤレスヘッドホンで楽しむ、都会の夜のダンスパーティー。",
          venue: "ソウル梨泰院 · 梨泰院広場",
          hours: "20:00 – 24:00（当日）"
        }
      }
    }
  ];

  /* ---------- 트렌드 리포트 (기능6) ---------- */
  var TRENDS = [
    {
      image: "image/bangheaja4.jpeg",
      loc: {
        ko: {
          eyebrow: "리포트 · 2026 Q3", title: "2026 글로벌 아트 트렌드",
          desc: "몰입형 전시와 감각의 확장 — 올해 세계 미술관이 주목한 다섯 가지 흐름.",
          intro: "2026년 세계 미술관과 갤러리는 ‘보는 전시’에서 ‘겪는 전시’로 빠르게 이동하고 있습니다. 올해 컬처핏이 주목한 다섯 가지 흐름을 정리했습니다.",
          sections: [
            { h: "1. 몰입형·다감각 전시", p: "프로젝션과 사운드스케이프를 넘어 후각·촉각까지 동원한 다감각 전시가 표준이 되고 있습니다. 관람객은 작품을 ‘관찰’하기보다 ‘통과’합니다." },
            { h: "2. 조용한 회화의 귀환", p: "스펙터클의 반작용으로, 빛과 여백을 다룬 명상적 회화가 다시 주목받습니다. 방혜자·오병욱의 작업이 대표적입니다." },
            { h: "3. 지속가능한 재료 실험", p: "비누·종이·흙처럼 사라지는 재료로 영속성에 질문을 던지는 작업이 늘고 있습니다." },
            { h: "4. 로컬 아트 투어리즘", p: "미술관 단일 방문에서, 동선 기반의 지역 문화 경험(카페·서점·공연)으로 확장됩니다." },
            { h: "5. 다국어·접근성", p: "해외 관람객을 위한 4개 언어 지원과 배리어프리 동선이 관람 만족도의 핵심 지표로 자리잡았습니다." }
          ]
        },
        en: {
          eyebrow: "Report · 2026 Q3", title: "2026 Global Art Trends",
          desc: "Immersive exhibitions and the expansion of the senses — five currents museums watched this year.",
          intro: "In 2026, museums are shifting fast from ‘exhibitions to view’ to ‘exhibitions to experience’. Here are five currents CultureFit tracked this year.",
          sections: [
            { h: "1. Immersive, multi-sensory shows", p: "Beyond projection and soundscapes, shows now enlist smell and touch. Visitors pass through works rather than merely observe them." },
            { h: "2. The return of quiet painting", p: "As a reaction to spectacle, meditative painting of light and emptiness draws attention again." },
            { h: "3. Sustainable material experiments", p: "Works in soap, paper and clay question permanence through vanishing materials." },
            { h: "4. Local art tourism", p: "From single museum visits to route-based local culture — cafés, bookshops, performances." },
            { h: "5. Multilingual & accessibility", p: "Four-language support and barrier-free routes are now core satisfaction metrics." }
          ]
        },
        zh: { eyebrow: "报告 · 2026 Q3", title: "2026 全球艺术趋势", desc: "沉浸式展览与感官的扩张——今年全球美术馆关注的五大潮流。" },
        ja: { eyebrow: "レポート · 2026 Q3", title: "2026 グローバルアートトレンド", desc: "没入型展示と感覚の拡張——今年世界の美術館が注目した5つの潮流。" }
      }
    },
    {
      image: "image/popupstore2.jpg",
      loc: {
        ko: {
          eyebrow: "리포트 · 2026 Q3", title: "브랜드 팝업, 체험이 되다",
          desc: "사고 파는 공간에서 머무는 공간으로 — 리테일 팝업의 문화화 전략.",
          intro: "리테일 팝업은 더 이상 ‘사고 파는 공간’이 아닙니다. 머무르고, 경험하고, 공유하는 문화 공간으로 진화하고 있습니다.",
          sections: [
            { h: "체류 시간이 곧 성과", p: "전환율보다 체류 시간과 재방문이 핵심 지표가 되었습니다. 포토존·체험 부스가 매대를 대체합니다." },
            { h: "브랜드의 미술관화", p: "브랜드가 아카이브와 설치미술을 도입해 팝업을 하나의 전시처럼 기획합니다." },
            { h: "동네와의 연결", p: "팝업이 주변 카페·로컬 상점과 연계해 ‘동네 코스’의 일부가 됩니다." },
            { h: "측정 가능한 경험", p: "방문·리뷰·SNS 공유 데이터를 통합해 경험의 효과를 정량화합니다." }
          ]
        },
        en: {
          eyebrow: "Report · 2026 Q3", title: "Brand Pop-ups as Experience",
          desc: "From places to buy to places to stay — the culturalization of retail pop-ups.",
          intro: "Retail pop-ups are no longer places to buy and sell. They are evolving into cultural spaces to stay, experience and share.",
          sections: [
            { h: "Dwell time is the KPI", p: "Dwell time and revisits matter more than conversion. Photo zones and experience booths replace shelves." },
            { h: "Brands as museums", p: "Brands adopt archives and installation art, curating pop-ups like exhibitions." },
            { h: "Tied to the neighborhood", p: "Pop-ups link with nearby cafés and local shops, becoming part of a ‘neighborhood course’." },
            { h: "Measurable experience", p: "Visit, review and social-share data are combined to quantify the impact of experience." }
          ]
        },
        zh: { eyebrow: "报告 · 2026 Q3", title: "品牌快闪，成为体验", desc: "从买卖空间到停留空间——零售快闪的文化化策略。" },
        ja: { eyebrow: "レポート · 2026 Q3", title: "ブランドポップアップ、体験になる", desc: "売買の場から滞在の場へ——リテールポップアップの文化化戦略。" }
      }
    }
  ];

  /* ---------- UI 문자열 사전 (기능8 다국어) ---------- */
  var I18N = {
    ko: {
      navRecommend: "추천", navExplore: "탐색", navTrend: "트렌드", navProvider: "주최측",
      viewConsumer: "소비자 화면", viewProvider: "공급자 · 주최측 콘솔",
      heroTitle: "취향에 맞는 전시·공연을<br />한 곳에서",
      heroNote: "관심 카테고리·지역·취향 태그를 설정하면 나에게 맞는 콘텐츠를 추천합니다.",
      searchPlaceholder: "전시, 공연, 아티스트, 장소를 검색하세요", searchBtn: "검색",
      tasteLabel: "관심 취향",
      tasteAbstract: "추상 회화", tasteSculpture: "조각·설치", tastePopup: "팝업·체험", tasteMusic: "음악·파티", tastePhoto: "사진", tasteMore: "+ 더보기",
      heroEyebrow: "이 주의 컬처핏 픽",
      filterTitle: "통합 검색 / 필터",
      filterNote: "지역, 날짜, 장르(전시/공연), 가격대 등 조건을 한 번에 필터링. (결과 1초 이내 반환 목표)",
      filterRegion: "지역", filterDate: "날짜", filterGenre: "장르", filterPrice: "가격", filterApply: "필터 적용",
      optAll: "전체", optSeoul: "서울", optGyeonggi: "경기·인천", optBusan: "부산", optDaegu: "대구·경북",
      optToday: "오늘", optWeekend: "이번 주말", optMonth: "이번 달",
      optExhibition: "전시", optPerformance: "공연", optPopup: "팝업·체험",
      optFree: "무료", optUnder1: "~1만원", opt1to3: "1~3만원", optOver3: "3만원~",
      resultCount: "검색 결과 {n}건", noResults: "조건에 맞는 결과가 없어요. 필터를 조정해보세요.",
      recTitle: "지윤님을 위한 추천", recNote: "선택한 취향 태그를 바탕으로 비슷한 결의 콘텐츠를 골랐어요.",
      recEmpty: "취향 태그를 하나 이상 선택하면 맞춤 추천을 보여드려요.",
      listTitle: "전시·공연 목록",
      free: "무료", freeEntry: "무료 입장",
      detailBook: "예매하기", detailInterest: "관심 등록", detailInterestOn: "관심 등록됨",
      factPeriod: "기간", factVenue: "장소", factPrice: "관람료", factHours: "운영",
      transTitle: "번역 상태",
      transNote: "자동번역 + AI 검수 통과 시 4개 언어 노출. 기준 미달 시 ‘번역 검토 중’으로 표시되고 한국어 원문이 대체 노출됩니다.",
      transSource: "원문", transLive: "노출 중", transReview: "번역 검토 중",
      transFallback: "이 콘텐츠는 번역 검토 중이라 한국어 원문으로 표시됩니다.",
      langKo: "한국어", langEn: "English", langZh: "中文", langJa: "日本語",
      mapTitle: "위치 · 길찾기", mapNote: "전시장·공연장 위치와 현재 위치 기준 경로를 안내합니다.", mapShow: "지도 보기",
      mapDefaultLabel: "기본 위치 · 경복궁", mapDefaultAddress: "서울 종로구 사직로 161 · 경복궁 (아이템 선택 시 해당 위치로 이동)",
      nearbyTitle: "관람 후 이 동선은 어때요?", nearbyNote: "장소 기준 도보 동선에 맞춰, 카페 선호 취향을 반영해 골랐어요.",
      nearbyCafe: "카페", nearbyRestaurant: "레스토랑", nearbyBookstore: "서점",
      walkMin: "도보 {n}분", ratingLabel: "평점",
      purchaseTitle: "예매하기", purchaseNote: "클릭 시 외부 예매 사이트로 연결됩니다. (추후 앱 내 결제로 확장)",
      purchaseFree: "무료 관람 · 별도 예매가 필요하지 않습니다.",
      bookInterpark: "인터파크에서 예매", bookMelon: "멜론티켓에서 예매",
      reviewsTitle: "관람 후기 · 평점", reviewCount: "후기 {n}건", writeReview: "후기 작성하기",
      regTitle: "콘텐츠 등록", regNote: "전시·공연 신규 등록. 등록 시 한국어 원문 → 자동번역 → AI 번역 검수 → 4개 언어 노출.",
      regFieldTitle: "제목 (한국어)", regFieldGenre: "장르", regFieldDesc: "소개 (한국어 원문)",
      regFieldPeriod: "기간", regFieldVenue: "장소", regFieldPrice: "관람료", regFieldTags: "취향 태그",
      regSubmit: "등록 후 번역 요청", regDraft: "임시 저장",
      regDone: "등록되었습니다. 자동번역과 AI 검수를 시작합니다.",
      revMgmtTitle: "리뷰 · 피드백 관리", revMgmtNote: "담당 전시의 리뷰·평점 확인 및 답글 작성. 신규 리뷰 실시간(또는 새로고침 시) 반영.",
      thAuthor: "작성자", thRating: "평점", thContent: "내용", thStatus: "상태", reply: "답글", replyNeeded: "답글 필요",
      analyticsTitle: "데이터 대시보드", analyticsNote: "조회수, 관심 등록 수, 리뷰·평점 통계. (우선순위: 선택)",
      statViews: "주간 조회수", statInterest: "관심 등록", statRating: "평균 평점",
      statViewsDelta: "+18% 전주 대비", statInterestDelta: "+9% 전주 대비",
      adTitle: "타겟 광고 · 노출 관리", adNote: "관심사·연령대 등 타겟 설정으로 특정 사용자군에게 우선 노출. (우선순위: 선택)",
      adAge: "20–30대", adInterest: "추상 회화 관심", adRegion: "서울·수도권", adAddCond: "+ 조건 추가",
      adReach: "예상 도달", adReachValue: "약 8,400명", adStart: "노출 시작",
      trendTitle: "글로벌 문화·예술 트렌드 리포트", trendNote: "전 세계 문화·예술·체험 마케팅 트렌드 정리 콘텐츠 정기 제공. (우선순위: 선택)",
      footer: "© 2026 컬처핏 (CultureFit). MVP 프로토타입.",
      loginTitle: "주최측 로그인", loginSubtitle: "전시·공연 주최측(관리자) 전용 페이지입니다.",
      loginId: "아이디", loginPw: "비밀번호", loginBtn: "로그인",
      loginError: "아이디 또는 비밀번호가 올바르지 않아요.",
      loginHint: "데모 계정 — 아이디: admin / 비밀번호: culturefit",
      consoleTitle: "주최측 콘솔", logout: "로그아웃", backConsumer: "소비자 화면으로",
      musicOff: "음악 끄기", musicOn: "음악 켜기",
      addToCart: "장바구니 담기", inCart: "장바구니에 담김", cartTitle: "장바구니",
      cartEmpty: "장바구니가 비어 있어요.", remove: "삭제",
      consumerLogin: "로그인", consumerLoginTitle: "로그인 / 가입",
      consumerLoginNote: "이메일로 로그인하면 방문·예매·장바구니 기록이 저장돼요.",
      loginEmail: "이메일", loginName: "이름 (선택)", loginSubmit: "로그인 / 가입",
      myPage: "내 기록", greeting: "{name}님",
      visitHistory: "최근 본 항목", bookingHistory: "예매 기록", savedTitle: "관심 목록",
      historyEmpty: "아직 기록이 없어요.", close: "닫기"
    },
    en: {
      navRecommend: "Recommend", navExplore: "Explore", navTrend: "Trends", navProvider: "For Hosts",
      viewConsumer: "Consumer", viewProvider: "Host Console",
      heroTitle: "Exhibitions & shows<br />that fit your taste",
      heroNote: "Set your interests, region and taste tags to get personalized recommendations.",
      searchPlaceholder: "Search exhibitions, shows, artists, venues", searchBtn: "Search",
      tasteLabel: "Your taste",
      tasteAbstract: "Abstract painting", tasteSculpture: "Sculpture & installation", tastePopup: "Pop-up & experience", tasteMusic: "Music & party", tastePhoto: "Photography", tasteMore: "+ More",
      heroEyebrow: "This week's CultureFit pick",
      filterTitle: "Search / Filter",
      filterNote: "Filter by region, date, genre and price all at once. (results within 1s)",
      filterRegion: "Region", filterDate: "Date", filterGenre: "Genre", filterPrice: "Price", filterApply: "Apply",
      optAll: "All", optSeoul: "Seoul", optGyeonggi: "Gyeonggi·Incheon", optBusan: "Busan", optDaegu: "Daegu·Gyeongbuk",
      optToday: "Today", optWeekend: "This weekend", optMonth: "This month",
      optExhibition: "Exhibition", optPerformance: "Performance", optPopup: "Pop-up·Experience",
      optFree: "Free", optUnder1: "Under ₩10,000", opt1to3: "₩10,000–30,000", optOver3: "Over ₩30,000",
      resultCount: "{n} results", noResults: "No results match your filters. Try adjusting them.",
      recTitle: "Recommended for you", recNote: "Picked to match the taste tags you selected.",
      recEmpty: "Select at least one taste tag to see personalized picks.",
      listTitle: "All Exhibitions & Shows",
      free: "Free", freeEntry: "Free entry",
      detailBook: "Book now", detailInterest: "Save", detailInterestOn: "Saved",
      factPeriod: "Period", factVenue: "Venue", factPrice: "Admission", factHours: "Hours",
      transTitle: "Translation status",
      transNote: "After machine translation and AI review, content appears in 4 languages. If it doesn't pass, it shows “Under review” and the Korean original is displayed instead.",
      transSource: "Source", transLive: "Live", transReview: "Under review",
      transFallback: "This content is under translation review, so the Korean original is shown.",
      langKo: "한국어", langEn: "English", langZh: "中文", langJa: "日本語",
      mapTitle: "Location · Directions", mapNote: "Venue location and directions from your position.", mapShow: "Show map",
      mapDefaultLabel: "Default · Gyeongbokgung", mapDefaultAddress: "161 Sajik-ro, Jongno-gu, Seoul · Gyeongbokgung Palace (moves to the venue once you select an item)",
      nearbyTitle: "How about this route after your visit?", nearbyNote: "Picked along a walkable route from the venue, matching your café preference.",
      nearbyCafe: "Café", nearbyRestaurant: "Restaurant", nearbyBookstore: "Bookstore",
      walkMin: "{n} min walk", ratingLabel: "Rating",
      purchaseTitle: "Book Tickets", purchaseNote: "Opens an external ticketing site. (in-app payment planned)",
      purchaseFree: "Free admission — no booking required.",
      bookInterpark: "Book on Interpark", bookMelon: "Book on Melon Ticket",
      reviewsTitle: "Reviews · Ratings", reviewCount: "{n} reviews", writeReview: "Write a review",
      regTitle: "Register Content", regNote: "Register a new exhibition/show. Korean original → machine translation → AI review → shown in 4 languages.",
      regFieldTitle: "Title (Korean)", regFieldGenre: "Genre", regFieldDesc: "Description (Korean original)",
      regFieldPeriod: "Period", regFieldVenue: "Venue", regFieldPrice: "Admission", regFieldTags: "Taste tags",
      regSubmit: "Register & request translation", regDraft: "Save draft",
      regDone: "Registered. Starting machine translation and AI review.",
      revMgmtTitle: "Review Management", revMgmtNote: "Check reviews/ratings for your event and reply. New reviews reflected in real time (or on refresh).",
      thAuthor: "Author", thRating: "Rating", thContent: "Content", thStatus: "Status", reply: "Reply", replyNeeded: "Reply needed",
      analyticsTitle: "Analytics Dashboard", analyticsNote: "Views, saves, and review/rating stats. (priority: optional)",
      statViews: "Weekly views", statInterest: "Saves", statRating: "Avg. rating",
      statViewsDelta: "+18% vs last week", statInterestDelta: "+9% vs last week",
      adTitle: "Targeted Ads", adNote: "Prioritize exposure to specific audiences by interest/age targeting. (priority: optional)",
      adAge: "20s–30s", adInterest: "Interested in abstract", adRegion: "Seoul metro", adAddCond: "+ Add condition",
      adReach: "Est. reach", adReachValue: "~8,400 people", adStart: "Start campaign",
      trendTitle: "Global Culture & Art Trend Reports", trendNote: "Regular reports on global culture, art and experiential marketing trends. (priority: optional)",
      footer: "© 2026 CultureFit. MVP prototype.",
      loginTitle: "Host Login", loginSubtitle: "Admin-only page for exhibition/show hosts.",
      loginId: "ID", loginPw: "Password", loginBtn: "Log in",
      loginError: "Incorrect ID or password.",
      loginHint: "Demo account — ID: admin / Password: culturefit",
      consoleTitle: "Host Console", logout: "Log out", backConsumer: "Back to site",
      musicOff: "Music off", musicOn: "Music on"
    },
    zh: {
      navRecommend: "推荐", navExplore: "探索", navTrend: "趋势", navProvider: "主办方",
      viewConsumer: "消费者", viewProvider: "主办方控制台",
      heroTitle: "找到合你口味的<br />展览与演出",
      heroNote: "设置兴趣、地区与口味标签，即可获得个性化推荐。",
      searchPlaceholder: "搜索展览、演出、艺术家、场馆", searchBtn: "搜索",
      tasteLabel: "兴趣",
      tasteAbstract: "抽象绘画", tasteSculpture: "雕塑·装置", tastePopup: "快闪·体验", tasteMusic: "音乐·派对", tastePhoto: "摄影", tasteMore: "+ 更多",
      heroEyebrow: "本周 CultureFit 精选",
      filterTitle: "综合搜索 / 筛选",
      filterNote: "一次性按地区、日期、类型、价格筛选。（结果1秒内返回）",
      filterRegion: "地区", filterDate: "日期", filterGenre: "类型", filterPrice: "价格", filterApply: "应用",
      optAll: "全部", optSeoul: "首尔", optGyeonggi: "京畿·仁川", optBusan: "釜山", optDaegu: "大邱·庆北",
      optToday: "今天", optWeekend: "本周末", optMonth: "本月",
      optExhibition: "展览", optPerformance: "演出", optPopup: "快闪·体验",
      optFree: "免费", optUnder1: "1万韩元以下", opt1to3: "1~3万韩元", optOver3: "3万韩元以上",
      resultCount: "共 {n} 个结果", noResults: "没有符合条件的结果，请调整筛选。",
      recTitle: "为你推荐", recNote: "根据你选择的口味标签，挑选相似格调的内容。",
      recEmpty: "选择至少一个口味标签，即可查看个性化推荐。",
      listTitle: "展览·演出列表",
      free: "免费", freeEntry: "免费入场",
      detailBook: "立即预订", detailInterest: "收藏", detailInterestOn: "已收藏",
      factPeriod: "展期", factVenue: "场馆", factPrice: "门票", factHours: "开放时间",
      transTitle: "翻译状态",
      transNote: "经机器翻译与AI审核通过后以4种语言显示；未通过则标记“审核中”并显示韩语原文。",
      transSource: "原文", transLive: "显示中", transReview: "审核中",
      transFallback: "此内容正在翻译审核中，显示韩语原文。",
      langKo: "한국어", langEn: "English", langZh: "中文", langJa: "日本語",
      mapTitle: "位置 · 路线", mapNote: "展示场馆位置及从当前位置出发的路线。", mapShow: "显示地图",
      mapDefaultLabel: "默认位置 · 景福宫", mapDefaultAddress: "首尔钟路区社稷路161 · 景福宫（选择项目后移动到该位置）",
      nearbyTitle: "观展后走这条路线如何？", nearbyNote: "结合从场馆出发的步行路线与你的咖啡偏好挑选。",
      nearbyCafe: "咖啡馆", nearbyRestaurant: "餐厅", nearbyBookstore: "书店",
      walkMin: "步行{n}分钟", ratingLabel: "评分",
      purchaseTitle: "预订门票", purchaseNote: "点击后跳转至外部购票网站。（未来将支持应用内支付）",
      purchaseFree: "免费参观 · 无需预订。",
      bookInterpark: "在Interpark预订", bookMelon: "在Melon Ticket预订",
      reviewsTitle: "观后评价 · 评分", reviewCount: "{n}条评价", writeReview: "写评价",
      regTitle: "内容登记", regNote: "登记新展览/演出。韩语原文 → 机器翻译 → AI审核 → 以4种语言显示。",
      regFieldTitle: "标题（韩语）", regFieldGenre: "类型", regFieldDesc: "简介（韩语原文）",
      regFieldPeriod: "展期", regFieldVenue: "场馆", regFieldPrice: "门票", regFieldTags: "兴趣标签",
      regSubmit: "登记并请求翻译", regDraft: "暂存",
      regDone: "已登记。开始机器翻译与AI审核。",
      revMgmtTitle: "评价管理", revMgmtNote: "查看所负责展览的评价·评分并回复。新评价实时（或刷新时）反映。",
      thAuthor: "作者", thRating: "评分", thContent: "内容", thStatus: "状态", reply: "回复", replyNeeded: "需回复",
      analyticsTitle: "数据仪表板", analyticsNote: "浏览量、收藏数、评价/评分统计。（优先级：可选）",
      statViews: "周浏览量", statInterest: "收藏数", statRating: "平均评分",
      statViewsDelta: "较上周 +18%", statInterestDelta: "较上周 +9%",
      adTitle: "定向广告", adNote: "按兴趣·年龄等定向，向特定用户群优先展示。（优先级：可选）",
      adAge: "20–30岁", adInterest: "关注抽象绘画", adRegion: "首尔·首都圈", adAddCond: "+ 添加条件",
      adReach: "预计触达", adReachValue: "约 8,400 人", adStart: "开始投放",
      trendTitle: "全球文化·艺术趋势报告", trendNote: "定期提供全球文化·艺术·体验营销趋势内容。（优先级：可选）",
      footer: "© 2026 CultureFit. MVP 原型。",
      loginTitle: "主办方登录", loginSubtitle: "展览·演出主办方（管理员）专用页面。",
      loginId: "账号", loginPw: "密码", loginBtn: "登录",
      loginError: "账号或密码不正确。",
      loginHint: "演示账号 — 账号：admin / 密码：culturefit",
      consoleTitle: "主办方控制台", logout: "退出登录", backConsumer: "返回消费者页面",
      musicOff: "关闭音乐", musicOn: "开启音乐"
    },
    ja: {
      navRecommend: "おすすめ", navExplore: "さがす", navTrend: "トレンド", navProvider: "主催者",
      viewConsumer: "消費者", viewProvider: "主催者コンソール",
      heroTitle: "好みに合う展示・公演を<br />ひとつの場所で",
      heroNote: "関心カテゴリ・地域・好みタグを設定すると、あなたに合うコンテンツをおすすめします。",
      searchPlaceholder: "展示・公演・アーティスト・会場を検索", searchBtn: "検索",
      tasteLabel: "好み",
      tasteAbstract: "抽象絵画", tasteSculpture: "彫刻・インスタレーション", tastePopup: "ポップアップ・体験", tasteMusic: "音楽・パーティー", tastePhoto: "写真", tasteMore: "+ もっと見る",
      heroEyebrow: "今週のカルチャーフィット・ピック",
      filterTitle: "統合検索 / フィルター",
      filterNote: "地域・日付・ジャンル・価格をまとめて絞り込み。（結果は1秒以内）",
      filterRegion: "地域", filterDate: "日付", filterGenre: "ジャンル", filterPrice: "価格", filterApply: "適用",
      optAll: "すべて", optSeoul: "ソウル", optGyeonggi: "京畿・仁川", optBusan: "釜山", optDaegu: "大邱・慶北",
      optToday: "今日", optWeekend: "今週末", optMonth: "今月",
      optExhibition: "展示", optPerformance: "公演", optPopup: "ポップアップ・体験",
      optFree: "無料", optUnder1: "1万ウォン以下", opt1to3: "1~3万ウォン", optOver3: "3万ウォン以上",
      resultCount: "検索結果 {n}件", noResults: "条件に合う結果がありません。フィルターを調整してください。",
      recTitle: "あなたへのおすすめ", recNote: "選択した好みタグをもとに、近い雰囲気のコンテンツを選びました。",
      recEmpty: "好みタグを1つ以上選ぶと、おすすめが表示されます。",
      listTitle: "展示・公演一覧",
      free: "無料", freeEntry: "入場無料",
      detailBook: "予約する", detailInterest: "保存", detailInterestOn: "保存済み",
      factPeriod: "会期", factVenue: "会場", factPrice: "観覧料", factHours: "開館時間",
      transTitle: "翻訳ステータス",
      transNote: "自動翻訳とAI検査を通過すると4言語で表示。基準未達の場合は「翻訳確認中」と表示され、韓国語原文が代替表示されます。",
      transSource: "原文", transLive: "表示中", transReview: "翻訳確認中",
      transFallback: "このコンテンツは翻訳確認中のため、韓国語原文で表示しています。",
      langKo: "한국어", langEn: "English", langZh: "中文", langJa: "日本語",
      mapTitle: "場所・道案内", mapNote: "会場の位置と現在地からの経路を案内します。", mapShow: "地図を表示",
      mapDefaultLabel: "初期位置 · 景福宮", mapDefaultAddress: "ソウル鍾路区社稷路161 · 景福宮（アイテム選択で会場に移動）",
      nearbyTitle: "鑑賞後、このルートはいかが？", nearbyNote: "会場からの徒歩ルートに沿って、カフェ好みを反映して選びました。",
      nearbyCafe: "カフェ", nearbyRestaurant: "レストラン", nearbyBookstore: "書店",
      walkMin: "徒歩{n}分", ratingLabel: "評価",
      purchaseTitle: "予約", purchaseNote: "クリックで外部予約サイトに移動します。（今後アプリ内決済に拡張）",
      purchaseFree: "無料鑑賞 · 予約は不要です。",
      bookInterpark: "Interparkで予約", bookMelon: "Melon Ticketで予約",
      reviewsTitle: "感想・評価", reviewCount: "感想{n}件", writeReview: "感想を書く",
      regTitle: "コンテンツ登録", regNote: "展示・公演を新規登録。韓国語原文→自動翻訳→AI検査→4言語で表示。",
      regFieldTitle: "タイトル（韓国語）", regFieldGenre: "ジャンル", regFieldDesc: "紹介（韓国語原文）",
      regFieldPeriod: "会期", regFieldVenue: "会場", regFieldPrice: "観覧料", regFieldTags: "好みタグ",
      regSubmit: "登録して翻訳を依頼", regDraft: "一時保存",
      regDone: "登録しました。自動翻訳とAI検査を開始します。",
      revMgmtTitle: "レビュー管理", revMgmtNote: "担当展示のレビュー・評価を確認し返信。新規レビューはリアルタイム（または更新時）に反映。",
      thAuthor: "投稿者", thRating: "評価", thContent: "内容", thStatus: "ステータス", reply: "返信", replyNeeded: "要返信",
      analyticsTitle: "データダッシュボード", analyticsNote: "閲覧数・保存数・レビュー/評価の統計。（優先度：任意）",
      statViews: "週間閲覧数", statInterest: "保存数", statRating: "平均評価",
      statViewsDelta: "前週比 +18%", statInterestDelta: "前週比 +9%",
      adTitle: "ターゲット広告", adNote: "関心・年齢などのターゲット設定で特定ユーザーに優先表示。（優先度：任意）",
      adAge: "20–30代", adInterest: "抽象絵画に関心", adRegion: "ソウル首都圏", adAddCond: "+ 条件を追加",
      adReach: "推定リーチ", adReachValue: "約 8,400人", adStart: "配信開始",
      trendTitle: "グローバル文化・芸術トレンドレポート", trendNote: "世界の文化・芸術・体験マーケティングのトレンドを定期提供。（優先度：任意）",
      footer: "© 2026 CultureFit. MVPプロトタイプ。",
      loginTitle: "主催者ログイン", loginSubtitle: "展示・公演の主催者（管理者）専用ページです。",
      loginId: "ID", loginPw: "パスワード", loginBtn: "ログイン",
      loginError: "IDまたはパスワードが正しくありません。",
      loginHint: "デモアカウント — ID: admin / パスワード: culturefit",
      consoleTitle: "主催者コンソール", logout: "ログアウト", backConsumer: "消費者ページへ",
      musicOff: "音楽オフ", musicOn: "音楽オン"
    }
  };

  global.CF_DATA = {
    events: EVENTS,
    trends: TRENDS,
    i18n: I18N,
    tasteTags: TASTE_TAGS,
    /* 오늘 날짜 기준 (PRD 시나리오 기준일). 실제 today와 무관하게 데모 일관성 유지 */
    referenceDate: "2026-07-02"
  };
})(window);
