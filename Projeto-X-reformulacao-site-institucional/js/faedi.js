const rootElement = document.documentElement;
const headerShell = document.querySelector(".header-shell");
const header = document.querySelector(".site-header");
const nav = document.querySelector(".main-nav");
const mobileToggle = document.querySelector(".mobile-toggle");
const dropdownItems = document.querySelectorAll(".has-dropdown");
const searchPanel = document.querySelector(".search-panel");
const searchToggle = document.querySelector(".search-toggle");
const searchClose = document.querySelector(".search-close");
const searchInput = document.querySelector("#search-input");
const floatingButton = document.querySelector(".floating-button");
const yearTarget = document.querySelector("#current-year");
const mobileBreakpoint = window.matchMedia("(max-width: 1100px)");
let searchReturnFocus = null;

const getFocusableElements = (container) => {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
};

const syncHeaderOffset = () => {
  if (!headerShell) {
    return;
  }

  const nextOffset = Math.ceil(headerShell.getBoundingClientRect().height);
  rootElement.style.setProperty("--header-offset", `${nextOffset}px`);
};

const setDropdownState = (item, isOpen) => {
  const toggle = item.querySelector(".dropdown-toggle");
  const submenu = item.querySelector(".dropdown-menu");

  item.classList.toggle("is-open", isOpen);

  if (toggle) {
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  if (submenu) {
    submenu.setAttribute("aria-hidden", String(!isOpen));
    submenu.toggleAttribute("inert", !isOpen);
  }
};

const closeAllDropdowns = (exception = null) => {
  dropdownItems.forEach((item) => {
    if (item !== exception) {
      setDropdownState(item, false);
    }
  });
};

const syncMobileNavigation = () => {
  if (!nav || !mobileToggle) {
    return;
  }

  if (!mobileBreakpoint.matches) {
    nav.removeAttribute("inert");
    nav.removeAttribute("aria-hidden");
    return;
  }

  const isOpen = nav.classList.contains("is-open");
  nav.toggleAttribute("inert", !isOpen);
  nav.setAttribute("aria-hidden", String(!isOpen));
};

const closeMobileMenu = ({ returnFocus = false } = {}) => {
  if (!nav || !mobileToggle) {
    return;
  }

  const wasOpen = nav.classList.contains("is-open");
  nav.classList.remove("is-open");
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileToggle.setAttribute("aria-label", "Abrir menu principal");
  closeAllDropdowns();
  syncMobileNavigation();
  window.requestAnimationFrame(syncHeaderOffset);

  if (returnFocus && wasOpen) {
    mobileToggle.focus();
  }
};

dropdownItems.forEach((item) => {
  const toggle = item.querySelector(".dropdown-toggle");
  const submenu = item.querySelector(".dropdown-menu");

  if (!toggle || !submenu) {
    return;
  }

  setDropdownState(item, false);

  item.addEventListener("mouseenter", () => {
    if (!mobileBreakpoint.matches) {
      closeAllDropdowns(item);
      setDropdownState(item, true);
    }
  });

  item.addEventListener("mouseleave", () => {
    if (!mobileBreakpoint.matches && !item.contains(document.activeElement)) {
      setDropdownState(item, false);
    }
  });

  item.addEventListener("focusout", (event) => {
    if (!item.contains(event.relatedTarget)) {
      setDropdownState(item, false);
    }
  });

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = item.classList.contains("is-open");

    closeAllDropdowns(item);
    const keepOpenForPointer = !mobileBreakpoint.matches && item.matches(":hover");
    setDropdownState(item, !isOpen || keepOpenForPointer);
  });

  toggle.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    closeAllDropdowns(item);
    setDropdownState(item, true);

    const submenuLinks = getFocusableElements(submenu);
    const target = event.key === "ArrowUp" ? submenuLinks.at(-1) : submenuLinks[0];
    target?.focus();
  });

  submenu.addEventListener("keydown", (event) => {
    const submenuLinks = getFocusableElements(submenu);
    const currentIndex = submenuLinks.indexOf(document.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setDropdownState(item, false);
      toggle.focus();
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || currentIndex < 0) {
      return;
    }

    event.preventDefault();
    let nextIndex = currentIndex;

    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = submenuLinks.length - 1;
    } else {
      const direction = event.key === "ArrowDown" ? 1 : -1;
      nextIndex = (currentIndex + direction + submenuLinks.length) % submenuLinks.length;
    }

    submenuLinks[nextIndex]?.focus();
  });
});

if (mobileToggle) {
  mobileToggle.addEventListener("click", () => {
    if (!nav) {
      return;
    }

    const isOpen = nav.classList.toggle("is-open");
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
    mobileToggle.setAttribute("aria-label", isOpen ? "Fechar menu principal" : "Abrir menu principal");
    syncMobileNavigation();

    if (!isOpen) {
      closeAllDropdowns();
    }

    window.requestAnimationFrame(syncHeaderOffset);
  });
}

const openSearch = () => {
  if (!searchPanel) {
    return;
  }

  searchReturnFocus = document.activeElement;
  searchPanel.removeAttribute("inert");
  searchPanel.classList.add("is-open");
  searchPanel.setAttribute("aria-hidden", "false");
  searchToggle?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";

  if (searchInput) {
    window.setTimeout(() => searchInput.focus(), 120);
  }
};

