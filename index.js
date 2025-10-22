const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs').promises;
const path = require('path');
const qrcode = require('qrcode-terminal');

async function readNumbers(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    return data
        .split(',')           // split by commas
        .map(n => n.trim())   // remove whitespace
        .filter(n => n !== '') // ignore empties
}

async function sleep() {
    const jitter = 6000 + Math.floor(Math.random() * 4000)
    return new Promise(resolve => setTimeout(resolve, jitter));
}

async function sendMessages(numbersPath, mediaPath, message) {
    if (!numbersPath || !message) {
        console.error('Please provide both numbers and the message.');
        return;
    }
    message = message.trim();


    let numbers = [];
    let media = null;
    try {
        if (mediaPath) media = MessageMedia.fromFilePath(mediaPath) //C:/Users/sahir/Documents/Personal/Dev/whatsapp_sender/media/IMG-20251017-WA0005.jpg
        numbers = await readNumbers(numbersPath);
    } catch (e) {
        console.error('Error reading numbers or media:', e);
    }
    for (const number of numbers) {
        await sleep();
        try {
            await sendToNumber(number, {message, media});
            console.log(`Message sent to ${number}`)
        } catch (e) {
            console.error(`Error sending to ${number}:`, e);
        }
    }

}
async function sendToNumber(number, payload) {
    // number must be in international form like '92303....'
    const id = await client.getNumberId(number); // returns null if not a WhatsApp user
    if (!id) {
        console.warn(`SKIPPING: Number ${number} is not a WhatsApp user.`);
        return;
    }

    if (payload.media) {
        return client.sendMessage(id._serialized, payload.media, { caption: payload.text });
    } else {
        return client.sendMessage(id._serialized, payload.message);
    }
}

const client = new Client({ authStrategy: new LocalAuth() });

client.on('ready', async () => {
    console.log('Client is ready!');

    const message = "TEST MESSAGE; Disregard, please."
    const numbersPath = path.join(__dirname, 'media', 'numbers.txt');
    const mediaPath = ""//path.join(__dirname, 'media', 'IMG-20251017-WA0005.jpg');
    try {
        await sendMessages(numbersPath, mediaPath, message);
        console.log("Bulk send done!")
    } catch (e) {
        console.error("Error sending messages:", e);
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();