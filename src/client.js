import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg

const client = new Client({ authStrategy: new LocalAuth() });
client.state = "Unknown"
client.on('authenticated', () => client.state = "Just logged in")
client.on('ready', () => client.state = "Ready")
client.on('disconnected', () => client.state = "Disconnected")
client.on('auth_failure', () => client.state = "Auth Failure")
client.on('qr', (qr) => {
    client.state = "Logged out - Scan QR"
    client.qr = qr
})
export default client;