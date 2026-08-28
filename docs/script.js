const nav = document.getElementById("site-nav");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("primary-nav-menu");

function closeMenu() {
  if (!nav || !navToggle) return;
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}

if (nav && navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (nav.classList.contains("open") && !nav.contains(event.target)) closeMenu();
  });
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

/* ============================================================
   Progressive enhancements: scroll reveals, scroll progress,
   and active-section highlighting in the nav.
   All of it is optional. With JavaScript off, or motion reduced,
   the page stays complete and fully readable.
   ============================================================ */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supported = "IntersectionObserver" in window;

  /* ---- Reveal on scroll ---- */
  var targets = document.querySelectorAll("[data-reveal]");
  if (targets.length && supported && !reduced) {
    document.documentElement.classList.add("has-reveal");

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    targets.forEach(function (el) {
      // Stagger children of a group so a row of cards arrives in sequence.
      var group = el.closest("[data-reveal-group]");
      if (group) {
        var peers = Array.prototype.slice.call(group.querySelectorAll("[data-reveal]"));
        var i = peers.indexOf(el);
        if (i > 0) el.style.setProperty("--reveal-delay", Math.min(i, 6) * 70 + "ms");
      }
      revealer.observe(el);
    });

    // Anything already on screen at load must not wait for a scroll, and
    // must not depend on requestAnimationFrame: rAF is paused in a
    // background or non-rendering tab, which would strand content at
    // opacity 0. This runs synchronously instead. If the viewport cannot
    // be measured, reveal everything rather than risk hiding the page.
    var revealInView = function () {
      var vh = window.innerHeight || 0;
      targets.forEach(function (el) {
        if (el.classList.contains("is-revealed")) return;
        if (!vh || el.getBoundingClientRect().top < vh * 0.92) {
          el.classList.add("is-revealed");
          revealer.unobserve(el);
        }
      });
    };

    // Run it now, and again once the page has settled. The second pass
    // matters for deep links: the browser jumps to #section AFTER this
    // script runs, so the first pass measures the wrong scroll position
    // and would leave the landed-on section invisible.
    revealInView();
    window.addEventListener("load", revealInView);
    window.setTimeout(revealInView, 250);
    if (window.location.hash) window.setTimeout(revealInView, 700);

    // Scroll-driven backstop. The observer normally does this work, but a
    // cheap throttled check on scroll guarantees a section never stays
    // blank if the observer misses it, which was happening on deep links.
    // Deliberately NOT requestAnimationFrame. rAF is paused in background
    // and non-rendering tabs, which is exactly when content must not be
    // left blank. A plain throttle keeps this working everywhere.
    var revealTick = false;
    window.addEventListener("scroll", function () {
      if (revealTick) return;
      revealTick = true;
      window.setTimeout(function () {
        revealInView();
        revealTick = false;
      }, 100);
    }, { passive: true });

    // Last-resort failsafe. If the observer never delivers (an old engine,
    // a stalled tab), drop the hidden state entirely after a few seconds
    // so no visitor is ever left looking at blank sections.
    window.setTimeout(function () {
      if (!document.querySelector("[data-reveal]:not(.is-revealed)")) return;
      var stuck = document.querySelectorAll("[data-reveal]:not(.is-revealed)");
      var anyOnScreen = false;
      Array.prototype.forEach.call(stuck, function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < (window.innerHeight || 0) && box.bottom > 0) anyOnScreen = true;
      });
      if (anyOnScreen) document.documentElement.classList.remove("has-reveal");
    }, 1500);
  }

  /* ---- Scroll progress bar ---- */
  var bar = document.querySelector(".scroll-progress");
  if (bar && !reduced) {
    var ticking = false;
    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty("--progress", pct.toFixed(4));
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---- Highlight the section you are reading in the nav ---- */
  var links = document.querySelectorAll('#primary-nav-menu a[href^="#"]');
  if (links.length && supported) {
    var byId = {};
    var watched = [];
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = id && document.getElementById(id);
      if (!section) return;
      byId[id] = link;
      watched.push(section);
    });

    if (watched.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            Object.keys(byId).forEach(function (k) { byId[k].removeAttribute("aria-current"); });
            link.setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      watched.forEach(function (s) { spy.observe(s); });
    }
  }
})();

