/* ============================================================
   컬처핏 (CultureFit) — 로직 계층 (app.js)
   ------------------------------------------------------------
   PRD 핵심 기능 구현 (순수 JavaScript, 프레임워크 없음):
     기능1  개인화 추천  · 기능2 통합 검색/필터 · 기능3 리뷰
     기능4  예매 연동    · 기능8 다국어(한/영/중/일)
     기능9  주변 추천    · 기능10 지도(OpenStreetMap)
   데이터는 data.js(window.CF_DATA)에서 주입.
   ============================================================ */
(function () {
  "use strict";

  var D = window.CF_DATA;
  if (!D) { console.error("CF_DATA 로드 실패"); return; }

  /* ---------- 상태 ---------- */
  var state = {
    lang: "ko",
    selectedTags: new Set(["abstract"]), // 기본 취향 태그 1개 선택
    detailId: "shinmikyung",             // 상세에 표시 중인 이벤트
    saved: new Set(),                    // 관심 등록
    itemSelected: false                  // 소비자가 아이템을 직접 선택했는지 (지도 기본 위치 판단)
  };

  // 지도 기본 위치: 경복궁 (아이템 선택 전까지 노출)
  var GYEONGBOKGUNG = [37.579617, 126.977041];

  // 주변 추천 장소 사진 (유형별 풀 — 인덱스로 순환 배정)
  var NEARBY_PHOTOS = {
    cafe: ["image/cafe1.jpg", "image/cafe2.jpg", "image/cafe3.jpg"],
    restaurant: ["image/restaurant1.jpg", "image/restaurant2.jpg", "image/restaurant3.jpg"],
    bookstore: [
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=60",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=60"
    ]
  };

  /* ---------- 유틸 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function dict() { return D.i18n[state.lang] || D.i18n.ko; }

  // UI 문자열 (템플릿 변수 {n} 치환 지원)
  function t(key, vars) {
    var s = dict()[key];
    if (s == null) s = D.i18n.ko[key];
    if (s == null) s = key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace("{" + k + "}", vars[k]);
      });
    }
    return s;
  }

  function eventById(id) {
    for (var i = 0; i < D.events.length; i++) if (D.events[i].id === id) return D.events[i];
    return null;
  }

  // 기능8: 이벤트 지역화 필드 (번역 검토 중이면 한국어 원문으로 대체 노출)
  function loc(ev, field) {
    var useLang = ev.translation[state.lang] === "review" ? "ko" : state.lang;
    var l = ev.loc[useLang] || ev.loc.ko;
    if (l && l[field] != null) return l[field];
    return ev.loc.ko[field]; // 최종 폴백
  }
  function isFallback(ev) { return ev.translation[state.lang] === "review"; }

  function genreLabel(ev) {
    return t(ev.genre === "exhibition" ? "optExhibition" : ev.genre === "performance" ? "optPerformance" : "optPopup");
  }
  function regionLabel(region) {
    var map = { seoul: "optSeoul", gyeonggi: "optGyeonggi", busan: "optBusan", daegu: "optDaegu" };
    return t(map[region] || "optAll");
  }
  function formatPrice(ev) {
    if (ev.free) return ev.freeEntry ? t("freeEntry") : t("free");
    var n = ev.price.toLocaleString("en-US");
    return state.lang === "ko" ? ev.price.toLocaleString("ko-KR") + "원" : "₩" + n;
  }
  function stars(rating) {
    var full = Math.max(0, Math.min(5, Math.round(rating)));
    return new Array(full + 1).join("★") + new Array(6 - full).join("☆");
  }

  /* ============================================================
     기능8: 다국어 — 정적 UI 문자열 적용
     ============================================================ */
  function applyChrome() {
    document.documentElement.lang = state.lang;

    $all("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    $all("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    $all("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });

    // 언어 버튼 활성 상태
    $all("#language-selector button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === state.lang));
    });
  }

  /* ============================================================
     기능1: 개인화 추천
     선택한 취향 태그와 겹치는 이벤트 우선, 부족하면 평점순으로 3개 채움
     ============================================================ */
  // 취향 태그 + 검색어를 함께 반영해 추천을 재정렬 (개인화 화면이 즉시 반응)
  function renderRecommendations() {
    var wrap = $("#rec-list");
    var note = $("#personalized-recommendations .note");
    var tags = state.selectedTags;
    var searchEl = $("#global-search");
    var q = searchEl ? searchEl.value.trim() : "";

    if (tags.size === 0 && !q) {
      wrap.innerHTML = "";
      note.textContent = t("recEmpty");
      return;
    }
    note.textContent = t("recNote");

    var scored = D.events.map(function (ev) {
      var tagScore = ev.tags.filter(function (tg) { return tags.has(tg); }).length;
      var qScore = q && matchesQuery(ev, q) ? 1 : 0;
      return { ev: ev, score: tagScore * 2 + qScore * 3 };
    });
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return b.ev.reviewScore - a.ev.reviewScore; // 동점이면 평점순
    });

    // 최소 3개 보장 (성공 기준 #2)
    var picks = scored.slice(0, 3).map(function (s) { return s.ev; });
    wrap.innerHTML = picks.map(editorialTile).join("");
  }

  function editorialTile(ev) {
    return (
      '<article class="editorial-tile" data-id="' + ev.id + '">' +
        '<a class="thumb" href="#event-detail"><img src="' + ev.cardImage + '" alt="' + esc(loc(ev, "title")) + '" /></a>' +
        '<span class="tile-genre">' + genreLabel(ev) + "</span>" +
        '<h3 class="title">' + esc(loc(ev, "title")) + "</h3>" +
        '<p class="desc">' + esc(loc(ev, "desc")) + "</p>" +
      "</article>"
    );
  }

  /* ============================================================
     기능2: 통합 검색 / 필터
     ============================================================ */
  // 시간대 영향 없이 ISO 날짜 문자열만으로 계산 (UTC 고정)
  function isoAddDays(iso, days) {
    var d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function dateWindow(mode) {
    var ref = D.referenceDate; // 기준일 (데모 일관성)
    if (mode === "today") return [ref, ref];
    if (mode === "weekend") {
      var dow = new Date(ref + "T00:00:00Z").getUTCDay(); // 0=일 ~ 6=토
      var toSat = (6 - dow + 7) % 7;
      var sat = isoAddDays(ref, toSat);
      return [sat, isoAddDays(sat, 1)];
    }
    if (mode === "month") {
      return [ref.slice(0, 7) + "-01", ref.slice(0, 7) + "-31"];
    }
    return null;
  }
  function priceBucket(ev) {
    if (ev.free) return "free";
    if (ev.price < 10000) return "under1";
    if (ev.price <= 30000) return "1to3";
    return "over3";
  }
  function matchesQuery(ev, q) {
    if (!q) return true;
    q = q.trim().toLowerCase();
    if (!q) return true;
    var hay = [];
    ["ko", "en", "zh", "ja"].forEach(function (lg) {
      if (ev.loc[lg]) { hay.push(ev.loc[lg].title || "", ev.loc[lg].venue || ""); }
    });
    hay = hay.concat(ev.tags).join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderEventList() {
    var region = $("#f-region").value;
    var date = $("#f-date").value;
    var genre = $("#f-genre").value;
    var price = $("#f-price").value;
    var q = $("#global-search").value;
    var win = dateWindow(date);

    var results = D.events.filter(function (ev) {
      if (region !== "all" && ev.region !== region) return false;
      if (genre !== "all" && ev.genre !== genre) return false;
      if (price !== "all" && priceBucket(ev) !== price) return false;
      if (win && !(ev.dateStart <= win[1] && ev.dateEnd >= win[0])) return false;
      if (!matchesQuery(ev, q)) return false;
      return true;
    });

    var wrap = $("#event-card-list");
    var count = $("#filter-result-count");

    if (results.length === 0) {
      wrap.innerHTML = '<p class="empty-state">' + esc(t("noResults")) + "</p>";
    } else {
      wrap.innerHTML = results.map(productCard).join("");
    }
    count.innerHTML = t("resultCount", { n: "<strong>" + results.length + "</strong>" });
  }

  function productCard(ev) {
    var priceCls = ev.free ? "price on-sale" : "price";
    return (
      '<article class="product-card" data-id="' + ev.id + '">' +
        '<a class="thumb" href="#event-detail"><img src="' + ev.cardImage + '" alt="' + esc(loc(ev, "title")) + '" /></a>' +
        '<p class="meta-genre">' + genreLabel(ev) + " · " + regionLabel(ev.region) + "</p>" +
        '<p class="name">' + esc(loc(ev, "title")) + "</p>" +
        '<p class="' + priceCls + '">' + esc(formatPrice(ev)) + "</p>" +
        '<p class="caption">' + ev.dateDisplay + "</p>" +
      "</article>"
    );
  }

  /* ============================================================
     상세 페이지 렌더 (기능3·4·8·9·10 통합)
     ============================================================ */
  function renderDetail(id) {
    var ev = eventById(id);
    if (!ev) return;
    state.detailId = id;

    renderDetailHead(ev);
    renderTranslationStatus(ev);
    renderMap(ev);
    renderNearby(ev);
    renderPurchase(ev);
    renderReviews(ev);
  }

  function renderDetailHead(ev) {
    var thumbs = ev.images.length > 1
      ? '<div class="detail-thumbs">' + ev.images.slice(1, 4).map(function (src) {
          return '<img src="' + src + '" alt="' + esc(loc(ev, "title")) + '" data-full="' + src + '" />';
        }).join("") + "</div>"
      : "";

    var fallback = isFallback(ev)
      ? '<p class="trans-fallback">' + esc(t("transFallback")) + "</p>"
      : "";

    var interestOn = state.saved.has(ev.id);
    var facts = [
      [t("factPeriod"), esc(ev.dateDisplay)],
      [t("factVenue"), esc(loc(ev, "venue"))],
      [t("factPrice"), esc(formatPrice(ev))],
      [t("factHours"), esc(loc(ev, "hours"))]
    ].map(function (row) {
      return "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
    }).join("");

    $("#detail-head").innerHTML =
      '<div class="detail-media">' +
        '<img id="detail-main-img" src="' + ev.images[0] + '" alt="' + esc(loc(ev, "title")) + '" />' +
        thumbs +
      "</div>" +
      '<div class="detail-info">' +
        '<span class="tile-genre">' + genreLabel(ev) + "</span>" +
        fallback +
        "<h2>" + esc(loc(ev, "title")) + "</h2>" +
        '<p class="desc">' + esc(loc(ev, "descLong") || loc(ev, "desc")) + "</p>" +
        '<dl class="detail-facts">' + facts + "</dl>" +
        '<div class="detail-cta-row">' +
          '<a href="#purchase-link" class="btn-inverted">' + t("detailBook") + "</a>" +
          '<button type="button" class="btn-ghost" id="detail-interest">' +
            (interestOn ? t("detailInterestOn") : t("detailInterest")) +
          "</button>" +
        "</div>" +
      "</div>";

    // 썸네일 클릭 → 메인 이미지 교체
    $all("#detail-head .detail-thumbs img").forEach(function (img) {
      img.addEventListener("click", function () {
        $("#detail-main-img").src = img.getAttribute("data-full");
      });
    });
    // 관심 등록 토글
    var interestBtn = $("#detail-interest");
    if (interestBtn) {
      interestBtn.addEventListener("click", function () {
        if (state.saved.has(ev.id)) state.saved.delete(ev.id);
        else state.saved.add(ev.id);
        interestBtn.textContent = state.saved.has(ev.id) ? t("detailInterestOn") : t("detailInterest");
        interestBtn.classList.toggle("chip--on", state.saved.has(ev.id));
      });
    }
  }

  // 기능8: 번역 상태 배지
  function renderTranslationStatus(ev) {
    var langs = [
      { key: "ko", label: t("langKo") },
      { key: "en", label: t("langEn") },
      { key: "zh", label: t("langZh") },
      { key: "ja", label: t("langJa") }
    ];
    $("#lang-status").innerHTML = langs.map(function (l) {
      var st = ev.translation[l.key];
      var isReview = st === "review";
      var stateText = st === "source" ? t("transSource") : isReview ? t("transReview") : t("transLive");
      return (
        '<li class="lang-status__item ' + (isReview ? "is-review" : "is-live") + '">' +
          '<span class="dot"></span>' + l.label + " <em>" + stateText + "</em>" +
        "</li>"
      );
    }).join("");
  }

  // 기능10: 지도 (OpenStreetMap 임베드 — 무료, 키 불필요)
  function osmEmbed(coords) {
    var lat = coords[0], lon = coords[1], d = 0.006;
    var bbox = [lon - d, lat - d, lon + d, lat + d].join("%2C");
    return "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox +
      "&layer=mapnik&marker=" + lat + "%2C" + lon;
  }
  function renderMap(ev) {
    var frame = $("#map-frame");
    // 아이템 선택 전까지는 경복궁을 기본 중심으로, 지도를 즉시 노출
    var useDefault = !state.itemSelected;
    var coords = useDefault ? GYEONGBOKGUNG : ev.coords;
    var label = useDefault ? t("mapDefaultLabel") : loc(ev, "venue");
    var address = useDefault ? t("mapDefaultAddress") : loc(ev, "address");

    frame.setAttribute("role", "group");
    frame.setAttribute("aria-label", label);
    frame.innerHTML =
      '<iframe class="map-embed" title="' + esc(label) + '" src="' + osmEmbed(coords) + '" loading="lazy"></iframe>' +
      '<p class="map-address">' + esc(address) + "</p>";
  }

  // 기능9: 동선 기반 주변 추천 (유형별 사진 적용)
  function nearbyPhoto(type, index) {
    var pool = NEARBY_PHOTOS[type] || NEARBY_PHOTOS.cafe;
    return pool[index % pool.length];
  }
  function renderNearby(ev) {
    var typeLabel = { cafe: "nearbyCafe", restaurant: "nearbyRestaurant", bookstore: "nearbyBookstore" };
    $("#nearby-list").innerHTML = ev.nearby.map(function (p, i) {
      return (
        '<article class="product-card nearby-card">' +
          '<div class="thumb"><img src="' + nearbyPhoto(p.type, i) + '" alt="' + esc(p.name) + '" loading="lazy" /></div>' +
          '<p class="meta-genre">' + t(typeLabel[p.type]) + " · " + t("walkMin", { n: p.walkMin }) + "</p>" +
          '<p class="name">' + esc(p.name) + "</p>" +
          '<p class="caption">' + t("ratingLabel") + " " + p.rating + "</p>" +
        "</article>"
      );
    }).join("");
  }

  // 기능4: 예매 연동 (외부 링크, 새 탭)
  function renderPurchase(ev) {
    var row = $("#purchase-row");
    var note = $("#purchase-link .note");
    if (!ev.purchase || ev.purchase.length === 0) {
      note.textContent = t("purchaseFree");
      row.innerHTML = "";
      return;
    }
    note.textContent = t("purchaseNote");
    var labelKey = { interpark: "bookInterpark", melon: "bookMelon" };
    row.innerHTML = ev.purchase.map(function (p, i) {
      var cls = i === 0 ? "btn-inverted" : "btn-ghost";
      return '<a href="' + p.url + '" target="_blank" rel="noopener noreferrer" class="' + cls + '">' +
        t(labelKey[p.site] || "detailBook") + "</a>";
    }).join("");
  }

  // 기능3: 리뷰 (소비자 노출)
  function renderReviews(ev) {
    $("#review-summary").innerHTML =
      '<span class="review-score">' + ev.reviewScore + "</span>" +
      '<span class="review-stars" aria-label="' + ev.reviewScore + '">' + stars(ev.reviewScore) + "</span>" +
      '<span class="review-count">' + t("reviewCount", { n: ev.reviewCount }) + "</span>";

    $("#review-list").innerHTML = ev.reviews.map(function (r) {
      return (
        '<li class="review-item">' +
          '<div class="review-meta"><strong>' + esc(r.author) + "</strong>" +
            '<span class="review-stars">' + stars(r.rating) + "</span></div>" +
          "<p>" + esc(r.text) + "</p>" +
        "</li>"
      );
    }).join("");
  }

  /* ============================================================
     기능6: 트렌드 리포트
     ============================================================ */
  function renderTrends() {
    $("#trend-list").innerHTML = D.trends.map(function (tr) {
      var l = tr.loc[state.lang] || tr.loc.ko;
      return (
        '<article class="editorial-tile">' +
          '<a class="thumb" href="#"><img src="' + tr.image + '" alt="' + esc(l.title) + '" /></a>' +
          '<span class="tile-genre">' + esc(l.eyebrow) + "</span>" +
          '<h3 class="title">' + esc(l.title) + "</h3>" +
          '<p class="desc">' + esc(l.desc) + "</p>" +
        "</article>"
      );
    }).join("");
  }

  /* ============================================================
     기능3(주최측): 리뷰 관리 테이블
     ============================================================ */
  function renderAdminReviews() {
    var body = $("#admin-review-body");
    if (!body) return; // 소비자 페이지(index)에는 주최측 콘솔이 없음
    var ev = eventById("shinmikyung");
    body.innerHTML = ev.reviews.map(function (r) {
      var statusCell = r.rating <= 2
        ? '<span class="badge-sale">' + t("replyNeeded") + "</span>"
        : '<button type="button" class="btn-ghost btn-ghost--sm">' + t("reply") + "</button>";
      return (
        "<tr>" +
          "<td>" + esc(r.author) + "</td>" +
          "<td>" + stars(r.rating) + "</td>" +
          "<td>" + esc(r.text) + "</td>" +
          "<td>" + statusCell + "</td>" +
        "</tr>"
      );
    }).join("");
    var ratingCount = $("#stat-rating-count");
    if (ratingCount) ratingCount.textContent = t("reviewCount", { n: ev.reviewCount });
  }

  /* ============================================================
     히어로 대표 피처 캐러셀 (자동 5초 슬라이드 + 좌우 화살표)
     ============================================================ */
  var hero = { index: 0, timer: null };
  var HERO_INTERVAL = 5000;

  // 슬라이드는 이미지만 (캡션은 하단에 분리 렌더 → 화살표가 이미지 정중앙)
  function heroSlide(ev) {
    return (
      '<a class="hero-slide" data-id="' + ev.id + '" href="#event-detail" role="group" ' +
        'aria-roledescription="슬라이드" aria-label="' + esc(loc(ev, "title")) + '">' +
        '<img src="' + ev.images[0] + '" alt="' + esc(loc(ev, "title")) + '" />' +
      "</a>"
    );
  }

  function renderHeroCaption() {
    var cap = $("#hero-caption");
    var ev = D.events[hero.index];
    if (!cap || !ev) return;
    cap.setAttribute("data-id", ev.id); // 캡션 클릭 시에도 상세 로드
    cap.innerHTML =
      '<p class="hero-feature__eyebrow">' + genreLabel(ev) + " · " + regionLabel(ev.region) + "</p>" +
      '<h3 class="title">' + esc(loc(ev, "title")) + "</h3>" +
      '<p class="desc">' + esc(loc(ev, "desc")) + "</p>";
  }

  function renderHeroCarousel() {
    var track = $("#hero-track");
    if (!track) return;
    track.innerHTML = D.events.map(heroSlide).join("");

    $("#hero-dots").innerHTML = D.events.map(function (ev, i) {
      return '<button type="button" class="hero-dot" data-slide="' + i + '" role="tab" aria-label="' +
        esc(loc(ev, "title")) + '"></button>';
    }).join("");

    if (hero.index >= D.events.length) hero.index = 0;
    goHero(hero.index);
    startHeroAuto();
  }

  function goHero(i) {
    var n = D.events.length;
    if (!n) return;
    hero.index = ((i % n) + n) % n; // 순환
    var track = $("#hero-track");
    if (track) track.style.transform = "translateX(" + (-hero.index * 100) + "%)";
    $all("#hero-dots .hero-dot").forEach(function (dot, idx) {
      var active = idx === hero.index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
    });
    renderHeroCaption();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function startHeroAuto() {
    stopHeroAuto();
    if (prefersReducedMotion() || D.events.length <= 1) return;
    hero.timer = window.setInterval(function () { goHero(hero.index + 1); }, HERO_INTERVAL);
  }
  function stopHeroAuto() {
    if (hero.timer) { window.clearInterval(hero.timer); hero.timer = null; }
  }
  // 사용자가 조작하면 타이머를 리셋해 곧바로 넘어가지 않도록
  function nudgeHero(i) { goHero(i); startHeroAuto(); }

  /* ============================================================
     배경음악 (mediafiles/cosmic.mp3)
     · 기본 재생. 브라우저 자동재생 정책으로 차단되면 첫 상호작용에서 재생.
     · 헤더의 음악 토글 버튼으로 소비자가 끄기/켜기 가능.
     ============================================================ */
  var music = { on: true, audio: null, btn: null };

  // 스피커 아이콘 (재생 중 / 음소거) — currentColor 상속, SVG
  var ICON_SOUND_ON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>';
  var ICON_SOUND_OFF =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M11 5 6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  function updateMusicBtn() {
    if (!music.btn) return;
    var labelKey = music.on ? "musicOff" : "musicOn"; // 누르면 하게 될 동작
    music.btn.setAttribute("aria-pressed", String(music.on));
    music.btn.setAttribute("aria-label", t(labelKey));
    music.btn.setAttribute("title", t(labelKey));
    music.btn.innerHTML = music.on ? ICON_SOUND_ON : ICON_SOUND_OFF;
  }
  function playMusic() {
    if (!music.audio) return;
    var p = music.audio.play();
    if (p && p.catch) p.catch(function () { /* 자동재생 차단 — 첫 상호작용에서 재생 */ });
  }
  function setupMusic() {
    music.audio = $("#bg-audio");
    music.btn = $("#music-toggle");
    if (!music.audio || !music.btn) return;
    music.audio.volume = 0.4;

    music.btn.addEventListener("click", function () {
      music.on = !music.on;
      if (music.on) playMusic();
      else music.audio.pause();
      updateMusicBtn();
    });

    updateMusicBtn();
    playMusic(); // 기본 재생 시도

    // 자동재생이 막힌 경우, 첫 사용자 상호작용에서 재생 (1회)
    var resume = function () {
      if (music.on && music.audio.paused) playMusic();
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
  }

  /* ============================================================
     전체 다시 렌더 (언어 전환 시)
     ============================================================ */
  function renderAll() {
    applyChrome();
    updateMusicBtn();
    renderHeroCarousel();
    renderRecommendations();
    renderEventList();
    renderDetail(state.detailId);
    renderTrends();
    renderAdminReviews();
  }

  /* ============================================================
     이벤트 바인딩
     ============================================================ */
  function bind() {
    setupMusic();

    // 기능8: 언어 전환
    $all("#language-selector button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.lang = btn.getAttribute("data-lang");
        renderAll();
      });
    });

    // 히어로 캐러셀: 좌우 화살표 / 점 / 마우스 오버 일시정지
    $("#hero-prev").addEventListener("click", function () { nudgeHero(hero.index - 1); });
    $("#hero-next").addEventListener("click", function () { nudgeHero(hero.index + 1); });
    $("#hero-dots").addEventListener("click", function (e) {
      var dot = e.target.closest("[data-slide]");
      if (dot) nudgeHero(parseInt(dot.getAttribute("data-slide"), 10));
    });
    var carousel = $("#hero-carousel");
    carousel.addEventListener("mouseenter", stopHeroAuto);
    carousel.addEventListener("mouseleave", startHeroAuto);
    carousel.addEventListener("focusin", stopHeroAuto);
    carousel.addEventListener("focusout", startHeroAuto);

    // 기능1: 취향 태그 토글
    $("#taste-tags").addEventListener("click", function (e) {
      var chip = e.target.closest("[data-tag]");
      if (!chip) return;
      var tag = chip.getAttribute("data-tag");
      if (state.selectedTags.has(tag)) { state.selectedTags.delete(tag); chip.classList.remove("chip--on"); }
      else { state.selectedTags.add(tag); chip.classList.add("chip--on"); }
      renderRecommendations();
    });

    // 기능2: 필터 (변경 즉시 + 버튼 클릭 모두 반영)
    ["#f-region", "#f-date", "#f-genre", "#f-price"].forEach(function (sel) {
      $(sel).addEventListener("change", renderEventList);
    });
    $("#global-search").addEventListener("input", function () {
      renderEventList();
      renderRecommendations(); // 검색어가 개인화 추천에도 즉시 반영
    });
    $("#filter-apply").addEventListener("click", renderEventList);

    // 카드 클릭 → 상세 로드 후 스크롤 (기능 전반)
    document.addEventListener("click", function (e) {
      var card = e.target.closest("[data-id]");
      if (!card) return;
      var id = card.getAttribute("data-id");
      if (!eventById(id)) return;
      state.itemSelected = true; // 소비자가 아이템 선택 → 지도가 해당 위치로 이동
      renderDetail(id);
      var target = document.getElementById("event-detail");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // 콘텐츠 등록 폼 (기능8 파이프라인 진입 안내)
    var regForm = $("#reg-form");
    if (regForm) {
      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        window.alert(t("regDone"));
      });
    }
  }

  /* ---------- 시작 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    bind();
    renderAll();
  });
})();
