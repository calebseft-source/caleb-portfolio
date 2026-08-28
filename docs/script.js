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
