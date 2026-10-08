const loginForm = document.querySelector("[data-admin-login]");
const passwordInput = document.querySelector("#admin-password");
const passwordToggle = document.querySelector("[data-password-toggle]");
const feedback = document.querySelector("[data-login-feedback]");
const loginButton = loginForm.querySelector("button[type=submit]");
const localPasswordHash = "98dc3555953506b683eb22293105cef631e3b4a13049724144a516c05e72776a";

const showFeedback = (message) => {
  feedback.textContent = message;
  feedback.hidden = false;
};

const matchesPassword = async (password) => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return hash === localPasswordHash;
};

passwordToggle.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.textContent = isPassword ? "Ocultar" : "Mostrar";
  passwordToggle.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.hidden = true;
  loginButton.disabled = true;
  loginButton.textContent = "Verificando...";

  try {
    if (!await matchesPassword(passwordInput.value)) {
      throw new Error("Acesso negado.");
    }

    sessionStorage.setItem("faediAdminLocalAccess", "granted");
    window.location.assign("admin-editais.html");
  } catch (error) {
    showFeedback(error.message === "Acesso negado."
      ? "Você não tem permissão para acessar o painel administrativo."
      : error.message);
    passwordInput.value = "";
    passwordInput.focus();
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Acessar painel";
  }
});
