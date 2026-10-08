(() => {
  const endpoint = () => (window.FAEDI_DRIVE_UPLOAD_URL || "").trim();
  const request = (fields) => new Promise((resolve, reject) => {
    const url = endpoint();
    if (!url || !url.endsWith("/exec")) {
      reject(new Error("Configure o URL /exec do Apps Script em js/google-drive-config.js."));
      return;
    }
    const requestId = crypto.randomUUID();
    const iframe = document.createElement("iframe");
    iframe.name = `faedi-apps-script-${requestId}`;
    iframe.hidden = true;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = iframe.name;
    form.hidden = true;
    Object.entries({ ...fields, requestId }).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      form.append(input);
    });
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timeoutId);
      form.remove();
      iframe.remove();
    };
    const onMessage = (event) => {
      const isAppsScriptFrame = /^https:\/\/(?:[a-z0-9-]+-)?script\.googleusercontent\.com$/i.test(event.origin);
      const isOpaqueSandboxFrame = event.origin === "null";
      const isExpectedSource = event.source === iframe.contentWindow || isAppsScriptFrame || isOpaqueSandboxFrame;
      if (!isExpectedSource || !event.data || event.data.source !== "faedi-drive-upload" || event.data.requestId !== requestId) return;
      cleanup();
      if (event.data.ok) resolve(event.data);
      else reject(new Error(event.data.error || "O Apps Script não conseguiu concluir a operação."));
    };
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("O Apps Script não respondeu. Confira o URL e a implantação."));
    }, 90000);
    window.addEventListener("message", onMessage);
    document.body.append(iframe, form);
    form.submit();
  });

  const loadState = () => new Promise((resolve, reject) => {
    const url = endpoint();
    if (!url || !url.endsWith("/exec")) {
      reject(new Error("Configure o URL /exec do Apps Script em js/google-drive-config.js."));
      return;
    }
    const callbackName = `__faediState_${crypto.randomUUID().replaceAll("-", "")}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
      clearTimeout(timeoutId);
    };
    window[callbackName] = (state) => {
      cleanup();
      if (!state || state.error) {
        reject(new Error(state && state.error ? state.error : "O Apps Script retornou um cadastro inválido."));
        return;
      }
      resolve(state);
    };
    script.onerror = () => { cleanup(); reject(new Error("Não foi possível carregar os editais compartilhados.")); };
    script.src = `${url}?action=list&callback=${callbackName}&_=${Date.now()}`;
    const timeoutId = setTimeout(() => { cleanup(); reject(new Error("Tempo esgotado ao carregar os editais compartilhados.")); }, 15000);
    document.head.append(script);
  });

  const uploadPdf = async (file, key) => {
    if (!key) throw new Error("Digite a chave de envio definida no Google Apps Script.");
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) throw new Error("Selecione um arquivo PDF.");
    if (file.size > 5 * 1024 * 1024) throw new Error("O PDF precisa ter no máximo 5 MB.");
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Não foi possível ler o PDF selecionado."));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
    const result = await request({ action: "upload", key, name: file.name, base64: dataUrl.split(",")[1] || "" });
    if (!result.url) throw new Error("O Apps Script não retornou o link do PDF.");
    return result.url;
  };

  const saveState = (state, key) => {
    if (!key) return Promise.reject(new Error("Digite a chave de envio definida no Google Apps Script."));
    return request({ action: "save", key, state: JSON.stringify(state) });
  };

  window.FaediAppsScript = { loadState, uploadPdf, saveState };
})();
