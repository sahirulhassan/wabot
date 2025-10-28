const loginBtn = document.getElementById("loginBtn");
loginBtn.disabled = true;
const statusLabel = document.getElementById("status");

const source = new EventSource("http://localhost:1010/status");
source.onmessage = (event) => {
  statusLabel.textContent = event.data;
};
source.onerror = () => {
    statusLabel.textContent = "Disconnected";
};

async function handleLogin() {}