const closeSearch = ({ returnFocus = true } = {}) => {
  if (!searchPanel) {
    return;
  }

  const wasOpen = searchPanel.classList.contains("is-open");
  searchPanel.classList.remove("is-open");
  searchPanel.setAttribute("aria-hidden", "true");
  searchPanel.setAttribute("inert", "");
  searchToggle?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";

  if (returnFocus && wasOpen && searchReturnFocus instanceof HTMLElement) {
    searchReturnFocus.focus();
  }

  searchReturnFocus = null;
};

if (searchToggle) {
  searchToggle.addEventListener("click", openSearch);
}

if (searchClose) {
  searchClose.addEventListener("click", closeSearch);
}

if (searchPanel) {
  searchPanel.addEventListener("click", (event) => {
    if (event.target === searchPanel) {
      closeSearch();
    }
  });

  searchPanel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeSearch();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(searchPanel);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
}

const setupCarousel = (carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const interval = Number(carousel.dataset.interval) || 2800;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!slides.length) {
    return;
  }

  let currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active"))
  );
  let autoplayId = null;
  let touchStartX = 0;
  let touchDeltaX = 0;

  const setActiveSlide = (nextIndex) => {
    currentIndex = nextIndex;

    slides.forEach((slide, index) => {
      const isActive = index === nextIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === nextIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const stopAutoplay = () => {
    window.clearTimeout(autoplayId);
    autoplayId = null;
  };

  const scheduleAutoplay = () => {
    stopAutoplay();

    if (slides.length < 2 || reducedMotion.matches || carousel.contains(document.activeElement)) {
      return;
    }

    autoplayId = window.setTimeout(() => {
      goToSlide(currentIndex + 1);
      scheduleAutoplay();
    }, interval);
  };

  const goToSlide = (nextIndex) => {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    setActiveSlide(normalizedIndex);
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      scheduleAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      scheduleAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      scheduleAutoplay();
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", scheduleAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      scheduleAutoplay();
    }
  });

  carousel.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
      stopAutoplay();
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchmove",
    (event) => {
      touchDeltaX = event.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  carousel.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 50) {
      goToSlide(currentIndex + (touchDeltaX < 0 ? 1 : -1));
    }

    scheduleAutoplay();
  });

  const handleReducedMotionChange = () => {
    if (reducedMotion.matches) {
      stopAutoplay();
      return;
    }

    scheduleAutoplay();
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleReducedMotionChange);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(handleReducedMotionChange);
  }

  setActiveSlide(currentIndex);
  scheduleAutoplay();
};

document.querySelectorAll("[data-carousel]").forEach(setupCarousel);

const setupCourseTabs = (tabList) => {
  const tabs = Array.from(tabList.querySelectorAll(".tab-button, .nav-tab"));

  if (!tabs.length) {
    return;
  }

  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-label", "Seções do curso");

  const tabEntries = tabs
    .map((tab, index) => {
      const panelId = tab.dataset.tab;
      const panel = panelId ? document.getElementById(panelId) : null;

      if (!panel) {
        return null;
      }

      const tabId = `${panelId}-tab`;
      tab.type = "button";
      tab.id = tabId;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panelId);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);

      return { tab, panel, index };
    })
    .filter(Boolean);

  if (!tabEntries.length) {
    return;
  }

  const activateTab = (entry, { moveFocus = false } = {}) => {
    tabEntries.forEach(({ tab, panel }) => {
      const isActive = tab === entry.tab;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });

    if (moveFocus) {
      entry.tab.focus();
    }
  };

  const initialEntry = tabEntries.find(({ tab }) => tab.classList.contains("active")) || tabEntries[0];
  activateTab(initialEntry);

  tabEntries.forEach((entry, entryIndex) => {
    entry.tab.addEventListener("click", () => activateTab(entry));
    entry.tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      let nextIndex = entryIndex;

      if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabEntries.length - 1;
      } else {
        const direction = event.key === "ArrowRight" ? 1 : -1;
        nextIndex = (entryIndex + direction + tabEntries.length) % tabEntries.length;
      }

      activateTab(tabEntries[nextIndex], { moveFocus: true });
    });
  });
};

document
  .querySelectorAll(".course-page .nav-tabs, .course-page.course-detail-page .nav-container")
  .forEach(setupCourseTabs);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".has-dropdown")) {
    closeAllDropdowns();
  }

  if (!event.target.closest(".header-content") && nav && nav.classList.contains("is-open") && window.innerWidth <= 1100) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (searchPanel?.classList.contains("is-open")) {
      closeSearch();
      return;
    }

    const openDropdown = Array.from(dropdownItems).find((item) => item.classList.contains("is-open"));

    if (openDropdown) {
      const toggle = openDropdown.querySelector(".dropdown-toggle");
      setDropdownState(openDropdown, false);
      toggle?.focus();
      return;
    }

    closeMobileMenu({ returnFocus: true });
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    closeAllDropdowns();

    if (window.innerWidth <= 1100) {
      closeMobileMenu();
    }
  });
});

const handleScroll = () => {
  const y = window.scrollY;

  if (header) {
    header.classList.toggle("is-scrolled", y > 12);
  }

  if (floatingButton) {
    floatingButton.classList.toggle("is-hidden", y < 260);
  }
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1100) {
    closeMobileMenu();
  } else {
    syncMobileNavigation();
  }

  syncHeaderOffset();
});

window.addEventListener("load", syncHeaderOffset);

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (document.fonts && typeof document.fonts.ready?.then === "function") {
  document.fonts.ready.then(syncHeaderOffset);
}

syncHeaderOffset();
syncMobileNavigation();
handleScroll();
