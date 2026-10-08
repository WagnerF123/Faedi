/* Cadastro centralizado dos TCCs. As instruções de preenchimento estão em arquivos/tcc/README.txt. */
/*
 * MODELO TÉCNICO — NÃO É UM TCC REAL E NÃO É EXECUTADO
 * {
 *   id: "IDENTIFICADOR_UNICO_REAL",
 *   title: "TÍTULO REAL DO TRABALHO",
 *   authors: ["NOME COMPLETO DO AUTOR", "NOME COMPLETO DO SEGUNDO AUTOR"],
 *   advisor: "NOME COMPLETO DO ORIENTADOR",
 *   coAdvisor: "NOME COMPLETO DO COORIENTADOR OU STRING VAZIA",
 *   course: "NOME REAL DO CURSO",
 *   year: "ANO REAL",
 *   semester: "SEMESTRE REAL",
 *   keywords: ["PALAVRA-CHAVE REAL", "OUTRA PALAVRA-CHAVE REAL"],
 *   abstract: "RESUMO REAL DO TRABALHO",
 *   publicationDate: "DATA REAL DE PUBLICAÇÃO",
 *   pdfUrl: "arquivos/tcc/NOME-REAL-DO-ARQUIVO.pdf",
 * },
 */
const tccDocuments = Object.freeze([
  // Cole aqui somente registros reais e autorizados.
]);

// Disponibiliza somente registros reais e autorizados para a busca compartilhada.
window.FaediTccDocuments = tccDocuments;

const tccPage = document.querySelector(".tcc-page");

