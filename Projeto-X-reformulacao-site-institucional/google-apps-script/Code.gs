const DRIVE_FOLDER_ID = "1Wv5w6RrYodSl6bA15W7sL4eG7XQ-q8h-";
// Troque por uma chave aleatória longa (32+ caracteres) e use-a no painel.
const UPLOAD_KEY = "TROQUE_POR_UMA_CHAVE_ALEATORIA_LONGA_DE_32_CARACTERES_OU_MAIS";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_EDITAIS = 1000;
const STATE_FILE_NAME = "FAEDI_EDITAIS_DATABASE.json";
const STATE_FILE_PROPERTY = "FAEDI_EDITAIS_DATABASE_FILE_ID";

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (params.action === "list") {
    const callback = String(params.callback || "");
    if (!/^[A-Za-z_$][0-9A-Za-z_$.]*$/.test(callback)) {
      return ContentService.createTextOutput("Invalid callback").setMimeType(ContentService.MimeType.TEXT);
    }
    let state;
    try {
      state = readSharedState_();
    } catch (error) {
      state = { editais: null, error: "Não foi possível ler os editais compartilhados." };
    }
    const json = JSON.stringify(state).replace(/</g, "\\u003c");
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return HtmlService.createHtmlOutput("Serviço FAEDI ativo.");
}

function doPost(e) {
  let result;
  try {
    const params = e && e.parameter ? e.parameter : {};
    if (!UPLOAD_KEY || UPLOAD_KEY.indexOf("TROQUE_") === 0) {
      throw new Error("Configure uma chave secreta em UPLOAD_KEY no Apps Script e implante uma nova versão.");
    }
    if (params.key !== UPLOAD_KEY) throw new Error("A chave informada no painel não corresponde à chave UPLOAD_KEY desta implantação.");
    const action = params.action || "upload";
    if (action === "upload") {
      result = uploadPdf_(params);
    } else if (action === "save") {
      result = saveSharedState_(params);
    } else {
      throw new Error("Operação desconhecida.");
    }
    result.source = "faedi-drive-upload";
    result.requestId = String(params.requestId || "");
  } catch (error) {
    result = {
      source: "faedi-drive-upload",
      requestId: e && e.parameter ? String(e.parameter.requestId || "") : "",
      ok: false,
      error: error && error.message ? error.message : "Falha ao concluir a operação.",
    };
  }

  const payload = JSON.stringify(result).replace(/</g, "\\u003c");
  const html = "<!doctype html><meta charset=\"utf-8\"><script>window.top.postMessage(" + payload + ", \"*\");</script>";
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadPdf_(params) {
  if (!params.name || !params.base64) throw new Error("Faltam dados do PDF.");
  const name = String(params.name).replace(/[\\/:*?\"<>|\r\n]/g, "_").slice(0, 180);
  if (!name.toLowerCase().endsWith(".pdf")) throw new Error("O arquivo precisa ser PDF.");
  const bytes = Utilities.base64Decode(params.base64);
  if (bytes.length > MAX_FILE_SIZE) throw new Error("O PDF excede o limite de 5 MB.");
  if (bytes.length < 5 || bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70 || bytes[4] !== 45) {
    throw new Error("O arquivo selecionado não parece ser um PDF válido.");
  }
  const blob = Utilities.newBlob(bytes, "application/pdf", name);
  const file = DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, url: file.getUrl(), name: file.getName() };
}

function saveSharedState_(params) {
  if (!params.state) throw new Error("A lista de editais está vazia.");
  let incoming;
  try {
    incoming = JSON.parse(params.state);
  } catch (error) {
    throw new Error("Os dados dos editais estão inválidos.");
  }
  if (!incoming || !Array.isArray(incoming.editais) || incoming.editais.length > MAX_EDITAIS) {
    throw new Error("A lista de editais está em formato inválido ou excede o limite.");
  }
  const state = { editais: incoming.editais.map(cleanEdital_) };
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const file = getStateFile_();
    file.setContent(JSON.stringify(state));
    const savedFile = DriveApp.getFileById(file.getId());
    const savedState = JSON.parse(savedFile.getBlob().getDataAsString("UTF-8"));
    if (!savedState || !Array.isArray(savedState.editais)
      || JSON.stringify(savedState) !== JSON.stringify(state)) {
      throw new Error("O Drive não confirmou a gravação de todos os editais. Tente novamente.");
    }
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

function cleanEdital_(item) {
  const statusValues = ["aberto", "encerrado", "indisponivel"];
  if (!item || typeof item !== "object") throw new Error("Foi encontrado um edital inválido.");
  const edital = {
    id: String(item.id || "").slice(0, 100),
    title: String(item.title || "").trim().slice(0, 180),
    description: String(item.description || "").trim().slice(0, 500),
    category: String(item.category || "").trim().slice(0, 80),
    year: String(item.year || "").slice(0, 4),
    publicationDate: String(item.publicationDate || "").slice(0, 10),
    status: String(item.status || "indisponivel"),
    url: String(item.url || "").trim().slice(0, 2000),
  };
  if (!edital.id || !edital.title || !/^\d{4}$/.test(edital.year) || !statusValues.includes(edital.status)) {
    throw new Error("Confira o título, o ano e a situação do edital.");
  }
  if (edital.url && !/^https?:\/\//i.test(edital.url)) throw new Error("O link do documento precisa começar com http:// ou https://.");
  return edital;
}

function readSharedState_() {
  const file = getExistingStateFile_();
  if (!file) return { editais: null };
  const state = JSON.parse(file.getBlob().getDataAsString("UTF-8"));
  return { editais: Array.isArray(state.editais) ? state.editais : null };
}

function getExistingStateFile_() {
  const properties = PropertiesService.getScriptProperties();
  const fileId = properties.getProperty(STATE_FILE_PROPERTY);
  if (fileId) {
    try {
      return DriveApp.getFileById(fileId);
    } catch (error) {
      // O ID pode apontar para um arquivo removido; tente recuperá-lo pelo nome.
    }
    properties.deleteProperty(STATE_FILE_PROPERTY);
  }
  const matches = DriveApp.getFilesByName(STATE_FILE_NAME);
  if (!matches.hasNext()) return null;
  const file = matches.next();
  properties.setProperty(STATE_FILE_PROPERTY, file.getId());
  return file;
}

function getStateFile_() {
  const properties = PropertiesService.getScriptProperties();
  const existing = getExistingStateFile_();
  if (existing) return existing;
  const file = DriveApp.createFile(STATE_FILE_NAME, JSON.stringify({ editais: [] }), MimeType.PLAIN_TEXT);
  properties.setProperty(STATE_FILE_PROPERTY, file.getId());
  return file;
}