/* ============================================================
   Lenis smooth scroll (vendored locally, MIT, v1.1.18).
   Self-hosted on purpose: a CDN copy would be blocked by this
   site's script-src 'self' policy and would contradict the
   privacy policy's no-third-party-scripts statement.

   Tuned deliberately short. The default feel is slower than a
   sales page should be. Touch is left completely native, because
   phones already have real momentum scrolling and hijacking it
   makes a page feel worse, not better.
   ============================================================ */
(function () {
  if (typeof window.Lenis !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lenis = new window.Lenis({
    duration: 0.9,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.6
  });

  // Hand scroll behaviour fully to Lenis. See the note in styles.css for
  // why this class cannot contain the substring "lenis".
  document.documentElement.classList.add("smooth-active");

  function raf(time) {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  }
  window.requestAnimationFrame(raf);

  // Keep in-page links smooth and clear of the sticky header.
  var NAV_OFFSET = -92;
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: NAV_OFFSET });
    if (history.replaceState) history.replaceState(null, "", hash);
  });

  // If the page is opened on a deep link, Lenis should own that jump too.
  if (window.location.hash) {
    var initial = document.querySelector(window.location.hash);
    if (initial) {
      window.setTimeout(function () {
        lenis.scrollTo(initial, { offset: NAV_OFFSET, immediate: true });
      }, 0);
    }
  }

  window.addEventListener("beforeprint", function () { lenis.stop(); });
  window.addEventListener("afterprint", function () { lenis.start(); });
})();

/* ============================================================
   CODE RAIN: sparse green glyph drops. Each one fades in at a
   random spot, drifts slowly down, then fades out and is removed.
   A spawner keeps a small number alive at once so the screen never
   feels cluttered. Three depth tiers vary size, speed, and opacity.
   Transform + opacity only, so it stays smooth. Pairs with the
   circuit SVG in index.html. Delete this section (and #coderain /
   #circuit) to turn it off.
   ============================================================ */
const RAIN_GLYPHS = "01<>[]{}=+*/#$%&?ABCDEF0123456789";
const rainEl = document.getElementById("coderain");
const rainCalm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Slow fall, gentle opacity. near = closest/brightest/fastest.
// life and drift are scaled together, so the fall SPEED (drift/life)
// is unchanged from before — only the lifespan is shorter, which
// makes drops fade in and out quicker.
const RAIN_TIERS = [
  { cls: "far", size: 12, op: 0.10, life: [10, 15], drift: [80, 150] },
  { cls: "mid", size: 15, op: 0.15, life: [8, 12], drift: [120, 200] },
  { cls: "near", size: 18, op: 0.20, life: [6, 10], drift: [170, 270] },
];
const RAIN_MAX = 11; // how many drops may be on screen at once

const rainRand = (a, b) => a + Math.random() * (b - a);
const randGlyphR = () => RAIN_GLYPHS[Math.floor(Math.random() * RAIN_GLYPHS.length)];

function spawnDrop() {
  if (!rainEl) return;
  if (rainEl.children.length >= RAIN_MAX) return;

  const tier = RAIN_TIERS[Math.floor(Math.random() * RAIN_TIERS.length)];
  const col = document.createElement("div");
  col.className = "mcol " + tier.cls;

  const glyphs = Math.round(rainRand(7, 16));
  let strip = "";
  for (let g = 0; g < glyphs; g++) strip += randGlyphR() + "\n";
  col.textContent = strip;

  // Random point on screen to appear, then a slow downward drift.
  const startY = rainRand(-60, window.innerHeight * 0.55);
  const drift = rainRand(tier.drift[0], tier.drift[1]);
  const life = rainRand(tier.life[0], tier.life[1]);

  col.style.left = rainRand(0, window.innerWidth - 20) + "px";
  col.style.fontSize = tier.size + "px";
  col.style.setProperty("--y0", startY + "px");
  col.style.setProperty("--y1", startY + drift + "px");
  col.style.setProperty("--op", tier.op);
  col.style.setProperty("--life", life + "s");

  col.dataset.glyphs = glyphs;
  col.addEventListener("animationend", (e) => {
    if (e.animationName === "mcol-fade") col.remove();
  });
  rainEl.appendChild(col);
}

