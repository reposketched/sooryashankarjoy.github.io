/*
  Sooryashankar Joy — site interactions
  - theme toggle + persistence
  - mobile nav
  - smooth in-page scrolling
  - back-to-top
  - projects filters
  - teaching FAQ accordion
*/

(() => {
  const root = document.documentElement;

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  /* Theme */
  const THEME_KEY = "theme";
  const themeBtn = $("#themeToggle");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    // theme: "light" | "dark"
    root.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const initial = stored === "light" || stored === "dark" ? stored : systemPrefersDark() ? "dark" : "light";
    applyTheme(initial);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* Mobile nav */
  const navToggle = $("#navToggle");
  const navPanel = $("#mobileNav");

  function setNavOpen(open) {
    root.setAttribute("data-nav-open", open ? "true" : "false");
    if (navToggle) navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open && navToggle) navToggle.focus({ preventScroll: true });
  }

  function initNav() {
    if (!navToggle || !navPanel) return;

    navToggle.addEventListener("click", () => {
      const open = root.getAttribute("data-nav-open") === "true";
      setNavOpen(!open);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (root.getAttribute("data-nav-open") !== "true") return;
      setNavOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (root.getAttribute("data-nav-open") !== "true") return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (navPanel.contains(target) || navToggle.contains(target)) return;
      setNavOpen(false);
    });
  }

  /* Smooth scrolling for same-page anchors */
  function initSmoothAnchors() {
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const a = target.closest("a[href^=\"#\"]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
      // Close nav if a mobile link was used
      if (root.getAttribute("data-nav-open") === "true") setNavOpen(false);
    });
  }

  /* Back-to-top */
  const topBtn = $("#backToTop");

  function initBackToTop() {
    const onScroll = () => {
      const show = window.scrollY > 700;
      root.setAttribute("data-show-top", show ? "true" : "false");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* Projects filter chips */
  function initProjectFilters() {
    const wrap = $("#projectFilters");
    const grid = $("#projectsGrid");
    if (!wrap || !grid) return;

    const buttons = $$(".chip-btn[data-filter]", wrap);
    const cards = $$(".project-card[data-categories]", grid);

    function setActive(filter) {
      for (const btn of buttons) {
        const active = btn.getAttribute("data-filter") === filter;
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      }
    }

    function apply(filter) {
      for (const card of cards) {
        const cats = (card.getAttribute("data-categories") || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const show = filter === "all" || cats.includes(filter);
        card.hidden = !show;
      }
      setActive(filter);
    }

    wrap.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const btn = t.closest(".chip-btn[data-filter]");
      if (!btn) return;
      const filter = (btn.getAttribute("data-filter") || "all").toLowerCase();
      apply(filter);
    });

    // Default: All
    apply("all");
  }

  /* Teaching FAQ accordion */
  function initAccordion() {
    const acc = $("#teachingFaq");
    if (!acc) return;

    acc.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const btn = t.closest("button[data-accordion-trigger]");
      if (!btn) return;
      const id = btn.getAttribute("aria-controls");
      if (!id) return;
      const panel = document.getElementById(id);
      if (!panel) return;

      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  }

  /* Init */
  initTheme();

  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  initNav();
  initSmoothAnchors();
  initBackToTop();
  initProjectFilters();
  initAccordion();
})();

