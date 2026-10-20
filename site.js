(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const themeMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const themeViewTransitionPreference = window.matchMedia("(min-width: 801px) and (pointer: fine)");
  const themeStorageKey = "hoea-theme";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add("is-page-ready"));
  });

  const applyTheme = (theme, { persist = true } = {}) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    const isDark = nextTheme === "dark";

    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    themeToggle?.setAttribute("aria-pressed", String(isDark));
    themeToggle?.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    if (themeColorMeta) themeColorMeta.content = getComputedStyle(root).getPropertyValue(isDark ? '--brand-ocean-900' : '--brand-warm-white').trim();

    if (persist) {
      try {
        window.localStorage.setItem(themeStorageKey, nextTheme);
      } catch {}
    }
  };

  applyTheme(root.dataset.theme, { persist: false });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    const updateTheme = () => applyTheme(nextTheme);

    if (document.startViewTransition && !themeMotionPreference.matches && themeViewTransitionPreference.matches) {
      document.startViewTransition(updateTheme);
    } else {
      updateTheme();
    }
  });

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const shieldedSiteBadge = document.querySelector("[data-shielded-site]");
  if (shieldedSiteBadge) {
    let shieldedSiteReady = false;
    let shieldedSitePromise = null;

    const loadShieldedSite = () => {
      if (shieldedSitePromise) return shieldedSitePromise;
      shieldedSitePromise = new Promise((resolve, reject) => {
        if (typeof window.ds07o6pcmkorn === "function") {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://staticcdn.co.nz/embed/embed.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      }).then(() => {
        const ShieldedEmbed = window.ds07o6pcmkorn;
        if (typeof ShieldedEmbed !== "function") throw new Error("Shielded Site could not be loaded");
        const shieldedFrame = new ShieldedEmbed({
          openElementId: "#shielded-logo",
          modalID: "shielded-site-modal",
        });
        shieldedFrame.init();
        shieldedSiteReady = true;
      });
      return shieldedSitePromise;
    };

    const warmShieldedSite = () => {
      loadShieldedSite().catch(() => {});
    };

    shieldedSiteBadge.addEventListener("pointerenter", warmShieldedSite, { once: true });
    shieldedSiteBadge.addEventListener("focus", warmShieldedSite, { once: true });
    shieldedSiteBadge.addEventListener("click", async (event) => {
      if (shieldedSiteReady) return;
      event.preventDefault();
      try {
        await loadShieldedSite();
        shieldedSiteBadge.click();
      } catch {
        window.open(shieldedSiteBadge.href, "_blank", "noopener");
      }
    });
  }


})();
