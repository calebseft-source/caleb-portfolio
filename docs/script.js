/* ============================================================
   YOUR PROJECTS: edit this list to change the Work section.
   ============================================================
   Each project needs:
     title       ... the name shown on the card
     url         ... the live site (the preview image is generated
                     automatically from this URL)
     description ... one short sentence about the project

   A project with no public URL can instead use:
     images ... a list of screenshot paths, shown as a slideshow
     badge  ... the small chip text shown under the description

   To add a project: copy one of the blocks below (including the
   curly braces and trailing comma) and change the values.
   To remove one: delete its block. That's it. The page rebuilds
   the cards automatically.
   ============================================================ */

const PROJECTS = [
  {
    title: "Xtreme Gracie Jiu Jitsu",
    url: "https://xtreme-gracie.higgsfield.app/",
    description: "Cinematic multi page website for a Florida martial arts gym, with programs, schedules, pricing, and photo galleries.",
  },
  {
    title: "LeadRadar",
    url: "https://web-production-dd55e.up.railway.app/",
    description: "A freelance lead finder that scans local businesses, audits their websites, and surfaces the ones that need a developer.",
  },
];

/* Cards for the Apps and widgets section, same format as PROJECTS. */
const APPS = [
  {
    title: "Calculator Vault",
    images: ["assets/calc1.png", "assets/calc2.png", "assets/calc3.png"],
    badge: "Desktop app",
    description: "A fully working calculator that secretly doubles as a private photo vault. The right code on the keypad unlocks a hidden album where whole folders can be moved in, browsed, and moved back out.",
  },
];

/* How many animated "Coming Soon" placeholder cards to show after
   your web projects. Set to 0 once you have enough work listed. */
const COMING_SOON_CARDS = 1;

/* ============================================================
   Everything below renders the cards. No need to touch it.
   ============================================================ */

// Screenshot previews come from WordPress mShots, a free service
// that returns a live screenshot of any public URL. While it
// generates a brand new screenshot it serves a 400x300 loading
// image, so we retry a few times until the real one appears.
function previewSrc(url, attempt) {
  const base = "https://s0.wp.com/mshots/v1/" + encodeURIComponent(url) + "?w=1200&h=750";
  return attempt > 0 ? base + "&retry=" + attempt : base;
}

function loadPreview(img, url) {
  const MAX_ATTEMPTS = 8;
  const RETRY_MS = 4000;
  const STALL_MS = 15000;
  const preview = img.closest(".card-preview");
  let attempt = 0;

  // If nothing has loaded after STALL_MS (blocked network, dead URL),
  // show the letter tile instead of an empty box. An image that
  // arrives late still replaces it.
  const watchdog = setTimeout(() => {
    if (!img.complete || img.naturalWidth === 0) {
      preview.classList.add("no-image");
    }
  }, STALL_MS);

  img.addEventListener("load", () => {
    const stillGenerating = img.naturalWidth === 400 && img.naturalHeight === 300;
    if (stillGenerating && attempt < MAX_ATTEMPTS) {
      attempt += 1;
      setTimeout(() => { img.src = previewSrc(url, attempt); }, RETRY_MS);
    } else {
      clearTimeout(watchdog);
      preview.classList.remove("no-image");
    }
  });

  img.addEventListener("error", () => {
    clearTimeout(watchdog);
    preview.classList.add("no-image");
  });

  img.src = previewSrc(url, 0);
}

