// Interações do cabeçalho, busca e elementos flutuantes.
const header = document.querySelector(".site-header");
const nav = document.querySelector(".main-nav");
const mobileToggle = document.querySelector(".mobile-toggle");
const dropdownItems = document.querySelectorAll(".has-dropdown");
const campusPills = document.querySelectorAll(".campus-pill");
const searchPanel = document.querySelector(".search-panel");
const searchToggle = document.querySelector(".search-toggle");
const searchClose = document.querySelector(".search-close");
const searchInput = document.querySelector("#search-input");
const floatingButton = document.querySelector(".floating-button");
const yearTarget = document.querySelector("#current-year");

const closeAllDropdowns = () => {
  dropdownItems.forEach((item) => {
    item.classList.remove("is-open");
    const toggle = item.querySelector(".dropdown-toggle");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

const closeMobileMenu = () => {
  nav.classList.remove("is-open");
  mobileToggle.setAttribute("aria-expanded", "false");
};

dropdownItems.forEach((item) => {
  const toggle = item.querySelector(".dropdown-toggle");

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = item.classList.contains("is-open");

    closeAllDropdowns();

    if (!isOpen) {
      item.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
});

// Alterna visualmente o campus ativo na barra superior.
campusPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    campusPills.forEach((item) => item.classList.remove("is-active"));
    pill.classList.add("is-active");
  });
});

mobileToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  mobileToggle.setAttribute("aria-expanded", String(isOpen));

  if (!isOpen) {
    closeAllDropdowns();
  }
});

const openSearch = () => {
  searchPanel.classList.add("is-open");
  searchPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => searchInput.focus(), 120);
};

const closeSearch = () => {
  searchPanel.classList.remove("is-open");
  searchPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

searchToggle.addEventListener("click", openSearch);
searchClose.addEventListener("click", closeSearch);

searchPanel.addEventListener("click", (event) => {
  if (event.target === searchPanel) {
    closeSearch();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".has-dropdown")) {
    closeAllDropdowns();
  }

  if (!event.target.closest(".header-content") && nav.classList.contains("is-open") && window.innerWidth <= 1100) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllDropdowns();
    closeSearch();
    closeMobileMenu();
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

  header.classList.toggle("is-scrolled", y > 12);
  floatingButton.classList.toggle("is-hidden", y < 220);
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1100) {
    nav.classList.remove("is-open");
    mobileToggle.setAttribute("aria-expanded", "false");
  }
});

yearTarget.textContent = new Date().getFullYear();
handleScroll();
