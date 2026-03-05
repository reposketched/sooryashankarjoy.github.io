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

  /* Blog: Markdown rendering (minimal) */
  function escapeHtml(s) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderInline(text) {
    // links: [text](url)
    let out = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, url) => {
      const safeT = escapeHtml(String(t));
      const safeUrl = escapeHtml(String(url));
      const rel = safeUrl.startsWith("http") ? ' rel="noreferrer"' : "";
      return `<a href="${safeUrl}"${rel}>${safeT}</a>`;
    });
    // inline code: `code`
    out = out.replace(/`([^`]+)`/g, (_m, c) => `<code>${escapeHtml(String(c))}</code>`);
    return out;
  }

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inCode = false;
    let codeLang = "";
    let codeBuf = [];
    let inUl = false;

    function closeUl() {
      if (inUl) {
        html += "</ul>";
        inUl = false;
      }
    }

    for (const raw of lines) {
      const line = raw;
      const fence = line.match(/^```(\w+)?\s*$/);
      if (fence) {
        if (!inCode) {
          closeUl();
          inCode = true;
          codeLang = fence[1] || "";
          codeBuf = [];
        } else {
          inCode = false;
          const safe = escapeHtml(codeBuf.join("\n"));
          const cls = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
          html += `<pre><code${cls}>${safe}</code></pre>`;
          codeLang = "";
          codeBuf = [];
        }
        continue;
      }

      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) {
        closeUl();
        const level = h[1].length;
        html += `<h${level}>${renderInline(escapeHtml(h[2]))}</h${level}>`;
        continue;
      }

      const li = line.match(/^\s*-\s+(.*)$/);
      if (li) {
        if (!inUl) {
          html += "<ul>";
          inUl = true;
        }
        html += `<li>${renderInline(escapeHtml(li[1]))}</li>`;
        continue;
      }

      if (line.trim() === "") {
        closeUl();
        continue;
      }

      closeUl();
      html += `<p>${renderInline(escapeHtml(line))}</p>`;
    }

    closeUl();
    return html;
  }

  async function initBlogIndex() {
    const mount = $("#blogIndex");
    if (!mount) return;
    try {
      const res = await fetch("./blog/posts.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`posts.json ${res.status}`);
      const data = await res.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];
      posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

      const items = posts
        .map((p) => {
          const slug = encodeURIComponent(String(p.slug || ""));
          const title = escapeHtml(String(p.title || "Untitled"));
          const date = escapeHtml(String(p.date || ""));
          const summary = escapeHtml(String(p.summary || ""));
          const tags = Array.isArray(p.tags) ? p.tags : [];
          const tagHtml = tags
            .slice(0, 6)
            .map((t) => `<span class="tag">${escapeHtml(String(t))}</span>`)
            .join("");
          return `
            <article class="post">
              <div class="post-meta">${date}</div>
              <div class="post-title"><a href="./blog-post.html?p=${slug}">${title}</a></div>
              <p class="muted">${summary}</p>
              <div class="tags" aria-label="Tags">${tagHtml}</div>
            </article>
          `;
        })
        .join("");

      mount.innerHTML = items || `<p class="muted">No posts yet. Add one under <code>blog/posts/</code>.</p>`;
    } catch (e) {
      mount.innerHTML = `<p class="muted">Could not load blog index. (${escapeHtml(String(e))})</p>`;
    }
  }

  async function initBlogPost() {
    const mount = $("#blogPost");
    if (!mount) return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("p") || "";
    if (!slug) {
      mount.innerHTML = `<p class="muted">Missing post parameter. Go back to <a href="./blog.html">blog</a>.</p>`;
      return;
    }
    try {
      const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
      const res = await fetch(`./blog/posts/${safeSlug}.md`, { cache: "no-store" });
      if (!res.ok) throw new Error(`post ${res.status}`);
      const md = await res.text();
      mount.innerHTML = renderMarkdown(md);
    } catch (e) {
      mount.innerHTML = `<p class="muted">Could not load post. Go back to <a href="./blog.html">blog</a>.</p>`;
    }
  }

  /* Init */
  initTheme();
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  initMenu();
  initNavCurrent();
  initProjectFilters();
  initAccordion();
  // Blog (only runs if mounts exist)
  void initBlogIndex();
  void initBlogPost();
})();