if (tccPage) {
  const tccFilters = tccPage.querySelector("[data-tcc-filters]");
  const tccSearch = tccPage.querySelector("[data-tcc-search]");
  const courseFilter = tccPage.querySelector('[data-tcc-filter="course"]');
  const yearFilter = tccPage.querySelector('[data-tcc-filter="year"]');
  const tccCount = tccPage.querySelector("[data-tcc-count]");
  const tccList = tccPage.querySelector("[data-tcc-list]");
  const tccEmpty = tccPage.querySelector("[data-tcc-empty]");

  const toText = (value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(", ");
    }

    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  };

  const normalizeText = (value) => toText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

  const createElement = (tagName, className, textContent = "") => {
    const element = document.createElement(tagName);
    element.className = className;

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  };

  const hasSafePdfUrl = (pdfUrl) => {
    if (typeof pdfUrl !== "string" || !pdfUrl.trim()) {
      return false;
    }

    try {
      const documentUrl = new URL(pdfUrl.trim(), window.location.href);
      return documentUrl.protocol === "http:" || documentUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const addMetadata = (list, label, value) => {
    const text = toText(value);

    if (!text) {
      return;
    }

    const item = createElement("div", "tcc-card-meta-item");
    item.append(
      createElement("dt", "tcc-card-meta-label", label),
      createElement("dd", "tcc-card-meta-value", text)
    );
    list.append(item);
  };

  const addPerson = (container, label, value) => {
    const text = toText(value);

    if (!text) {
      return;
    }

    const item = createElement("p", "tcc-card-person");
    item.append(createElement("strong", "tcc-card-person-label", `${label}: `));
    item.append(document.createTextNode(text));
    container.append(item);
  };

  const createTccCard = (documentData) => {
    const card = createElement("article", "tcc-card");
    const content = createElement("div", "tcc-card-content");
    const header = createElement("div", "tcc-card-header");
    const title = createElement("h3", "tcc-card-title", documentData.title);
    const people = createElement("div", "tcc-card-people");
    const metadata = createElement("dl", "tcc-card-meta");
    const action = createElement("div", "tcc-card-action");
    const titleId = `${documentData.id}-title`;

    card.dataset.tccId = documentData.id;
    card.setAttribute("aria-labelledby", titleId);
    title.id = titleId;

    header.append(createElement("span", "tcc-card-icon", "TCC"));

    if (documentData.course) {
      header.append(createElement("span", "tcc-card-course", documentData.course));
    }

    content.append(header, title);

    const authors = Array.isArray(documentData.authors)
      ? documentData.authors.filter(Boolean)
      : documentData.authors;
    const authorLabel = Array.isArray(authors) && authors.length > 1 ? "Autores" : "Autor";

    addPerson(people, authorLabel, authors);
    addPerson(people, "Orientador", documentData.advisor);
    addPerson(people, "Coorientador", documentData.coAdvisor);

    if (people.children.length) {
      content.append(people);
    }

    addMetadata(metadata, "Curso", documentData.course);
    addMetadata(metadata, "Ano", documentData.year);
    addMetadata(metadata, "Semestre", documentData.semester);
    addMetadata(metadata, "Publicação", documentData.publicationDate);

    if (metadata.children.length) {
      content.append(metadata);
    }

    const keywords = Array.isArray(documentData.keywords)
      ? documentData.keywords.filter(Boolean)
      : [];

    if (keywords.length) {
      const keywordSection = createElement("div", "tcc-card-keywords");
      keywordSection.append(createElement("strong", "tcc-card-keywords-label", "Palavras-chave"));
      const keywordList = createElement("ul", "tcc-card-keyword-list");

      keywords.forEach((keyword) => {
        keywordList.append(createElement("li", "tcc-card-keyword", keyword));
      });

      keywordSection.append(keywordList);
      content.append(keywordSection);
    }

    if (documentData.abstract) {
      const abstractSection = createElement("div", "tcc-card-abstract");
      abstractSection.append(
        createElement("strong", "tcc-card-abstract-label", "Resumo"),
        createElement("p", "tcc-card-abstract-text", documentData.abstract)
      );
      content.append(abstractSection);
    }

    if (hasSafePdfUrl(documentData.pdfUrl)) {
      const link = createElement("a", "tcc-card-link", "Visualizar PDF");
      link.href = documentData.pdfUrl.trim();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Abrir PDF do trabalho: ${documentData.title} (nova aba)`);
      action.append(link);
    } else {
      const unavailable = createElement("span", "tcc-card-link tcc-card-link--disabled", "Documento indisponível");
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
    const courses = [...new Set(tccDocuments.map((documentData) => documentData.course).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, "pt-BR"));
    const years = [...new Set(tccDocuments.map((documentData) => toText(documentData.year)).filter(Boolean))]
      .sort((first, second) => Number(second) - Number(first));

    appendFilterOptions(courseFilter, courses);
    appendFilterOptions(yearFilter, years);
  };

  const getSearchableText = (documentData) => normalizeText([
    documentData.title,
    documentData.authors,
    documentData.advisor,
    documentData.coAdvisor,
    documentData.keywords,
  ].map(toText));

  const getFilteredDocuments = () => {
    const searchTerm = normalizeText(tccSearch.value);

    return tccDocuments.filter((documentData) => {
      const matchesSearch = !searchTerm || getSearchableText(documentData).includes(searchTerm);
      const matchesCourse = !courseFilter.value || documentData.course === courseFilter.value;
      const matchesYear = !yearFilter.value || toText(documentData.year) === yearFilter.value;

      return matchesSearch && matchesCourse && matchesYear;
    });
  };

  const renderDocuments = () => {
    const filteredDocuments = getFilteredDocuments();
    const fragment = document.createDocumentFragment();

    filteredDocuments.forEach((documentData) => {
      fragment.append(createTccCard(documentData));
    });

    tccList.replaceChildren(fragment);
    tccCount.textContent = `${filteredDocuments.length} ${filteredDocuments.length === 1 ? "trabalho encontrado" : "trabalhos encontrados"}.`;

    if (filteredDocuments.length) {
      tccEmpty.hidden = true;
      return;
    }

    tccEmpty.hidden = false;
    tccEmpty.textContent = tccDocuments.length
      ? "Nenhum trabalho corresponde aos critérios informados."
      : "Nenhum trabalho está disponível para consulta no momento.";
  };

  if (tccFilters && tccSearch && courseFilter && yearFilter && tccCount && tccList && tccEmpty) {
    populateFilters();
    renderDocuments();

    tccSearch.addEventListener("input", renderDocuments);
    tccFilters.addEventListener("change", renderDocuments);
    tccFilters.addEventListener("submit", (event) => event.preventDefault());
  }
}
