const loginBtn = document.getElementById("loginBtn");
const statusLabel = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");
loginBtn.disabled = true;
sendBtn.disabled = true;

loginBtn.addEventListener("click", handleLogin);

const source = new EventSource("http://localhost:1010/status");
source.onmessage = (event) => {
    statusLabel.textContent = event.data;
    if (event.data.startsWith("Logged out")) loginBtn.disabled = false;
    else if (event.data.startsWith("Ready")) {
        sendBtn.disabled = false;
        loginBtn.disabled = true;
    }
}
source.onerror = () => statusLabel.textContent = "Disconnected";

async function handleLogin() {
    window.open("http://localhost:1010/qr", "_blank");
}