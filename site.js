(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const themeMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const themeViewTransitionPreference = window.matchMedia("(min-width: 801px) and (pointer: fine)");
  const themeStorageKey = "hoea-theme";

  const applyTheme = (theme, { persist = true } = {}) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    const isDark = nextTheme === "dark";

    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    themeToggle?.setAttribute("aria-pressed", String(isDark));
    themeToggle?.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    if (themeColorMeta) themeColorMeta.content = isDark ? "#071923" : "#e8f4fa";

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

  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const subnavToggles = Array.from(document.querySelectorAll("[data-subnav-toggle]"));

  const syncNav = () => {
    if (!nav || !header) return;
    nav.inert = mobileQuery.matches && !header.classList.contains("is-open");
  };

  const closeSubnavs = (exceptToggle = null) => {
    subnavToggles.forEach((toggle) => {
      if (toggle === exceptToggle) return;
      toggle.closest(".site-nav-dropdown")?.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  };

  const closeMenu = () => {
    header?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation menu");
    closeSubnavs();
    syncNav();
  };

  menuToggle?.addEventListener("click", () => {
    const open = header?.classList.toggle("is-open") ?? false;
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    syncNav();
  });

  subnavToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const dropdown = toggle.closest(".site-nav-dropdown");
      const willOpen = !dropdown?.classList.contains("is-open");
      closeSubnavs(toggle);
      dropdown?.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  mobileQuery.addEventListener("change", closeMenu);
  syncNav();

  if (nav) {
    const parentLinks = Array.from(
      nav.querySelectorAll(":scope > .site-nav-link, :scope > .site-nav-dropdown > .site-nav-parent-link")
    );
    const activeChildLink = nav.querySelector('.site-subnav a[aria-current="page"]');
    const activeChildParent = activeChildLink
      ?.closest(".site-nav-dropdown")
      ?.querySelector(".site-nav-parent-link");
    const activeParentLink =
      parentLinks.find((link) => link.getAttribute("aria-current") === "page") ||
      activeChildParent ||
      null;

    if (activeChildParent) activeChildParent.classList.add("is-section-current");

    const indicator = document.createElement("span");
    indicator.className = "site-nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.append(indicator);

    let pointerTarget = null;
    let focusTarget = null;
    let displayedTarget = activeParentLink;
    let resizeFrame = 0;

    const getLabelRect = (link) => {
      const textNode = Array.from(link.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      if (!textNode) return link.getBoundingClientRect();

      const range = document.createRange();
      range.selectNodeContents(textNode);
      return range.getBoundingClientRect();
    };

    const positionIndicator = (target, { visible = true } = {}) => {
      if (!target || mobileQuery.matches) {
        nav.classList.remove("is-indicator-visible");
        return;
      }

      displayedTarget = target;

      const navRect = nav.getBoundingClientRect();
      const labelRect = getLabelRect(target);
      const indicatorWidth = indicator.getBoundingClientRect().width || 24;
      const indicatorX = labelRect.left - navRect.left + (labelRect.width - indicatorWidth) / 2;

      nav.style.setProperty("--nav-indicator-x", `${indicatorX.toFixed(2)}px`);
      nav.classList.toggle("is-indicator-visible", visible);
    };

    const updateIndicator = () => {
      const interactionTarget = pointerTarget || focusTarget;
      positionIndicator(interactionTarget || displayedTarget || activeParentLink, {
        visible: Boolean(interactionTarget),
      });
    };

    parentLinks.forEach((link) => {
      link.addEventListener("pointerenter", () => {
        pointerTarget = link;
        updateIndicator();
      });
    });

    nav.addEventListener("pointerleave", () => {
      pointerTarget = null;
      updateIndicator();
    });

    nav.addEventListener("focusin", (event) => {
      const focusedParent = parentLinks.find((link) => link === event.target);
      const focusedDropdownParent = event.target
        .closest?.(".site-nav-dropdown")
        ?.querySelector(".site-nav-parent-link");
      focusTarget = focusedParent || focusedDropdownParent || null;
      updateIndicator();
    });

    nav.addEventListener("focusout", () => {
      window.requestAnimationFrame(() => {
        if (!nav.contains(document.activeElement)) focusTarget = null;
        updateIndicator();
      });
    });

    const repositionIndicator = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updateIndicator);
    };

    positionIndicator(activeParentLink, { visible: false });
    window.addEventListener("resize", repositionIndicator, { passive: true });

    const enableIndicatorMotion = () => {
      updateIndicator();
      window.requestAnimationFrame(() => nav.classList.add("is-indicator-ready"));
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(enableIndicatorMotion);
    } else {
      enableIndicatorMotion();
    }
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const shieldedSiteBadge = document.querySelector("[data-shielded-site]");
  const ShieldedEmbed = window.ds07o6pcmkorn;
  if (shieldedSiteBadge && typeof ShieldedEmbed === "function") {
    const shieldedFrame = new ShieldedEmbed({
      openElementId: "#shielded-logo",
      modalID: "shielded-site-modal",
    });
    shieldedFrame.init();
  }

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const contactForm = document.querySelector("[data-contact-form]");
  const requestedInterest = new URLSearchParams(window.location.search).get("interest");
  const interestSelect = contactForm?.querySelector("[name='interest']");
  if (requestedInterest && interestSelect instanceof HTMLSelectElement) {
    const matchingOption = Array.from(interestSelect.options).find(
      (option) => option.value.toLowerCase() === requestedInterest.toLowerCase()
    );
    if (matchingOption) interestSelect.value = matchingOption.value;
  }

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const organisation = String(data.get("organisation") || "").trim();
    const interest = String(data.get("interest") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`Website enquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Organisation: ${organisation || "Not provided"}`,
        `Interested in: ${interest || "Not selected"}`,
        "",
        message,
      ].join("\n")
    );
    const status = contactForm.querySelector("[data-form-status]");
    if (status) status.textContent = "Opening your email app…";
    window.location.href = `mailto:anna@hoeatowaka.co.nz?subject=${subject}&body=${body}`;
  });
})();
