const accessBox = document.querySelector("[data-admin-access]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const form = document.querySelector("[data-edital-form]");
const list = document.querySelector("[data-admin-list]");
const empty = document.querySelector("[data-admin-empty]");
const count = document.querySelector("[data-admin-count]");
const notice = document.querySelector("[data-admin-notice]");
const userLabel = document.querySelector("[data-admin-user]");
const submitButton = document.querySelector("[data-admin-submit]");
const cancelButton = document.querySelector("[data-admin-cancel]");
const formTitle = document.querySelector("[data-admin-form-title]");

let editais = [];
let sharedStateAvailable = false;
const saveLocalEditais = () => localStorage.setItem("faediAdminLocalEditais", JSON.stringify(editais));
const getUploadKeyStorageKey = () => `faediDriveUploadKey:${(window.FAEDI_DRIVE_UPLOAD_URL || "").trim()}`;
const getUploadKey = () => form.elements.uploadKey.value
  || sessionStorage.getItem(getUploadKeyStorageKey())
  || sessionStorage.getItem("faediDriveUploadKey")
  || "";
const normalizeForComparison = (value) => {
  if (Array.isArray(value)) return value.map(normalizeForComparison);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeForComparison(value[key])]));
};
const saveSharedEditais = async (updatedEditais, key) => {
  // Atualiza a lista imediatamente neste navegador; a cópia compartilhada é confirmada em seguida.
  editais = updatedEditais;
  saveLocalEditais();
  render();
  try {
    if (!sharedStateAvailable) throw new Error("Não foi possível conectar ao cadastro compartilhado.");
    await window.FaediAppsScript.saveState({ editais: updatedEditais }, key);
    const confirmation = await window.FaediAppsScript.loadState();
    if (!confirmation || !Array.isArray(confirmation.editais)
      || JSON.stringify(normalizeForComparison(confirmation.editais)) !== JSON.stringify(normalizeForComparison(updatedEditais))) {
      throw new Error("O Apps Script não confirmou a gravação.");
    }
    sessionStorage.setItem(getUploadKeyStorageKey(), key);
    return { shared: true };
  } catch (error) {
    if (/chave/i.test(error.message || "")) {
      sessionStorage.removeItem(getUploadKeyStorageKey());
      sessionStorage.removeItem("faediDriveUploadKey");
    }
    return { shared: false, error };
  }
};
const loadDeletedEditais = () => {
  try {
    const deleted = JSON.parse(localStorage.getItem("faediAdminDeletedEditais") || "[]");
    return Array.isArray(deleted) ? new Set(deleted) : new Set();
  } catch {
    return new Set();
  }
};
const loadLocalEditais = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("faediAdminLocalEditais") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
const showNotice = (message, type = "success") => {
  notice.textContent = message;
  notice.className = `admin-notice admin-notice--${type}`;
  notice.hidden = false;
};

const resetForm = () => {
  form.reset();
  form.elements.id.value = "";
  form.elements.year.value = new Date().getFullYear();
  form.elements.status.value = "aberto";
  formTitle.textContent = "Novo edital";
  submitButton.textContent = "Publicar edital";
  cancelButton.hidden = true;
};

const text = (value) => value || "Não informado";