function rainLoop() {
  spawnDrop();
  setTimeout(rainLoop, rainRand(700, 1700));
}

// Every live drop cycles its glyphs rapidly as it falls — close to the
// speed of the "Coming Soon" scramble. This only rewrites text content;
// the fall/fade animations are untouched, so the scroll speed stays
// exactly the same.
function flickerRain() {
  const cols = rainEl ? rainEl.children : [];
  for (let c = 0; c < cols.length; c++) {
    const col = cols[c];
    const chars = col.textContent.split("\n");
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] && Math.random() < 0.7) chars[i] = randGlyphR();
    }
    col.textContent = chars.join("\n");
  }
  setTimeout(flickerRain, 40);
}

if (!rainCalm && rainEl) {
  // Seed a few so the page does not start empty.
  for (let i = 0; i < 5; i++) setTimeout(spawnDrop, i * 400);
  setTimeout(rainLoop, 1200);
  setTimeout(flickerRain, 800);
}


/* ============================================================
   MATRIX DECODE TEXT, restored 2026-08-27
   Characters boot up as flickering glyphs and resolve into the
   real text. The real characters are written into the DOM first,
   so the text is correct for screen readers and for anyone with
   reduced motion, who simply sees it plain.

   Changed from the original: it decodes ONCE instead of looping
   every few seconds. Endless re-scrambling reads as a broken page
   on a sales site rather than as a flourish.
   ============================================================ */
var SCRAMBLE_GLYPHS = "!<>-_\/[]{}=+*^?#@$%&0123456789ABCDEF";

function startScramble(host, text) {
  var chars = Array.prototype.slice.call(text);
  var spans = chars.map(function (ch) {
    var el = document.createElement("span");
    el.className = "sc";
    if (ch === " ") { el.classList.add("sp"); el.textContent = " "; }
    else { el.textContent = ch; }
    host.appendChild(el);
    return el;
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var randGlyph = function () {
    return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
  };

  var frame = 0;
  var maxEnd = 0;
  var plan = chars.map(function (ch, i) {
    var start = i * 2.5 + Math.random() * 6;
    var end = start + 10 + Math.random() * 14;
    if (end > maxEnd) maxEnd = end;
    return { start: start, end: end };
  });

  function settle() {
    spans.forEach(function (el, i) {
      if (chars[i] === " ") return;
      el.textContent = chars[i];
      el.classList.remove("glitch");
    });
  }

  function tick() {
    spans.forEach(function (el, i) {
      if (chars[i] === " ") return;
      if (frame >= plan[i].end) {
        el.textContent = chars[i];
        el.classList.remove("glitch");
      } else if (frame >= plan[i].start && frame % 2 === 0) {
        el.textContent = randGlyph();
        el.classList.add("glitch");
      }
    });
    frame++;
    if (frame <= maxEnd) window.requestAnimationFrame(tick);
    else settle();
  }

  // Never leave text mid-scramble if rAF is paused (background tab).
  window.setTimeout(settle, 3000);
  window.requestAnimationFrame(tick);
}

/* Decode the small eyebrow labels as they scroll into view. The H1 is
   deliberately left alone: scrambling the main value proposition
   delays comprehension on a page whose job is converting a visitor. */
(function () {
  var eyebrows = document.querySelectorAll(".eyebrow");
  if (!eyebrows.length || !("IntersectionObserver" in window)) return;

  var seen = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      var el = entry.target;
      var text = (el.textContent || "").trim();
      if (!text || text.length > 60) return;
      el.textContent = "";
      startScramble(el, text);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });

  eyebrows.forEach(function (el) { io.observe(el); });
})();