function renderGrid(list, gridId, soonCount) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";

  list.forEach((project) => {
    if (project.images) {
      grid.appendChild(buildSlideshowCard(project));
      return;
    }

    const domain = new URL(project.url).hostname.replace(/^www\./, "");

    const card = document.createElement("a");
    card.className = "card";
    card.href = project.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const preview = document.createElement("div");
    preview.className = "card-preview";

    const img = document.createElement("img");
    img.alt = "Preview of " + domain;

    const fallback = document.createElement("div");
    fallback.className = "preview-fallback";
    fallback.textContent = domain.charAt(0).toUpperCase();

    const hint = document.createElement("span");
    hint.className = "preview-hint";
    hint.textContent = "Visit site ↗";

    preview.append(img, fallback, hint);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.textContent = project.description;

    const domainTag = document.createElement("span");
    domainTag.className = "card-domain";
    domainTag.textContent = domain;

    body.append(title, desc, domainTag);
    card.append(preview, body);
    grid.appendChild(card);

    loadPreview(img, project.url);
  });

  for (let i = 0; i < soonCount; i++) {
    grid.appendChild(buildComingSoonCard());
  }
}

function buildSlideshowCard(project) {
  const card = document.createElement("div");
  card.className = "card card-static";

  const preview = document.createElement("div");
  preview.className = "card-preview slide-preview";

  const imgs = project.images.map((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = project.title + " screenshot " + (i + 1);
    img.className = "slide-img" + (i === 0 ? " on" : "");
    preview.appendChild(img);
    return img;
  });

  const dots = document.createElement("div");
  dots.className = "slide-dots";
  const dotEls = project.images.map((_, i) => {
    const d = document.createElement("span");
    if (i === 0) d.className = "on";
    dots.appendChild(d);
    return d;
  });
  preview.appendChild(dots);

  // The visible slide glides out to the left while the next one
  // slides in from the right. Once the old slide is fully offscreen
  // it snaps back to the right side with transitions disabled, ready
  // for its next turn.
  let idx = 0;
  setInterval(() => {
    const cur = imgs[idx];
    const next = (idx + 1) % imgs.length;

    cur.classList.remove("on");
    cur.classList.add("off");
    imgs[next].classList.add("on");

    dotEls[idx].classList.remove("on");
    dotEls[next].classList.add("on");

    setTimeout(() => {
      cur.classList.add("snap");
      cur.classList.remove("off");
      void cur.offsetWidth;
      cur.classList.remove("snap");
    }, 800);

    idx = next;
  }, 3400);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.textContent = project.title;

  const desc = document.createElement("p");
  desc.textContent = project.description;

  const chip = document.createElement("span");
  chip.className = "card-domain";
  chip.textContent = project.badge || "Personal project";

  body.append(title, desc, chip);
  card.append(preview, body);
  return card;
}

/* Matrix style decode for the Coming Soon label: characters boot up
   as flickering glyphs and resolve into the real text left to right,
   then re scramble every few seconds. Driven by requestAnimationFrame
   so the flicker stays frame synced and smooth. */
const SCRAMBLE_GLYPHS = "!<>-_\\/[]{}=+*^?#@$%&0123456789ABCDEF";