const render = () => {
  list.replaceChildren();
  count.textContent = editais.length;
  empty.hidden = editais.length > 0;
  editais.forEach((edital) => {
    const item = document.createElement("article");
    item.className = "admin-edital-item";
    const title = document.createElement("h3");
    title.textContent = edital.title;
    const details = document.createElement("p");
    details.textContent = `${text(edital.category)} • ${text(edital.year)} • ${text(edital.status)}`;
    const actions = document.createElement("div");
    actions.className = "admin-item-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Editar";
    edit.addEventListener("click", () => {
      Object.entries(edital).forEach(([key, value]) => {
        if (form.elements[key] && key !== "file") form.elements[key].value = value || "";
      });
      formTitle.textContent = "Editar edital";
      submitButton.textContent = "Salvar alterações";
      cancelButton.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-delete";
    remove.textContent = "Excluir";
    remove.addEventListener("click", async () => {
      if (!window.confirm(`Excluir \"${edital.title}\"?`)) return;
      const key = getUploadKey();
      if (!key) {
        showNotice("Digite a chave de envio antes de remover um edital.", "error");
        form.elements.uploadKey.focus();
        return;
      }
      try {
        const updatedEditais = editais.filter((entry) => entry.id !== edital.id);
        const result = await saveSharedEditais(updatedEditais, key);
        if (form.elements.id.value === edital.id) resetForm();
        showNotice(result.shared
          ? "Edital removido do cadastro compartilhado."
          : `Edital removido desta lista neste navegador, mas a remoção não foi sincronizada para os visitantes: ${result.error.message}`,
        result.shared ? "success" : "error");
      } catch (error) { showNotice(error.message, "error"); }
    });
    actions.append(edit, remove);
    item.append(title, details, actions);
    list.append(item);
  });
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const file = data.file;
  const uploadKey = data.uploadKey || getUploadKey();
  delete data.file;
  delete data.uploadKey;
  let pdfEnviadoAoDrive = false;
  let savedLocally = false;
  const isEditing = Boolean(data.id);
  const saved = { ...data, id: data.id || `edital-${Date.now()}` };
  let updatedEditais = isEditing
    ? editais.map((item) => item.id === saved.id ? saved : item)
    : [saved, ...editais];
  try {
    submitButton.disabled = true;
    editais = updatedEditais;
    saveLocalEditais();
    render();
    savedLocally = true;
    if (file && file.size) {
      submitButton.textContent = "Enviando PDF ao Drive...";
      data.url = await window.FaediAppsScript.uploadPdf(file, uploadKey);
      pdfEnviadoAoDrive = true;
      saved.url = data.url;
      updatedEditais = isEditing
        ? editais.map((item) => item.id === saved.id ? saved : item)
        : editais.map((item) => item.id === saved.id ? saved : item);
      editais = updatedEditais;
      saveLocalEditais();
      render();
    }
    submitButton.textContent = "Publicando edital no site...";
    const result = await saveSharedEditais(updatedEditais, uploadKey);
    resetForm();
    if (result.shared) {
      const successMessage = pdfEnviadoAoDrive
        ? `Edital ${isEditing ? "atualizado" : "publicado"} no site e PDF enviado ao Google Drive com sucesso.`
        : isEditing ? "Edital atualizado no site compartilhado com sucesso." : "Edital publicado no site compartilhado com sucesso.";
      showNotice(successMessage);
    } else {
      showNotice(`Edital adicionado nesta lista neste navegador, mas NÃO foi publicado para os demais visitantes. Falha na sincronização: ${result.error.message}`,
        "error");
    }
  } catch (error) {
    if (/chave/i.test(error.message || "")) {
      sessionStorage.removeItem(getUploadKeyStorageKey());
      sessionStorage.removeItem("faediDriveUploadKey");
    }
    if (savedLocally) {
      resetForm();
      showNotice(`O edital ficou nesta lista neste navegador, mas não foi publicado para os demais visitantes. ${error.message}`,
        "error");
    } else {
      showNotice(error.message, "error");
    }
  }
  finally {
    submitButton.disabled = false;
    submitButton.textContent = form.elements.id.value ? "Salvar alterações" : "Publicar edital";
  }
});

cancelButton.addEventListener("click", resetForm);
document.querySelector("[data-admin-logout]").addEventListener("click", () => {
  sessionStorage.removeItem("faediAdminLocalAccess");
  window.location.assign("editais.html");
});

const start = () => {
  if (sessionStorage.getItem("faediAdminLocalAccess") === "granted") {
    userLabel.textContent = "Conectado como administrador";
    accessBox.hidden = true;
    dashboard.hidden = false;
    resetForm();
    (async () => {
      const deleted = loadDeletedEditais();
      const byId = new Map((window.FaediEditaisDocuments || []).filter((item) => !deleted.has(item.id)).map((item) => [item.id, item]));
      loadLocalEditais().filter((item) => !deleted.has(item.id)).forEach((item) => byId.set(item.id, item));
      const localFallback = [...byId.values()];
      try {
        const sharedState = await window.FaediAppsScript.loadState();
        sharedStateAvailable = true;
        editais = sharedState && Array.isArray(sharedState.editais) ? sharedState.editais : localFallback;
        if (editais === localFallback) {
          showNotice("Cadastro compartilhado conectado, mas ainda sem editais salvos. Ao publicar, os editais atuais serão sincronizados com o site.");
        }
      } catch (error) {
        sharedStateAvailable = false;
        editais = localFallback;
        showNotice(`${error.message} Publicação compartilhada indisponível até restabelecer a conexão.`, "error");
      }
      render();
    })();
    return;
  }
  accessBox.innerHTML = "<span class=\"admin-mark\">FAEDI</span><h1>Acesso restrito</h1><p>Você não tem permissão para acessar o painel administrativo.</p><a class=\"admin-access-link\" href=\"acesso-editais.html\">Ir para o acesso administrativo</a>";
};

start();
