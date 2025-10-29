const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusLabel = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");
loginBtn.disabled = true;
logoutBtn.disabled = true;
sendBtn.disabled = true;

loginBtn.addEventListener("click", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

const source = new EventSource("http://localhost:1010/status");
source.onmessage = (event) => {
  statusLabel.textContent = event.data;
  if (event.data.startsWith("Logged out")) {
    loginBtn.disabled = false;
    logoutBtn.disabled = true;
    sendBtn.disabled = true;
  } else if (event.data.startsWith("Ready")) {
    sendBtn.disabled = false;
    loginBtn.disabled = true;
    logoutBtn.disabled = false;
  }
};
source.onerror = () => (statusLabel.textContent = "Disconnected");

async function handleLogin() {
  window.open("http://localhost:1010/qr", "_blank");
}
async function handleLogout() {
  await fetch("http://localhost:1010/logout", { method: "DELETE" });
}
