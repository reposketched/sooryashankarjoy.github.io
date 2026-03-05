/*
  Minimal JS for a fast, content-first site:
  - Fill current year in footer.
  - Highlight the active page in the top navigation.
*/

(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const nav = document.querySelector("nav.topnav");
  if (!nav) return;

  const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = Array.from(nav.querySelectorAll("a[href]"));

  for (const a of links) {
    const href = (a.getAttribute("href") || "").trim();
    if (!href) continue;
    if (href.startsWith("http")) continue;

    const file = href.replace("./", "").toLowerCase();
    const isActive = (current === "" && file === "index.html") || current === file || (current === "index.html" && (file === "" || file === "index.html"));
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
})();

