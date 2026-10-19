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

  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  if (!header?.hasAttribute('data-morph-header')) {
  const nav = document.querySelector("[data-site-nav]");
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const subnavToggles = Array.from(
    document.querySelectorAll("[data-subnav-toggle], [data-nav-dropdown] > .site-nav-parent-link")
  );

  subnavToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));

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
    toggle.addEventListener("click", (event) => {
      if (!mobileQuery.matches && !toggle.hasAttribute("data-subnav-toggle")) return;
      event.preventDefault();
      const dropdown = toggle.closest(".site-nav-dropdown");
      const willOpen = !dropdown?.classList.contains("is-open");
      closeSubnavs(toggle);
      dropdown?.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement && !event.target.matches(".site-nav-parent-link")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  mobileQuery.addEventListener("change", closeMenu);
  syncNav();

  if (nav) {
    const parentLinks = Array.from(
      nav.querySelectorAll(":scope > .site-nav-link, :scope > .site-nav-dropdown > .site-nav-parent-link")
    ).filter((link) => !link.matches('[href$="contact/"]'));
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

    window.addEventListener("resize", repositionIndicator, { passive: true });
    window.requestAnimationFrame(() => nav.classList.add("is-indicator-ready"));
  }

  }
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

  const isHomePage = document.body.classList.contains("page-home");

  if (!isHomePage) {
    document
      .querySelectorAll(".service-grid, .card-grid, .video-grid, .page-hero-grid, .split, .resource-feature, .footer-grid")
      .forEach((group) => {
        Array.from(group.children).forEach((item, index) => {
          item.setAttribute("data-reveal", "");
          item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 90}ms`);
        });
      });
  }

  document.querySelectorAll(".testimonial-carousel [data-reveal]").forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  if (!isHomePage) {
    document.querySelectorAll(".footer-bottom").forEach((item) => {
      item.setAttribute("data-reveal", "");
      item.style.setProperty("--reveal-delay", "120ms");
    });
  }

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const setupRevealObserver = () => {
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px" }
      );
      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }
  };

  if (isHomePage && "requestIdleCallback" in window) {
    window.requestIdleCallback(setupRevealObserver, { timeout: 1200 });
  } else {
    setupRevealObserver();
  }

  const testimonialCarousel = document.querySelector("[data-testimonial-carousel]");
  const testimonialViewport = testimonialCarousel?.querySelector("[data-carousel-viewport]");
  const testimonialTrack = testimonialCarousel?.querySelector("[data-carousel-track]");
  const testimonialSlides = Array.from(
    testimonialCarousel?.querySelectorAll("[data-carousel-slide]") || []
  );

  if (testimonialCarousel && testimonialViewport && testimonialTrack && testimonialSlides.length) {
    const previousButton = testimonialCarousel.querySelector("[data-carousel-previous]");
    const nextButton = testimonialCarousel.querySelector("[data-carousel-next]");
    const progressButtons = Array.from(testimonialCarousel.querySelectorAll("[data-carousel-go]"));
    const status = testimonialCarousel.querySelector("[data-carousel-status]");
    let currentIndex = 0;
    let resizeFrame = 0;
    let activePointer = null;
    let dragStart = 0;
    let dragDelta = 0;
    let dragOrigin = 0;
    let carouselInitialized = false;

    const getLastIndex = () => {
      const visibleSlides = window.matchMedia("(max-width: 720px)").matches ? 1 : 2;
      return Math.max(0, testimonialSlides.length - visibleSlides);
    };

    const getStep = () => {
      const cardWidth = testimonialSlides[0].getBoundingClientRect().width;
      const trackStyles = window.getComputedStyle(testimonialTrack);
      const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
      return cardWidth + gap;
    };

    const renderCarousel = ({ announce = true, animate = true } = {}) => {
      if (!animate) testimonialCarousel.classList.add("is-resizing");
      currentIndex = Math.min(currentIndex, getLastIndex());
      testimonialTrack.style.transform = `translate3d(${-currentIndex * getStep()}px, 0, 0)`;

      testimonialSlides.forEach((slide, index) => {
        slide.classList.toggle("is-carousel-right", index === currentIndex + 1);
        if (index === currentIndex) {
          slide.setAttribute("aria-current", "true");
        } else {
          slide.removeAttribute("aria-current");
        }
      });

      const activeProgressIndex = Math.min(currentIndex, progressButtons.length - 1);
      progressButtons.forEach((button, index) => {
        if (index === activeProgressIndex) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      if (previousButton instanceof HTMLButtonElement) previousButton.disabled = currentIndex === 0;
      if (nextButton instanceof HTMLButtonElement) nextButton.disabled = currentIndex === getLastIndex();
      if (announce && status) status.textContent = `Showing testimonial ${currentIndex + 1} of ${testimonialSlides.length}`;

      if (!animate) {
        window.requestAnimationFrame(() => testimonialCarousel.classList.remove("is-resizing"));
      }
    };

    const goToTestimonial = (index, options) => {
      currentIndex = Math.min(getLastIndex(), Math.max(0, index));
      renderCarousel(options);
    };

    const initializeCarousel = () => {
      if (carouselInitialized) return;
      carouselInitialized = true;
      renderCarousel({ announce: false, animate: false });
    };

    previousButton?.addEventListener("click", () => {
      initializeCarousel();
      goToTestimonial(currentIndex - 1);
    });
    nextButton?.addEventListener("click", () => {
      initializeCarousel();
      goToTestimonial(currentIndex + 1);
    });
    progressButtons.forEach((button) => {
      button.addEventListener("click", () => {
        initializeCarousel();
        const requestedIndex = Number.parseInt(button.dataset.carouselGo || "0", 10);
        const targetIndex = requestedIndex === progressButtons.length - 1 ? getLastIndex() : requestedIndex;
        goToTestimonial(targetIndex);
      });
    });

    testimonialViewport.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      initializeCarousel();
      goToTestimonial(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
    });

    testimonialViewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || activePointer !== null) return;
      initializeCarousel();
      activePointer = event.pointerId;
      dragStart = event.clientX;
      dragDelta = 0;
      dragOrigin = -currentIndex * getStep();
      testimonialCarousel.classList.add("is-dragging");
      testimonialViewport.setPointerCapture(event.pointerId);
    });

    testimonialViewport.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointer) return;
      dragDelta = event.clientX - dragStart;
      const pullingPastStart = currentIndex === 0 && dragDelta > 0;
      const pullingPastEnd = currentIndex === getLastIndex() && dragDelta < 0;
      const displayedDelta = pullingPastStart || pullingPastEnd ? dragDelta * 0.24 : dragDelta;
      testimonialTrack.style.transform = `translate3d(${dragOrigin + displayedDelta}px, 0, 0)`;
    });

    const finishTestimonialDrag = (event) => {
      if (event.pointerId !== activePointer) return;
      const pointerId = activePointer;
      activePointer = null;
      testimonialCarousel.classList.remove("is-dragging");
      if (testimonialViewport.hasPointerCapture(pointerId)) testimonialViewport.releasePointerCapture(pointerId);

      const threshold = Math.min(90, testimonialSlides[0].getBoundingClientRect().width * 0.16);
      if (dragDelta <= -threshold) {
        goToTestimonial(currentIndex + 1);
      } else if (dragDelta >= threshold) {
        goToTestimonial(currentIndex - 1);
      } else {
        renderCarousel({ announce: false });
      }
    };

    testimonialViewport.addEventListener("pointerup", finishTestimonialDrag);
    testimonialViewport.addEventListener("pointercancel", finishTestimonialDrag);

    const resizeCarousel = () => {
      if (!carouselInitialized) return;
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => renderCarousel({ announce: false, animate: false }));
    };

    window.addEventListener("resize", resizeCarousel, { passive: true });
  }

})();
