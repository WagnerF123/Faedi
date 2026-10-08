(() => {
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const rootPrefix = isHome ? "" : "index.html";
  const topOfCurrentPage = "#inicio";
  const hasLocalFooter = Boolean(document.querySelector('[data-faedi-layout="footer"]'));
  const resolveSection = (sectionId) => {
    if (sectionId === "contato") {
      return isHome || hasLocalFooter ? "#contato" : `${rootPrefix}#contato`;
    }

    return isHome ? `#${sectionId}` : `${rootPrefix}#${sectionId}`;
  };
  const isNewsPage = page === "noticias" || page === "noticia";
  const currentAttr = (isCurrent) => (isCurrent ? ' aria-current="page"' : "");
  const mainContent = document.querySelector("main");
  const mainContentId = mainContent?.id || "main-content";

  if (mainContent && !mainContent.id) {
    mainContent.id = mainContentId;
  }

  document.querySelectorAll("meta[data-seo-url]").forEach((meta) => {
    const relativeUrl = meta.getAttribute("content");

    if (!relativeUrl) {
      return;
    }

    try {
      meta.setAttribute("content", new URL(relativeUrl, document.baseURI).href);
    } catch {
      // Mantém o valor relativo quando a URL base não estiver disponível.
    }
  });

  const headerSlot = document.querySelector('[data-faedi-layout="header"]');
  const searchSlot = document.querySelector('[data-faedi-layout="search"]');
  const floatingSlot = document.querySelector('[data-faedi-layout="floating"]');
  const footerSlot = document.querySelector('[data-faedi-layout="footer"]');

  const headerMarkup = `
    <a class="skip-link" href="#${mainContentId}">Pular para o conte&uacute;do principal</a>
    <div class="header-shell">
      <div class="top-bar">
        <div class="container top-bar-content">
          <div class="campus-selector" aria-label="Campus da institui&ccedil;&atilde;o">
            <span class="top-label">Campus</span>
            <span class="campus-pill is-active">Ipu</span>
          </div>
          <a class="top-bar-link" href="${resolveSection("contato")}">Atendimento comercial</a>
        </div>
      </div>

      <header class="site-header" id="inicio">
        <div class="container header-content">
          <a class="brand" href="index.html" aria-label="Ir para a página inicial">
            <img src="images/logo-faedi.png" alt="Faculdade FAEDI" width="484" height="181" decoding="async">
          </a>

          <button class="mobile-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Abrir menu principal">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="main-nav" id="primary-navigation" aria-label="Navega&ccedil;&atilde;o principal">
            <ul class="nav-list">
              <li class="nav-item has-dropdown">
                <button class="nav-link dropdown-toggle" id="institution-menu-toggle" type="button" aria-expanded="false" aria-controls="institution-submenu">
                  Institui&ccedil;&atilde;o
                  <span class="chevron"></span>
                </button>
                <ul class="dropdown-menu" id="institution-submenu" aria-labelledby="institution-menu-toggle">
                  <li><a aria-disabled="true">Pol&iacute;ticas Institucionais</a></li>
                  <li><a aria-disabled="true">Ouvidoria</a></li>
                  <li><a aria-disabled="true">Trabalhe Conosco</a></li>
                  <li><a aria-disabled="true">FAEDI e Voc&ecirc;</a></li>
                  <li><a aria-disabled="true">Documentos Oficiais</a></li>
                  <li><a aria-disabled="true">SPA</a></li>
                </ul>
              </li>

              <li class="nav-item has-dropdown">
                <button class="nav-link dropdown-toggle" id="academic-menu-toggle" type="button" aria-expanded="false" aria-controls="academic-submenu">
                  Acad&ecirc;mico
                  <span class="chevron"></span>
                </button>
                <ul class="dropdown-menu" id="academic-submenu" aria-labelledby="academic-menu-toggle">
                  <li><a href="cpa.html"${currentAttr(page === "cpa")}>CPA</a></li>
                  <li><a href="https://bibliogratuita.curatoriaeditora.com.br/" target="_blank" rel="noopener noreferrer" aria-label="Biblioteca Digital (abre em nova aba)">Biblioteca Digital</a></li>
                  <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSeo-mHmh14BCq-2beJ_tsjEf9Y_NmCb0nztOe4f5gQ54WiRkQ/viewform" target="_blank" rel="noopener noreferrer" aria-label="Acompanhamento de Ingresso (abre em nova aba)">Acompanhamento de Ingresso</a></li>
                  <li><a aria-disabled="true">Consulta de Diploma Digital</a></li>
                  <li><a href="tcc.html"${currentAttr(page === "tcc")}>TCC</a></li>
                  <li><a aria-disabled="true">Conv&ecirc;nios</a></li>
                  <li><a href="editais.html"${currentAttr(page === "editais")}>Editais</a></li>
                  <li><a aria-disabled="true">Calend&aacute;rio Acad&ecirc;mico</a></li>
                  <li><a aria-disabled="true">Formas de Ingresso</a></li>
                </ul>
              </li>

              <li class="nav-item has-dropdown">
                <button class="nav-link dropdown-toggle" id="graduation-menu-toggle" type="button" aria-expanded="false" aria-controls="graduation-submenu">
                  Gradua&ccedil;&atilde;o
                  <span class="chevron"></span>
                </button>
                <ul class="dropdown-menu" id="graduation-submenu" aria-labelledby="graduation-menu-toggle">
                  <li><a href="psicologia.html"${currentAttr(page === "psicologia")}>Psicologia</a></li>
                  <li><a href="educacao-fisica.html"${currentAttr(page === "educacao-fisica")}>Educa&ccedil;&atilde;o F&iacute;sica</a></li>
                  <li><a href="pedagogia.html"${currentAttr(page === "pedagogia")}>Pedagogia</a></li>
                  <li><a href="direito.html"${currentAttr(page === "direito")}>Direito</a></li>
                  <li><a href="enfermagem.html"${currentAttr(page === "enfermagem")}>Enfermagem</a></li>
                  <li><a href="odontologia.html"${currentAttr(page === "odontologia")}>Odontologia</a></li>
                </ul>
              </li>

              <li class="nav-item">
                <a href="noticias.html"${currentAttr(isNewsPage)}>Not&iacute;cias</a>
              </li>
              <li class="nav-item">
                <a href="${resolveSection("apoio")}">Financiamentos</a>
              </li>
              <li class="nav-item">
                <a href="${resolveSection("contato")}">Contato</a>
              </li>
            </ul>

            <div class="nav-actions">
              <button class="icon-button search-toggle" type="button" aria-label="Abrir busca" aria-expanded="false" aria-controls="site-search-dialog">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.44 4.44 1.41-1.41-4.44-4.44A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"></path>
                </svg>
              </button>
              <a class="button button-primary header-cta" href="${resolveSection("processo-seletivo")}">Processos Seletivos</a>
            </div>
          </nav>
        </div>
      </header>
    </div>
  `;

  const searchMarkup = `
    <aside class="search-panel" id="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-dialog-title" aria-hidden="true" inert>
      <div class="search-card">
        <button class="search-close" type="button" aria-label="Fechar busca">&times;</button>
        <h2 class="search-kicker" id="search-dialog-title">Encontre cursos, editais e informa&ccedil;&otilde;es acad&ecirc;micas</h2>
        <form class="site-search-form" role="search" aria-label="Busca no portal" data-site-search-form novalidate>
          <label class="sr-only" for="search-input">Buscar no site</label>
          <input
            id="search-input"
            type="search"
            placeholder="Buscar cursos, not&iacute;cias, editais e TCCs..."
            autocomplete="off"
            aria-describedby="site-search-help"
            aria-controls="site-search-results"
          >
          <p class="search-help" id="site-search-help">Digite pelo menos dois caracteres. A busca ignora acentos e diferen&ccedil;as entre letras mai&uacute;sculas e min&uacute;sculas.</p>
          <p class="search-status" id="site-search-status" role="status" aria-live="polite" aria-atomic="true">Digite um termo para pesquisar no portal.</p>
          <div class="search-results" id="site-search-results" role="region" aria-label="Resultados da busca" aria-busy="false">
            <ol class="search-results-list" data-search-results-list></ol>
            <button class="search-more" type="button" data-search-more hidden>Ver mais resultados</button>
          </div>
        </form>
        <nav class="search-shortcuts" aria-label="Atalhos da busca">
          <a href="${resolveSection("graduacao")}">Psicologia</a>
          <a href="${resolveSection("graduacao")}">Direito</a>
          <a href="${resolveSection("apoio")}">Novo FIES e CrediES</a>
          <a href="${resolveSection("processo-seletivo")}">Matr&iacute;culas abertas</a>
        </nav>
      </div>
    </aside>
  `;

  const floatingMarkup = `
    <a
      class="floating-button"
      href="https://wa.me/5588996455585?text=Ol%C3%A1%2C%20quero%20ser%20Aluno%20na%20FAEDI."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp para ser aluno da FAEDI (abre em nova aba)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.72 14.9L2 22l5.25-1.24A10 10 0 1 0 12 2Zm0 18a7.94 7.94 0 0 1-4.05-1.1l-.29-.17-3.12.73.76-3.04-.19-.31A8 8 0 1 1 12 20Zm4.39-5.32c-.24-.12-1.44-.71-1.67-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.29.18-.53.06a6.47 6.47 0 0 1-1.91-1.18 7.1 7.1 0 0 1-1.31-1.63c-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.41.08-.16.04-.3-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.43.06-.66.3-.22.24-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.12.16 1.73 2.63 4.19 3.69.58.25 1.03.4 1.38.51.58.18 1.1.15 1.51.09.46-.07 1.44-.59 1.64-1.15.2-.56.2-1.04.14-1.15-.05-.1-.21-.16-.45-.28Z"></path>
      </svg>
      <span>Quero ser Aluno</span>
    </a>
  `;

  const footerMarkup = `
    <footer class="site-footer" id="contato">
      <div class="container footer-grid">
        <div>
          <a class="brand footer-brand" href="${resolveSection("inicio")}" aria-label="Faculdade FAEDI">
            <img src="images/logo-faedi.png" alt="Faculdade FAEDI" width="484" height="181" loading="lazy" decoding="async">
          </a>
          <p>
            Campus Ipu - Cear&aacute;<br>
            WhatsApp: (88) 9 9645-5585<br>
            Instagram: @faculdadefaedi
          </p>
        </div>

        <div class="footer-col">
          <h3>Nossos cursos</h3>
          <ul>
            <li><a href="${resolveSection("graduacao")}">Gradua&ccedil;&atilde;o</a></li>
            <li><a aria-disabled="true">P&oacute;s-Gradua&ccedil;&atilde;o</a></li>
            <li><a href="editais.html">Editais</a></li>
          </ul>
        </div>

        <div>
          <h3>Contato</h3>
          <ul class="footer-links">
            <li><a href="${resolveSection("contato")}">Atendimento comercial</a></li>
            <li><a href="${resolveSection("processo-seletivo")}">Matr&iacute;culas 2026</a></li>
            <li><a href="${resolveSection("graduacao")}">Gradua&ccedil;&atilde;o presencial</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <p>&copy; <span id="current-year"></span> Faculdade FAEDI. Todos os direitos reservados.</p>
          <a href="${topOfCurrentPage}">Voltar ao topo</a>
        </div>
      </div>
    </footer>
  `;

  if (headerSlot) {
    headerSlot.outerHTML = headerMarkup;
  }

  if (searchSlot) {
    searchSlot.outerHTML = searchMarkup;
  }

  if (floatingSlot) {
    floatingSlot.outerHTML = floatingMarkup;
  }

  if (footerSlot) {
    footerSlot.outerHTML = footerMarkup;
  }
})();
