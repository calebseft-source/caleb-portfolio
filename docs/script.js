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
