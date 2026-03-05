/*
  Terminal-inspired site interactions (minimal, fast):
  - Theme toggle (light/dark) with localStorage, default system preference
  - Mobile menu toggle
  - Current-nav underline (aria-current)
  - Projects filters
  - Teaching FAQ accordion
*/

(() => {
  const root = document.documentElement;
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  /* Footer year */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Theme */
  const THEME_KEY = "theme";
  const themeBtn = $("#themeToggle");

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const initial = stored === "light" || stored === "dark" ? stored : getSystemTheme();
    applyTheme(initial);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* Mobile menu */
  const menuBtn = $("#menuToggle");

  function setMenuOpen(open) {
    root.setAttribute("data-menu-open", open ? "true" : "false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function initMenu() {
    if (!menuBtn) return;
    menuBtn.addEventListener("click", () => {
      const open = root.getAttribute("data-menu-open") === "true";
      setMenuOpen(!open);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (root.getAttribute("data-menu-open") !== "true") return;
      setMenuOpen(false);
    });
  }

  /* Current-nav underline */
  function initNavCurrent() {
    const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const links = $$('a[data-nav="true"]');
    for (const a of links) {
      const href = (a.getAttribute("href") || "").replace("./", "").toLowerCase();
      const isIndex = href === "" || href === "index.html" || href === "./";
      const active = (current === "" || current === "index.html") ? isIndex : current === href;
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /* Projects filters */
  function initProjectFilters() {
    const wrap = $("#projectFlags");
    if (!wrap) return;
    const flags = $$(".flag[data-filter]", wrap);
    const entries = $$(".entry[data-categories]");
    if (flags.length === 0 || entries.length === 0) return;

    function setPressed(filter) {
      for (const f of flags) {
        const on = (f.getAttribute("data-filter") || "all") === filter;
        f.setAttribute("aria-pressed", on ? "true" : "false");
      }
    }

    function apply(filter) {
      for (const el of entries) {
        const cats = (el.getAttribute("data-categories") || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const show = filter === "all" || cats.includes(filter);
        el.hidden = !show;
      }
      setPressed(filter);
    }

    wrap.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const btn = t.closest(".flag[data-filter]");
      if (!btn) return;
      apply((btn.getAttribute("data-filter") || "all").toLowerCase());
    });

    apply("all");
  }

  /* Accordion */
  function initAccordion() {
    const acc = $("#faq");
    if (!acc) return;
    acc.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const btn = t.closest("button.acc-btn");
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
  initMenu();
  initNavCurrent();
  initProjectFilters();
  initAccordion();
})();

