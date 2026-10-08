/*
 * Índice compacto da busca global.
 * Páginas, cursos e metadados de notícias ficam neste arquivo. Os registros
 * reais de Editais e TCCs são reaproveitados de seus respectivos scripts e
 * carregados somente quando a busca é utilizada fora dessas páginas.
 */
(() => {
  "use strict";

  const INITIAL_RESULT_LIMIT = 6;
  const RESULT_INCREMENT = 6;
  const INPUT_DEBOUNCE_MS = 220;

  const staticEntries = Object.freeze([
    {
      type: "Página institucional",
      title: "Faculdade FAEDI",
      description: "Faculdade FAEDI — Graduação presencial em Ipu.",
      url: "index.html",
      keywords: ["home", "início", "graduação presencial", "Ipu"],
    },
    {
      type: "Página institucional",
      title: "CPA",
      description: "Comissão Própria de Avaliação da Faculdade FAEDI.",
      url: "cpa.html",
      keywords: ["comissão", "avaliação", "resultados", "documentos institucionais"],
    },
    {
      type: "Página institucional",
      title: "Editais",
      description: "Consulta aos editais e documentos institucionais da Faculdade FAEDI.",
      url: "editais.html",
      keywords: ["processo seletivo", "documentos", "PDF"],
    },
    {
      type: "Página institucional",
      title: "Notícias",
      description: "Novidades e acontecimentos da Faculdade FAEDI.",
      url: "noticias.html",
      keywords: ["notícias", "novidades", "acontecimentos"],
    },
    {
      type: "Página institucional",
      title: "Trabalhos de Conclusão de Curso",
      description: "Consulta aos trabalhos acadêmicos disponibilizados pela Faculdade FAEDI.",
      url: "tcc.html",
      keywords: ["TCC", "trabalhos acadêmicos", "conclusão de curso"],
    },
    {
      type: "Curso",
      title: "Psicologia",
      description: "Formação voltada ao cuidado, escuta qualificada e atuação em múltiplos contextos sociais e clínicos.",
      url: "psicologia.html",
      keywords: ["graduação", "curso"],
    },
    {
      type: "Curso",
      title: "Pedagogia",
      description: "Formação para transformar a educação com repertório pedagógico, gestão e práticas formativas inovadoras.",
      url: "pedagogia.html",
      keywords: ["graduação", "curso", "educação"],
    },
    {
      type: "Curso",
      title: "Enfermagem",
      description: "Uma trajetória acadêmica conectada à saúde.",
      url: "enfermagem.html",
      keywords: ["graduação", "curso", "saúde"],
    },
    {
      type: "Curso",
      title: "Educação Física",
      description: "Uma trajetória acadêmica conectada à saúde, performance, movimento humano e qualidade de vida.",
      url: "educacao-fisica.html",
      keywords: ["graduação", "curso", "movimento", "esporte"],
    },
    {
      type: "Curso",
      title: "Direito",
      description: "Bacharelado presencial da Faculdade FAEDI.",
      url: "direito.html",
      keywords: ["graduação", "curso", "jurídico"],
    },
    {
      type: "Curso",
      title: "Odontologia",
      description: "Bacharelado presencial da Faculdade FAEDI.",
      url: "odontologia.html",
      keywords: ["graduação", "curso", "saúde bucal"],
    },
  ].map(Object.freeze));

  const newsEntries = Object.freeze([
    {
      id: 1,
      title: "FAEDI lança novo programa de bolsas de estudo para alunos de baixa renda",
      description: "A Faculdade FAEDI anuncia a implementação de um programa inovador de bolsas de estudo, visando democratizar o acesso ao ensino superior de qualidade na região de Ipu.",
      category: "academico",
    },
    {
      id: 2,
      title: "Workshop reúne estudantes e empresários para discutir mercado de trabalho",
      description: "Evento promoveu networking e troca de experiências entre alunos e profissionais da região.",
      category: "eventos",
    },
    {
      id: 3,
      title: "Novo laboratório de odontologia é inaugurado com equipamentos de ponta",
      description: "Investimento de R$ 500 mil em tecnologia para formação prática dos estudantes de Odontologia.",
      category: "academico",
    },
    {
      id: 4,
      title: "FAEDI participa de feira educacional em Fortaleza",
      description: "Instituição apresentou seus cursos e oportunidades de ingresso para milhares de visitantes.",
      category: "eventos",
    },
    {
      id: 5,
      title: "Projeto de extensão beneficia comunidade local com atendimento gratuito",
      description: "Estudantes de Enfermagem e Odontologia oferecem serviços à população de Ipu.",
      category: "comunidade",
    },
    {
      id: 6,
      title: "FAEDI implementa nova plataforma digital para aulas interativas",
      description: "Tecnologia inovadora permite aulas mais dinâmicas e participação ativa dos estudantes.",
      category: "inovacao",
    },
    {
      id: 7,
      title: "Grupo de pesquisa da FAEDI publica artigo em revista internacional",
      description: "Trabalho sobre saúde mental ganha reconhecimento da comunidade científica.",
      category: "academico",
    },
    {
      id: 8,
      title: "Semana acadêmica reúne palestrantes renomados",
      description: "Evento contou com participação de especialistas em diversas áreas do conhecimento.",
      category: "eventos",
    },
  ].map(Object.freeze));

  const dataSources = Object.freeze([
    { globalName: "FaediEditaisDocuments", source: "js/editais.js" },
    { globalName: "FaediTccDocuments", source: "js/tcc.js" },
  ]);

  const searchForm = document.querySelector("[data-site-search-form]");
  const searchPanel = document.querySelector(".search-panel");
  const searchToggle = document.querySelector(".search-toggle");
  const searchInput = document.querySelector("#search-input");
  const searchStatus = document.querySelector("#site-search-status");
  const searchResults = document.querySelector("#site-search-results");
  const searchResultsList = document.querySelector("[data-search-results-list]");
  const searchMoreButton = document.querySelector("[data-search-more]");

  let supplementalDataPromise = null;
  let currentResults = [];
  let currentTokens = [];
  let visibleResultLimit = INITIAL_RESULT_LIMIT;
  let inputTimer = null;
  let searchRequestId = 0;

  const toText = (value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(" ");
    }

    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  };

  const normalizeText = (value) => toText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();

  const getTokens = (value) => normalizeText(value).split(" ").filter(Boolean);

  const getScriptBySource = (source) => Array.from(document.scripts).find((script) => {
    if (!script.src) {
      return false;
    }

    try {
      return new URL(script.src, window.location.href).pathname.endsWith(`/${source}`);
    } catch {
      return false;
    }
  });

  const loadDataSource = ({ globalName, source }) => {
    if (Array.isArray(window[globalName])) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = getScriptBySource(source);

      if (existingScript) {
        if (Array.isArray(window[globalName])) {
          resolve();
          return;
        }

        const handleLoad = () => {
          if (Array.isArray(window[globalName])) {
            resolve();
          } else {
            reject(new Error("Fonte de dados indisponível"));
          }
        };

        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Fonte de dados indisponível")), { once: true });
        window.setTimeout(handleLoad, 0);
        return;
      }

      const script = document.createElement("script");
      script.src = source;
      script.async = true;
      script.dataset.searchDataSource = globalName;
      script.addEventListener("load", () => {
        if (Array.isArray(window[globalName])) {
          resolve();
        } else {
          reject(new Error("Fonte de dados indisponível"));
        }
      }, { once: true });
      script.addEventListener("error", () => reject(new Error("Fonte de dados indisponível")), { once: true });
      document.head.append(script);
    });
  };

  const ensureSupplementalData = () => {
    if (!supplementalDataPromise) {
      supplementalDataPromise = Promise.all(dataSources.map(loadDataSource));
    }

    return supplementalDataPromise;
  };

  const isSafeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
      return false;
    }

    try {
      const parsedUrl = new URL(value.trim(), window.location.href);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const getNewsSource = () => {
    if (!Array.isArray(window.FaediNewsDocuments)) {
      return newsEntries;
    }

    return window.FaediNewsDocuments.map((newsItem) => ({
      id: newsItem.id,
      title: newsItem.titulo,
      description: newsItem.resumo,
      category: newsItem.categoria,
    }));
  };

  const formatCategory = (category) => {
    const labels = {
      academico: "Acadêmico",
      comunidade: "Comunidade",
      eventos: "Eventos",
      inovacao: "Inovação",
    };

    return labels[normalizeText(category)] || toText(category);
  };

  const buildSearchIndex = () => {
    const news = getNewsSource().map((newsItem) => ({
      type: "Notícia",
      title: toText(newsItem.title),
      description: toText(newsItem.description),
      url: `noticia.html?id=${encodeURIComponent(newsItem.id)}`,
      keywords: [formatCategory(newsItem.category), newsItem.category],
    }));

    const editais = (window.FaediEditaisDocuments || []).map((edital) => {
      const hasDocument = isSafeUrl(edital.url);
      const status = hasDocument
        ? ({ aberto: "Aberto", encerrado: "Encerrado" }[edital.status] || "Disponível")
        : "Documento indisponível";
      const metadata = [edital.category, edital.year && `Ano ${edital.year}`, status].filter(Boolean);

      return {
        type: "Edital",
        title: toText(edital.title),
        description: toText(edital.description) || metadata.join(" • "),
        url: hasDocument ? edital.url.trim() : "editais.html",
        opensNewTab: hasDocument,
        keywords: ["edital", "editais", edital.category, edital.year, status],
      };
    });

    const tccs = (window.FaediTccDocuments || []).map((tcc) => {
      const hasDocument = isSafeUrl(tcc.pdfUrl);
      const authors = toText(tcc.authors);
      const metadata = [authors, tcc.course, tcc.year].filter(Boolean);

      return {
        type: "TCC",
        title: toText(tcc.title),
        description: toText(tcc.abstract) || metadata.join(" • "),
        url: hasDocument ? tcc.pdfUrl.trim() : "tcc.html",
        opensNewTab: hasDocument,
        keywords: [
          "TCC",
          "trabalho de conclusão de curso",
          tcc.authors,
          tcc.advisor,
          tcc.coAdvisor,
          tcc.course,
          tcc.year,
          tcc.keywords,
        ],
      };
    });

    return [...staticEntries, ...news, ...editais, ...tccs].filter((entry) => (
      entry.title && isSafeUrl(entry.url)
    ));
  };

  const getSearchableText = (entry) => normalizeText([
    entry.title,
    entry.description,
    entry.type,
    entry.keywords,
  ].map(toText));

  const getResultScore = (entry, normalizedQuery, tokens) => {
    const title = normalizeText(entry.title);
    const description = normalizeText(entry.description);
    let score = 0;

    if (title === normalizedQuery) {
      score += 120;
    } else if (title.startsWith(normalizedQuery)) {
      score += 80;
    } else if (title.includes(normalizedQuery)) {
      score += 55;
    }

    tokens.forEach((token) => {
      if (title.includes(token)) {
        score += 18;
      }

      if (description.includes(token)) {
        score += 5;
      }
    });

    return score;
  };

  const searchEntries = (query, entries = buildSearchIndex()) => {
    const normalizedQuery = normalizeText(query);
    const tokens = getTokens(query);

    if (normalizedQuery.length < 2 || !tokens.length) {
      return [];
    }

    return entries
      .filter((entry) => {
        const searchableText = getSearchableText(entry);
        return tokens.every((token) => searchableText.includes(token));
      })
      .map((entry) => ({
        ...entry,
        score: getResultScore(entry, normalizedQuery, tokens),
      }))
      .sort((first, second) => (
        second.score - first.score
        || first.title.localeCompare(second.title, "pt-BR")
      ));
  };

  const appendHighlightedText = (container, value, tokens) => {
    const parts = toText(value).split(/(\s+)/);

    parts.forEach((part) => {
      const normalizedPart = normalizeText(part);
      const shouldHighlight = normalizedPart && tokens.some((token) => normalizedPart.includes(token));

      if (shouldHighlight) {
        const mark = document.createElement("mark");
        mark.textContent = part;
        container.append(mark);
      } else {
        container.append(document.createTextNode(part));
      }
    });
  };

  const truncateText = (value, maximumLength = 180) => {
    const text = toText(value).replace(/\s+/g, " ").trim();

    if (text.length <= maximumLength) {
      return text;
    }

    const shortened = text.slice(0, maximumLength + 1);
    const lastSpace = shortened.lastIndexOf(" ");
    return `${shortened.slice(0, lastSpace > 100 ? lastSpace : maximumLength).trim()}…`;
  };

  const createResultItem = (entry) => {
    const item = document.createElement("li");
    const article = document.createElement("article");
    const link = document.createElement("a");
    const type = document.createElement("span");
    const title = document.createElement("h3");
    const description = document.createElement("p");

    item.className = "search-result-item";
    article.className = "search-result-card";
    link.className = "search-result-link";
    link.href = entry.url;
    type.className = "search-result-type";
    type.textContent = entry.type;
    title.className = "search-result-title";
    description.className = "search-result-description";

    if (entry.opensNewTab) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${entry.title} — ${entry.type} (abre em nova aba)`);
    }

    appendHighlightedText(title, entry.title, currentTokens);
    appendHighlightedText(description, truncateText(entry.description), currentTokens);
    link.append(type, title, description);
    article.append(link);
    item.append(article);
    return item;
  };

  const updateStatus = (message) => {
    if (searchStatus) {
      searchStatus.textContent = message;
    }
  };

  const renderResults = ({ focusResultIndex = -1 } = {}) => {
    if (!searchResultsList || !searchMoreButton) {
      return;
    }

    const visibleResults = currentResults.slice(0, visibleResultLimit);
    const fragment = document.createDocumentFragment();

    visibleResults.forEach((entry) => fragment.append(createResultItem(entry)));
    searchResultsList.replaceChildren(fragment);

    const remaining = currentResults.length - visibleResults.length;
    searchMoreButton.hidden = remaining <= 0;
    searchMoreButton.textContent = remaining > 0
      ? `Ver mais resultados (${remaining})`
      : "Ver mais resultados";

    if (focusResultIndex >= 0) {
      searchResultsList.querySelectorAll(".search-result-link")[focusResultIndex]?.focus();
    }
  };

  const clearResults = () => {
    currentResults = [];
    currentTokens = [];
    visibleResultLimit = INITIAL_RESULT_LIMIT;
    searchResultsList?.replaceChildren();

    if (searchMoreButton) {
      searchMoreButton.hidden = true;
    }
  };

  const executeSearch = async () => {
    if (!searchInput || !searchResults) {
      return;
    }

    const requestId = ++searchRequestId;
    const query = searchInput.value.replace(/\s+/g, " ").trim();
    clearResults();

    if (!query) {
      updateStatus("Digite um termo para pesquisar no portal.");
      searchResults.setAttribute("aria-busy", "false");
      return;
    }

    if (normalizeText(query).length < 2) {
      updateStatus("Digite pelo menos dois caracteres para pesquisar.");
      searchResults.setAttribute("aria-busy", "false");
      return;
    }

    searchResults.setAttribute("aria-busy", "true");

    try {
      await ensureSupplementalData();

      if (requestId !== searchRequestId) {
        return;
      }

      currentTokens = getTokens(query);
      currentResults = searchEntries(query);
      visibleResultLimit = INITIAL_RESULT_LIMIT;

      if (!currentResults.length) {
        updateStatus(`Nenhum resultado encontrado para “${query}”.`);
        return;
      }

      renderResults();
      const resultLabel = currentResults.length === 1 ? "resultado encontrado" : "resultados encontrados";
      updateStatus(`${currentResults.length} ${resultLabel}.`);
    } catch {
      if (requestId !== searchRequestId) {
        return;
      }

      clearResults();
      updateStatus("Não foi possível realizar a busca agora. Tente novamente.");
    } finally {
      if (requestId === searchRequestId) {
        searchResults.setAttribute("aria-busy", "false");
      }
    }
  };

  const scheduleSearch = () => {
    window.clearTimeout(inputTimer);
    inputTimer = window.setTimeout(executeSearch, INPUT_DEBOUNCE_MS);
  };

  if (searchForm && searchPanel && searchInput && searchResultsList && searchMoreButton) {
    searchToggle?.addEventListener("click", () => {
      ensureSupplementalData().catch(() => {
        // O estado seguro de erro será comunicado apenas se uma pesquisa for feita.
      });
    });

    searchInput.addEventListener("input", scheduleSearch);
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      window.clearTimeout(inputTimer);
      executeSearch();
    });

    searchMoreButton.addEventListener("click", () => {
      const previousVisibleCount = Math.min(visibleResultLimit, currentResults.length);
      visibleResultLimit += RESULT_INCREMENT;
      renderResults({ focusResultIndex: previousVisibleCount });
    });
  }

  window.FaediSearch = Object.freeze({
    normalizeText,
    buildSearchIndex,
    search: searchEntries,
  });
})();
