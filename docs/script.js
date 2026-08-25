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
