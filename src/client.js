import pkg from 'whatsapp-web.js';
import qrcode from "qrcode-terminal";
const { Client, LocalAuth, MessageMedia } = pkg

const client = new Client({ authStrategy: new LocalAuth() });
await client.initialize()
client.state = "Unknown"
client.on('authenticated', () => client.state = "Logged in")
client.on('ready', () => client.state = "Ready")
client.on('disconnected', () => client.state = "Disconnected")
client.on('auth_failure', () => client.state = "Auth Failure")
client.on('qr', (qr) => {
    client.state = "Logged out - Scan QR"
    client.qr = qr
    //qrcode.generate(qr, {small: true})
})

export default client;