function startScramble(host, text) {
  const chars = [...text];
  const spans = chars.map((ch) => {
    const s = document.createElement("span");
    s.className = "sc";
    if (ch === " ") {
      s.classList.add("sp");
      s.textContent = " ";
    } else {
      s.textContent = ch;
    }
    host.appendChild(s);
    return s;
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const randGlyph = () => SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];

  function run() {
    let frame = 0;
    let maxEnd = 0;
    const plan = chars.map((ch, i) => {
      const start = i * 2.5 + Math.random() * 6;
      const end = start + 10 + Math.random() * 14;
      if (end > maxEnd) maxEnd = end;
      return { start, end };
    });

    function tick() {
      spans.forEach((s, i) => {
        if (chars[i] === " ") return;
        if (frame >= plan[i].end) {
          s.textContent = chars[i];
          s.classList.remove("glitch");
        } else if (frame % 2 === 0) {
          s.textContent = randGlyph();
          s.classList.add("glitch");
        }
      });
      frame++;
      if (frame <= maxEnd) {
        requestAnimationFrame(tick);
      } else {
        // Loop is over: make sure every cell shows its real character
        spans.forEach((s, i) => {
          if (chars[i] === " ") return;
          s.textContent = chars[i];
          s.classList.remove("glitch");
        });
        setTimeout(run, 5000 + Math.random() * 5000);
      }
    }
    requestAnimationFrame(tick);
  }

  setTimeout(run, 600);
}

function buildComingSoonCard() {
  const card = document.createElement("div");
  card.className = "card card-soon";

  const preview = document.createElement("div");
  preview.className = "card-preview soon-preview";

  const mark = document.createElement("div");
  mark.className = "soon-mark";
  mark.innerHTML =
    '<svg width="38" height="38" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect width="28" height="28" rx="8" fill="url(#logoGrad)"/>' +
    '<path d="M10.5 9.5 6 14l4.5 4.5M17.5 9.5 22 14l-4.5 4.5M16 8l-4 12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const line = document.createElement("div");
  line.className = "soon-line";
  const label = document.createElement("span");
  label.className = "soon-label";
  const cursor = document.createElement("span");
  cursor.className = "soon-cursor";
  line.append(label, cursor);
  startScramble(label, "Coming Soon");

  preview.append(mark, line);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.textContent = "Coming Soon";

  const desc = document.createElement("p");
  desc.textContent = "The next project is already in the works. Check back shortly.";

  const chip = document.createElement("span");
  chip.className = "card-domain soon-chip";
  chip.innerHTML = '<span class="soon-dot"></span>In progress';

  body.append(title, desc, chip);
  card.append(preview, body);
  return card;
}

renderGrid(PROJECTS, "work-grid", COMING_SOON_CARDS);
renderGrid(APPS, "apps-grid", 0);
document.getElementById("year").textContent = new Date().getFullYear();

// LinkedIn placeholder: same matrix decode as the Coming Soon label
const linkedinStatus = document.getElementById("linkedin-status");
if (linkedinStatus) startScramble(linkedinStatus, "Not available");

/* ============================================================
   SEA LIFE: tiny silhouettes drifting by behind the page.
   Purely decorative. Small fish pass now and then; bigger
   visitors (shark, whale, octopus, turtle, jellyfish) are rare.
   Delete this whole section to turn the ocean off.
   ============================================================ */

const OCEAN = {
  fish: {
    w: [18, 26], dur: [20, 32], op: 0.68, bob: [2.2, 3.6],
    svg: '<svg viewBox="0 0 32 16" xmlns="http://www.w3.org/2000/svg"><path d="M28 8c0 3.2-5.5 6-11.5 6-4 0-7.8-1.6-10-3.6L1 14l1.9-6L1 2l5.5 3.6C8.7 3.6 12.5 2 16.5 2 22.5 2 28 4.8 28 8Z"/></svg>',
  },
  angelfish: {
    w: [15, 21], dur: [22, 34], op: 0.65, bob: [1.8, 2.8],
    svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c-3.2 4.2-6.2 6.6-9.6 7.2-1 2-2.6 3.6-5.2 4.6.7-2 .9-3.9.5-5.7L1 15.8 4.4 12 1 8.2l6.7-2.3c.4-1.8.2-3.7-.5-5.7 2.6 1 4.2 2.6 5.2 4.6 3.4.6 6.4 3 9.6 7.2Z"/></svg>',
  },
  slimfish: {
    w: [26, 36], dur: [16, 26], op: 0.62, bob: [2, 3],
    svg: '<svg viewBox="0 0 40 10" xmlns="http://www.w3.org/2000/svg"><path d="M38 5c-4 2.4-12 4-20 4-4.5 0-9-.6-13-1.8L1 9.5 2.2 5 1 .5l4 2.3C9 1.6 13.5 1 18 1c8 0 16 1.6 20 4Z"/></svg>',
  },
  shark: {
    w: [58, 78], dur: [24, 34], op: 0.5, bob: [3.2, 4.6],
    svg: '<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><path d="M62 16c-7 3.4-17 5.6-28 5.6-8.4 0-16-1.8-21.6-4.4L4 22l1.6-7L3 7l8 5c3.4-1.6 7.4-2.8 11.8-3.4L29 2l2.6 6c12 .2 24 3.4 30.4 8Z"/></svg>',
  },
  whale: {
    w: [88, 118], dur: [42, 56], op: 0.42, bob: [4.5, 6],
    svg: '<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg"><path d="M94 21c-3.4 6-15 9.6-33 9.6-20 0-37-5.2-45-11L6 28l1.2-9L4 9l10 5.6C22 6.4 40 2.4 58 4.4c17.6 2 33 8 36 16.6Z"/></svg>',
  },
  hammerhead: {
    w: [60, 80], dur: [24, 34], op: 0.5, bob: [3.2, 4.6],
    svg: '<svg viewBox="0 0 68 24" xmlns="http://www.w3.org/2000/svg"><path d="M56 15.5c-5 3-13.5 5.6-23 5.6-8.4 0-15.5-1.8-21-4.4L4 22l1.6-7L3 7l8 5c5.5-2.6 12.6-4.4 21-4.4l3.4-5.6 2.6 6c7 .4 13 2.2 18 5.5Z M57.5 4c0-1.7 1.3-3 3-3h1c2 0 3.5 1.6 3.5 3.5v15c0 1.9-1.5 3.5-3.5 3.5h-1c-1.7 0-3-1.3-3-3Z"/></svg>',
  },
  manta: {
    w: [42, 56], dur: [30, 42], op: 0.45, bob: [3.5, 5],
    svg: '<svg viewBox="0 0 48 20" xmlns="http://www.w3.org/2000/svg"><path d="M24 2c8 0 16 4 23 10-6 1-11 .6-15-1-1.6 3-4 5-8 5s-6.4-2-8-5c-4 1.6-9 2-15 1C8 6 16 2 24 2Z M9 10.5 1 12l7.4 1Z"/></svg>',
  },
  submarine: {
    w: [64, 84], dur: [38, 52], op: 0.45, bob: [5, 7],
    svg: '<svg viewBox="0 0 72 26" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 13h46a6 6 0 0 1 0 12H12a6 6 0 0 1 0-12Z M40 6h10a2 2 0 0 1 2 2v5H38V8a2 2 0 0 1 2-2Z M44 1.5h1.6v5H44Z M44 1.5h4.6v1.6H44Z M12 14.5 4 10.5v13l8-4Z M18 17a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 1 0-4.4 0Z M28 17a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 1 0-4.4 0Z M48 17a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 1 0-4.4 0Z"/></svg>',
  },
  octopus: {
    w: [32, 42], dur: [30, 42], op: 0.48, bob: [2.4, 3.2],
    svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 2c8 0 14 5 14 12 0 3.6-1.6 5.8-3.8 7.6 1 3.6 2.8 5.6 5.8 7.2-3.6 1.2-6.4.4-8.4-1.6-.8 3 0 5.6 1.8 8.4-3 0-5.4-1.8-6.6-4.6-1 2.8-.8 5.6.8 8.6-2.8-1-4.8-3-5.6-5.8-1.8 2.6-4 4.4-7.4 5.2 1.2-2.8 1.8-5.4 1-8.2-2.8 1.8-5.6 2.4-8.6 1.4 2.8-2 4.6-4.4 4.8-7.4C5.6 21 4 18.8 4 15 4 7.6 11 2 20 2Z"/></svg>',
  },
  turtle: {
    w: [38, 50], dur: [32, 44], op: 0.48, bob: [3, 4.2],
    svg: '<svg viewBox="0 0 48 28" xmlns="http://www.w3.org/2000/svg"><path d="M39 13.4c2.8-.4 5.6.2 7.4 2-1.8 1.6-4.4 2.2-7 1.8-.8 2.2-2.6 4-5 5.2 1 1.6 1.2 3.2.6 5-2-.6-3.6-1.8-4.6-3.6-2 .4-4.2.6-6.4.6-2.2 0-4.4-.2-6.4-.6-1 1.8-2.6 3-4.6 3.6-.6-1.8-.4-3.4.6-5-2.4-1.2-4.2-3-5-5.2-2.6.4-5.2-.2-7-1.8 1.8-1.8 4.6-2.4 7.4-2C10.2 7 16.4 3 24 3s13.8 4 15 10.4Z"/></svg>',
  },
  jelly: {
    w: [18, 26], dur: [28, 38], op: 0.48, bob: [2.6, 3.4], vertical: true,
    svg: '<svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.6 0 10 4.2 10 9.6 0 2.2-1 3.6-2.8 4.6l.8 15.4-2.8-8.6-1.8 11.4-2.6-10.4-2.6 10.4-1.8-11.4-2.8 8.6.8-15.4C3 15.2 2 13.8 2 11.6 2 6.2 6.4 2 12 2Z"/></svg>',
  },
};

const seaEl = document.getElementById("sealife");
const seaRand = (a, b) => a + Math.random() * (b - a);
const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function spawnCreature(kind, shared) {
  if (!seaEl || seaEl.children.length >= 9) return;
  const spec = OCEAN[kind];
  const el = document.createElement("div");
  el.className = "creature";

  const w = seaRand(spec.w[0], spec.w[1]);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x0, x1, y0, y1, flip;

  if (spec.vertical) {
    x0 = seaRand(vw * 0.1, vw * 0.9);
    x1 = x0 + seaRand(-50, 50);
    y0 = vh + 80;
    y1 = -140;
    flip = 1;
  } else {
    const dir = shared ? shared.dir : Math.random() < 0.5 ? 1 : -1;
    x0 = dir > 0 ? -w - 60 : vw + 60;
    x1 = dir > 0 ? vw + 60 : -w - 60;
    y0 = shared
      ? Math.min(vh * 0.85, Math.max(vh * 0.06, shared.y + seaRand(-34, 34)))
      : seaRand(vh * 0.08, vh * 0.8);
    y1 = y0 + seaRand(-70, 70);
    flip = dir; // silhouettes are drawn facing right
  }

  el.style.setProperty("--x0", x0 + "px");
  el.style.setProperty("--x1", x1 + "px");
  el.style.setProperty("--y0", y0 + "px");
  el.style.setProperty("--y1", y1 + "px");
  el.style.setProperty("--w", w + "px");
  el.style.setProperty("--op", spec.op);
  el.style.setProperty("--flip", flip);
  el.style.setProperty("--dur", seaRand(spec.dur[0], spec.dur[1]) + "s");
  el.style.setProperty("--bobdur", seaRand(spec.bob[0], spec.bob[1]) + "s");
  el.innerHTML = spec.svg;

  el.addEventListener("animationend", (e) => {
    if (e.animationName === "creature-swim") el.remove();
  });
  seaEl.appendChild(el);
}

function fishLoop() {
  const school = 1 + Math.floor(Math.random() * 3);
  const species = ["fish", "fish", "angelfish", "slimfish"][Math.floor(Math.random() * 4)];
  const shared = {
    dir: Math.random() < 0.5 ? 1 : -1,
    y: seaRand(window.innerHeight * 0.1, window.innerHeight * 0.78),
  };
  for (let i = 0; i < school; i++) {
    setTimeout(() => spawnCreature(species, shared), i * seaRand(500, 1100));
  }
  setTimeout(fishLoop, seaRand(4500, 9000));
}

function rareLoop() {
  const r = Math.random();
  const kind =
    r < 0.18 ? "shark"
    : r < 0.34 ? "hammerhead"
    : r < 0.5 ? "octopus"
    : r < 0.65 ? "turtle"
    : r < 0.78 ? "whale"
    : r < 0.88 ? "jelly"
    : r < 0.96 ? "manta"
    : "submarine";
  spawnCreature(kind);
  setTimeout(rareLoop, seaRand(30000, 65000));
}

if (!calmMotion && seaEl) {
  setTimeout(fishLoop, 3000);
  setTimeout(rareLoop, seaRand(12000, 25000));
}
