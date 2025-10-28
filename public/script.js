const loginBtn = document.getElementById("loginBtn");
const statusLabel = document.getElementById("status");

const source = new EventSource("http://localhost:1010/status");
source.onmessage = (event) => statusLabel.textContent = event.data;
  if (event.data.startsWith("Ready")) loginBtn.disabled = false;
source.onerror = () => statusLabel.textContent = "Disconnected";

async function handleLogin() {}