(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = "Ready";

  const lastUpdateEl = document.getElementById("lastUpdate");
  if (lastUpdateEl) {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(now);
      lastUpdateEl.textContent = formatted;
    } catch {
      lastUpdateEl.textContent = new Date().toDateString();
    }
  }
})();
