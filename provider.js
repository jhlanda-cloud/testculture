/* ============================================================
   컬처핏 (CultureFit) — 주최측 콘솔 로직 (provider.js)
   ------------------------------------------------------------
   · 로그인 후에만 콘솔 노출 (소비자 화면과 분리)
   · 다국어(기능8) + 리뷰 관리(기능3) 렌더
   · ⚠ MVP 데모 인증: 클라이언트에서만 검증합니다.
     실제 운영에서는 서버 인증 + 비밀번호 해시 저장이 필요합니다
     (PRD 4.2 보안 요구사항).
   ============================================================ */
(function () {
  "use strict";

  var D = window.CF_DATA;
  if (!D) { console.error("CF_DATA 로드 실패"); return; }

  // 데모 계정 (운영 전환 시 서버 인증으로 대체)
  var DEMO = { id: "admin", pw: "culturefit" };

  var state = { lang: "ko" };

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function dict() { return D.i18n[state.lang] || D.i18n.ko; }
  function t(key, vars) {
    var s = dict()[key];
    if (s == null) s = D.i18n.ko[key];
    if (s == null) s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function stars(rating) {
    var full = Math.max(0, Math.min(5, Math.round(rating)));
    return new Array(full + 1).join("★") + new Array(6 - full).join("☆");
  }

  /* 기능8: 정적 UI 문자열 적용 */
  function applyChrome() {
    document.documentElement.lang = state.lang;
    $all("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $all("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    $all("#language-selector button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === state.lang));
    });
  }

  /* 기능3: 리뷰 관리 테이블 + 평점 통계 */
  function renderConsole() {
    var body = $("#admin-review-body");
    if (!body) return;
    var ev = null;
    for (var i = 0; i < D.events.length; i++) if (D.events[i].id === "shinmikyung") ev = D.events[i];
    if (!ev) return;

    body.innerHTML = ev.reviews.map(function (r) {
      var statusCell = r.rating <= 2
        ? '<span class="badge-sale">' + t("replyNeeded") + "</span>"
        : '<button type="button" class="btn-ghost btn-ghost--sm">' + t("reply") + "</button>";
      return "<tr>" +
        "<td>" + esc(r.author) + "</td>" +
        "<td>" + stars(r.rating) + "</td>" +
        "<td>" + esc(r.text) + "</td>" +
        "<td>" + statusCell + "</td>" +
        "</tr>";
    }).join("");

    var ratingCount = $("#stat-rating-count");
    if (ratingCount) ratingCount.textContent = t("reviewCount", { n: ev.reviewCount });
  }

  /* 로그인 / 로그아웃 뷰 전환 */
  function showConsole(loggedIn) {
    $("#auth-view").hidden = loggedIn;
    $("#console-view").hidden = !loggedIn;
    if (loggedIn) renderConsole();
  }

  function bind() {
    // 언어 전환
    $all("#language-selector button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.lang = btn.getAttribute("data-lang");
        applyChrome();
        if (!$("#console-view").hidden) renderConsole();
      });
    });

    // 로그인
    $("#login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var id = $("#login-id").value.trim();
      var pw = $("#login-pw").value;
      var err = $("#login-error");
      if (id === DEMO.id && pw === DEMO.pw) {
        err.hidden = true;
        showConsole(true);
      } else {
        err.textContent = t("loginError");
        err.hidden = false;
      }
    });

    // 로그아웃
    $("#logout-btn").addEventListener("click", function () {
      $("#login-id").value = "";
      $("#login-pw").value = "";
      showConsole(false);
    });

    // 콘텐츠 등록 폼
    var regForm = $("#reg-form");
    if (regForm) {
      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        window.alert(t("regDone"));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bind();
    applyChrome();
    showConsole(false); // 최초 진입은 항상 로그인 화면
  });
})();
