/*
 * Cadastro centralizado dos editais.
 * Para publicar um documento, preencha os campos opcionais disponíveis e
 * informe a URL em `url`. Categorias vazias não são exibidas nem inventadas.
 */
const defaultEditaisDocuments = Object.freeze([
  {
    id: "edital-01-2026",
    title: "EDITAL 01/2026 - PROCESSO SELETIVO PARA INGRESSO NOS CURSOS DE GRADUAÇÃO",
    description: "",
    category: "",
    year: "2026",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-02-2026",
    title: "EDITAL 02/2026 - TRANSFERÊNCIA EXTERNA E INGRESSO DE PORTADORES DE DIPLOMA",
    description: "",
    category: "",
    year: "2026",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-01-2025",
    title: "EDITAL 01/2025 - VESTIBULAR GERAL E CRONOGRAMA DE MATRÍCULAS",
    description: "",
    category: "",
    year: "2025",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-02-2025",
    title: "EDITAL 02/2025 - SELEÇÃO DE MONITORIA ACADÊMICA PARA OS CURSOS DE GRADUAÇÃO",
    description: "",
    category: "",
    year: "2025",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-03-2025",
    title: "EDITAL 03/2025 - PROJETOS DE EXTENSÃO E PARTICIPAÇÃO DISCENTE",
    description: "",
    category: "",
    year: "2025",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-01-2024",
    title: "EDITAL 01/2024 - PROCESSO SELETIVO PARA NOVAS TURMAS DA FAEDI",
    description: "",
    category: "",
    year: "2024",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-02-2024",
    title: "EDITAL 02/2024 - CONCESSÃO DE BOLSAS E DESCONTOS INSTITUCIONAIS",
    description: "",
    category: "",
    year: "2024",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
  {
    id: "edital-03-2024",
    title: "EDITAL 03/2024 - CALENDÁRIO COMPLEMENTAR E AJUSTES ACADÊMICOS",
    description: "",
    category: "",
    year: "2024",
    publicationDate: "",
    status: "indisponivel",
    url: "",
  },
].map(Object.freeze));

let editaisDocuments = defaultEditaisDocuments;

// Disponibiliza a fonte real dos editais para a busca compartilhada.
window.FaediEditaisDocuments = editaisDocuments;

const editaisPage = document.querySelector(".editais-page");

if (editaisPage) {
  const editaisList = editaisPage.querySelector("[data-editais-list]");
  const editaisCount = editaisPage.querySelector("[data-editais-count]");
  const editaisEmpty = editaisPage.querySelector("[data-editais-empty]");
  const editaisFilters = editaisPage.querySelector("[data-editais-filters]");
  const categoryFilter = editaisPage.querySelector('[data-editais-filter="category"]');
  const yearFilter = editaisPage.querySelector('[data-editais-filter="year"]');
  const statusFilter = editaisPage.querySelector('[data-editais-filter="status"]');

  const statusLabels = {
    aberto: "Aberto",
    encerrado: "Encerrado",
    indisponivel: "Documento indisponível",
  };

  const createElement = (tagName, className, textContent = "") => {
    const element = document.createElement(tagName);
    element.className = className;

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  };

  const hasSafeDocumentUrl = (url) => {
    if (typeof url !== "string" || !url.trim()) {
      return false;
    }

    try {
      const documentUrl = new URL(url.trim(), window.location.href);
      return documentUrl.protocol === "http:" || documentUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const getEffectiveStatus = (edital) => {
    if (!hasSafeDocumentUrl(edital.url)) {
      return "indisponivel";
    }

    return Object.prototype.hasOwnProperty.call(statusLabels, edital.status)
      ? edital.status
      : "indisponivel";
  };

  const addMetadata = (list, label, value) => {
    if (!value) {
      return;
    }

    const item = createElement("div", "edital-card-meta-item");
    item.append(
      createElement("dt", "edital-card-meta-label", label),
      createElement("dd", "edital-card-meta-value", value)
    );
    list.append(item);
  };

  const formatPublicationDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
      return value;
    }

    return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
  };

  const createEditalCard = (edital) => {
    const effectiveStatus = getEffectiveStatus(edital);
    const card = createElement("article", `edital-card edital-card--${effectiveStatus}`);
    const titleId = `${edital.id}-title`;
    const heading = createElement("h3", "edital-card-title", edital.title);
    const content = createElement("div", "edital-card-content");
    const header = createElement("div", "edital-card-header");
    const metadata = createElement("dl", "edital-card-meta");
    const action = createElement("div", "edital-card-action");

    card.dataset.editalId = edital.id;
    card.setAttribute("aria-labelledby", titleId);
    heading.id = titleId;

    header.append(createElement("span", "edital-card-icon", "PDF"));

    if (edital.category) {
      header.append(createElement("span", "edital-card-category", edital.category));
    }

    content.append(header, heading);

    if (edital.description) {
      content.append(createElement("p", "edital-card-description", edital.description));
    }

    addMetadata(metadata, "Ano", edital.year);
    addMetadata(metadata, "Publicação", formatPublicationDate(edital.publicationDate));
    addMetadata(metadata, "Situação", statusLabels[effectiveStatus]);
    content.append(metadata);

    if (hasSafeDocumentUrl(edital.url)) {
      const link = createElement("a", "edital-card-link", "Visualizar PDF");
      link.href = edital.url.trim();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Abrir PDF: ${edital.title} (nova aba)`);
      action.append(link);
    } else {
      const unavailable = createElement("span", "edital-card-link edital-card-link--disabled", "Documento indisponível");
      unavailable.setAttribute("aria-disabled", "true");
      action.append(unavailable);
    }

    card.append(content, action);
    return card;
  };

  const appendFilterOptions = (select, values) => {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  };

  const populateFilters = () => {
    categoryFilter.replaceChildren(new Option("Todos", ""));
    yearFilter.replaceChildren(new Option("Todos", ""));
    const categories = [...new Set(editaisDocuments.map((edital) => edital.category).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, "pt-BR"));
    const years = [...new Set(editaisDocuments.map((edital) => edital.year).filter(Boolean))]
      .sort((first, second) => Number(second) - Number(first));

    appendFilterOptions(categoryFilter, categories);
    appendFilterOptions(yearFilter, years);
  };

  const getFilteredEditais = () => editaisDocuments.filter((edital) => {
    const matchesCategory = !categoryFilter.value || edital.category === categoryFilter.value;
    const matchesYear = !yearFilter.value || edital.year === yearFilter.value;
    const matchesStatus = !statusFilter.value || getEffectiveStatus(edital) === statusFilter.value;

    return matchesCategory && matchesYear && matchesStatus;
  });

  const renderEditais = () => {
    const filteredEditais = getFilteredEditais();
    const fragment = document.createDocumentFragment();

    filteredEditais.forEach((edital) => {
      fragment.append(createEditalCard(edital));
    });

    editaisList.replaceChildren(fragment);
    editaisEmpty.hidden = filteredEditais.length > 0;

    const resultLabel = filteredEditais.length === 1 ? "edital encontrado" : "editais encontrados";
    editaisCount.textContent = `${filteredEditais.length} ${resultLabel}.`;
  };

  const loadPublishedEditais = async () => {
    let sharedEditais = null;
    try {
      const sharedState = await window.FaediAppsScript.loadState();
      if (sharedState && Array.isArray(sharedState.editais)) {
        sharedEditais = sharedState.editais;
      }
    } catch {}

    try {
      const localEditais = JSON.parse(localStorage.getItem("faediAdminLocalEditais") || "[]");
      const deletedEditais = JSON.parse(localStorage.getItem("faediAdminDeletedEditais") || "[]");
      const deletedIds = new Set(Array.isArray(deletedEditais) ? deletedEditais : []);
      const source = Array.isArray(sharedEditais) ? sharedEditais : defaultEditaisDocuments;
      const byId = new Map(source.filter((document) => !deletedIds.has(document.id)).map((document) => [document.id, document]));
      (Array.isArray(localEditais) ? localEditais : []).forEach((document) => {
        if (!deletedIds.has(document.id)) byId.set(document.id, document);
      });
      editaisDocuments = [...byId.values()].map((document) => Object.freeze({ ...document }));
      window.FaediEditaisDocuments = editaisDocuments;
    } catch {}
  };

  if (editaisList && editaisCount && editaisEmpty && editaisFilters && categoryFilter && yearFilter && statusFilter) {
    loadPublishedEditais().finally(() => {
      populateFilters();
      renderEditais();
    });

    editaisFilters.addEventListener("change", renderEditais);
    editaisFilters.addEventListener("submit", (event) => event.preventDefault());
  }
}
