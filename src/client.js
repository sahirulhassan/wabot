import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

const client = new Client({ authStrategy: new LocalAuth() });
client.state = "Unknown - Please wait...";
client.on(
  "authenticated",
  () => (client.state = "Just logged in. Please wait for ready status."),
);
client.on(
  "ready",
  () => (client.state = "Ready - You can start sending messages now."),
);
client.on("disconnected", () => (client.state = "Disconnected"));
client.on("auth_failure", () => (client.state = "Auth Failure"));
client.on("qr", (qr) => {
  client.state = "Logged out - Scan QR to login";
  client.qr = qr;
});
export default client;
