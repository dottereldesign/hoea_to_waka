(() => {
  const root = document.documentElement;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add("is-page-ready"));
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
