/* ショートカットバー公式サイト — 動きと「その場で試す」換算
   ★換算表はアプリ本体 sbar/search.py の _PIPE_B2A / _UNIT_TABLE の写し。本体を変えたらここも変える */
(function () {
  "use strict";
  var d = document;

  // ---- ヘッダーの下線 ----
  var hdr = d.querySelector(".hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---- 出てくる演出（見えない環境では最初から見せる） ----
  var rv = d.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  // ---- ヒーローの着せ替え ----
  var desk = d.getElementById("desk");
  if (desk) {
    var setW = function () { desk.style.setProperty("--deskw", desk.clientWidth + "px"); var br = desk.querySelector(".bar"); if (br) desk.style.setProperty("--barw", br.clientWidth + "px"); };
    setW(); window.addEventListener("resize", setW);
    var chips = d.querySelectorAll("[data-theme-btn]");
    var cap = d.getElementById("deskcap");
    chips.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-theme-btn");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        desk.querySelectorAll(".bar img").forEach(function (im) { im.classList.toggle("on", im.getAttribute("data-theme") === t); });
        desk.classList.toggle("is-retro", t === "retro");
        if (cap) cap.textContent = b.getAttribute("data-cap") || "";
      });
    });
  }

  // ---- めめ ----
  var lines = ["にゃ", "なでて", "傘いる？", "ゴミ箱まで運ぶよ", "ねむい…"];
  d.querySelectorAll(".meme").forEach(function (m) {
    var bub = m.querySelector(".bubble"), t;
    m.addEventListener("click", function () {
      if (bub) bub.textContent = lines[Math.floor(Math.random() * lines.length)];
      m.classList.add("talk"); clearTimeout(t);
      t = setTimeout(function () { m.classList.remove("talk"); }, 1600);
    });
  });

  // ---- その場で試す: 単位換算と電卓（アプリと同じ表） ----
  var B2A = { "1/8": 6, "1/4": 8, "3/8": 10, "1/2": 15, "3/4": 20, "1": 25, "1-1/4": 32, "1-1/2": 40, "2": 50, "2-1/2": 65,
    "3": 80, "3-1/2": 90, "4": 100, "5": 125, "6": 150, "8": 200, "10": 250, "12": 300 };
  var DEC = { "1.25": "1-1/4", "1.5": "1-1/2", "2.5": "2-1/2", "3.5": "3-1/2" };
  var UNITS = [
    [["mm", "ミリ"], "inch", 1 / 25.4], [["inch", "in", "インチ"], "mm", 25.4],
    [["坪", "tsubo"], "㎡", 400 / 121], [["m2", "平米"], "坪", 121 / 400],
    [["畳", "帖", "j"], "㎡", 1.62], [["m2j", "平米畳"], "畳", 1 / 1.62],
    [["kpa"], "mmAq", 101.9716], [["mmaq"], "kPa", 1 / 101.9716],
    [["mpa"], "kgf/cm²", 10.19716], [["kgf/cm2"], "MPa", 1 / 10.19716],
    [["m3/h"], "L/min", 1000 / 60], [["l/min"], "m³/h", 60 / 1000],
    [["kw"], "kcal/h", 860.0], [["kcal/h"], "kW", 1 / 860.0], [["ps", "馬力"], "kW", 0.7355]
  ];
  // Python の format(x, ",.4g") と同じ見た目にする
  function g4(x) {
    if (x === 0) return "0";
    var e = Math.floor(Math.log10(Math.abs(x)));
    var r = Number(x.toPrecision(4)); e = Math.floor(Math.log10(Math.abs(r)));
    if (e < -4 || e >= 4) {
      var m = (r / Math.pow(10, e)).toPrecision(4).replace(/\.?0+$/, "");
      return m + "e" + (e < 0 ? "-" : "+") + (Math.abs(e) < 10 ? "0" : "") + Math.abs(e);
    }
    var s = r.toFixed(Math.max(0, 3 - e)).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    var p = s.split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return p.join(".");
  }
  function unitTry(expr) {
    var s = (expr || "").trim().toLowerCase()
      .replace(/㎜/g, "mm").replace(/㎡/g, "m2").replace(/″/g, "inch").replace(/"/g, "inch").replace(/ｍｍ/g, "mm");
    if (!s || !/[0-9]/.test(s)) return null;
    var m = s.match(/^([0-9]+(?:-[0-9]+\/[0-9]+)?|[0-9]+\/[0-9]+|[0-9]+\.[0-9]+)\s*b$/);
    if (m) { var k = DEC[m[1]] || m[1]; var a = B2A[k]; return a ? a + "A（呼び径）" : null; }
    m = s.match(/^([0-9]+)\s*a$/);
    if (m) { for (var b in B2A) { if (B2A[b] === parseInt(m[1], 10)) return b + "B（呼び径）"; } return null; }
    m = s.match(/^([0-9]+(?:\.[0-9]+)?)\s*([a-z0-9/㎡²]+|坪|平米|畳|帖|ミリ|インチ|馬力)$/);
    if (m) {
      var v = parseFloat(m[1]), u = m[2];
      for (var i = 0; i < UNITS.length; i++) { if (UNITS[i][0].indexOf(u) >= 0) return g4(v * UNITS[i][2]) + " " + UNITS[i][1]; }
    }
    return null;
  }
  function calcTry(expr) {
    var s = (expr || "").replace(/×/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
    if (!/^[0-9+\-*/().]+$/.test(s) || !/[0-9]/.test(s) || !/[+\-*/]/.test(s.replace(/^-/, ""))) return null;
    try {
      var v = Function('"use strict";return (' + s + ")")();
      if (typeof v !== "number" || !isFinite(v)) return null;
      v = Math.round(v * 1e8) / 1e8;
      return "= " + v;
    } catch (e) { return null; }
  }
  var inp = d.getElementById("try-in"), out = d.getElementById("try-out");
  if (inp && out) {
    var run = function () {
      var r = unitTry(inp.value) || calcTry(inp.value);
      if (r) { out.textContent = r; out.classList.remove("none"); }
      else { out.textContent = inp.value.trim() ? "換算・計算にならない語は、アプリでは候補の検索やWeb検索に回ります" : "例を押すか、打ってみてください"; out.classList.add("none"); }
    };
    inp.addEventListener("input", run);
    d.querySelectorAll("[data-eg]").forEach(function (b) {
      b.addEventListener("click", function () { inp.value = b.getAttribute("data-eg"); run(); inp.focus(); });
    });
    run();
  }
  window.__sbar = { unitTry: unitTry, calcTry: calcTry, g4: g4 }; // テスト用

  // ---- 最新版の番号（取れなければ黙って隠すのではなく、固定の文言を残す） ----
  var vEl = d.querySelectorAll("[data-latest]");
  if (vEl.length && window.fetch) {
    fetch("https://api.github.com/repos/FutureX-jp/shortcut-bar/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.tag_name) return;
        var dt = (j.published_at || "").slice(0, 10).replace(/-/g, "/");
        vEl.forEach(function (el) { el.textContent = "最新版 " + j.tag_name + (dt ? "（" + dt + "）" : ""); });
      }).catch(function () {});
  }

  // ---- 機能一覧の目次の現在地 ----
  var toc = d.querySelectorAll(".toc a[href^='#']");
  if (toc.length && "IntersectionObserver" in window) {
    var map = {}; toc.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) { toc.forEach(function (a) { a.classList.remove("act"); }); map[e.target.id].classList.add("act"); }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) io2.observe(s); });
  }
})();
