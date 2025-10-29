# WhatsApp Bulk Messaging Bot | WABot 📱

A Node.js-based WhatsApp automation bot that enables bulk message and media sending through WhatsApp Web. Built with Express.js and whatsapp-web.js, this application provides a simple web interface and REST API for managing WhatsApp messaging operations.

## 🌟 Features

- **Bulk Messaging**: Send messages to multiple WhatsApp numbers simultaneously
- **Media Support**: Share images and videos
- **QR Code Authentication**: Easy WhatsApp Web login via QR code scanning
- **Web Interface**: User-friendly dashboard for managing bot operations
- **Rate Limiting**: Built-in concurrency control (5 concurrent messages) to prevent blocks
- **Message Throttling**: Randomized delays (6-10 seconds) between messages to simulate human behavior
- **Detailed Logging**: Comprehensive logging of all message sending operations
- **Session Persistence**: Maintains WhatsApp session across restarts
- **Multiple Media Support**: Send multiple media files in a single operation
- **CORS Enabled**: Ready for frontend integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A WhatsApp account

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/sahirulhassan/wabot>
   cd wabot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=1010
   ```

4. **Start the server**
   
   **Development mode** (with auto-restart):
   ```bash
   npm run dev
   ```
   
   **Production mode**:
   ```bash
   npm start
   ```

## 🔧 Usage

### Web Interface

1. Start the server
2. Open public/index.html file in your browser
3. Click on the Login button
4. Scan the QR code with your WhatsApp mobile app
5. Wait for the "Ready" status
6. Start sending messages!

### API Endpoints

#### 1. Get Status (SSE)
GET /status

**Response:**
```json
{
  "status": "ready"
}
```

#### 2. Get QR Code
GET /qr

**Response:**
```json
{
  "qr": "data:image/png;base64,..."
}
```
#### 3. Send Messages
POST /message

Content-Type: multipart/form-data

**Parameters:**
- `numbers` (required): Comma-separated WhatsApp numbers in international format without '+' sign
    - Example: `1234567890,9876543210`
- `message`: Text message to send
- `files`: Media files to send (multiple files supported)

🔐 Number Format:
Numbers must be in international format without the '+' sign:

✅ Correct: 1234567890,9876543210<br>
❌ Incorrect: +1234567890,+9876543210<br>
❌ Incorrect: 123 (too short, minimum 7 digits)

#### 4. Logout
DELETE /logout

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

🛡️ Rate Limiting
The bot includes built-in rate limiting to prevent WhatsApp from blocking your number:
<br>Concurrent Limit: 5 messages at a time
<br>Message Delay: Random delay between 6-10 seconds between messages
This helps simulate human-like behavior and reduces the risk of account suspension


📊 Logging
All message sending operations are logged in the logs/ directory with timestamps. Each log file contains:
<br>Sent numbers
<br>Success/failure status
<br>Log files are named with timestamps: logs/1234567890123.json

⚙️ Configuration
Port Configuration
Change the port in .env:
PORT=1010


### Concurrency Limit
Modify the concurrent message limit in : `src/whatsapp-services.js`
<br>

```const limit = pLimit(5);``` // Change 5 to desired limit

### Message Delay
Adjust the delay between messages in : `src/whatsapp-services.js`<br>

```
async function sleep() {
const jitter = 6000 + Math.floor(Math.random() * 4000); // 6-10 seconds
return new Promise((resolve) => setTimeout(resolve, jitter));
}
```
## 🐛 Troubleshooting
### QR Code Not Displaying
- Ensure WhatsApp Web is not already logged in on another device
- Clear the `.wwebjs_auth``.wwebjs_cache` and folders and restart

### Client Not Ready Error
- Wait for the client to fully initialize (check `/status` endpoint)
- Scan the QR code if the session has expired

### Messages Not Sending
- Verify numbers are in correct international format
- Check if numbers are registered on WhatsApp using the validation endpoint
- Review logs in the directory for error details `logs/`

### Port Already in Use
- Change the PORT in to an available port `.env`
- Or stop the process using the current port

## 📦 Dependencies
### Main Dependencies
- `express` - Web framework
- `whatsapp-web.js` - Whatsapp Puppeteer Lib
- `multer` File upload handling
- `qrcode` - QR code generation
- `dotenv` - Environment configuration
- `cors` Cross-origin resource sharing 
- `cookie-parser` - Cookie parsing
- `express-rate-limit` - API rate limiting
- `p-limit` Promise concurrency control 
- `morgan` HTTP request logger 

### Dev Dependencies
- `nodemon` Auto-restart development server 
- `eslint` - Code linting
- `prettier` - Code formatting

## ⚠️ Important Notes
- **WhatsApp Terms of Service**: This bot automates WhatsApp Web. Be aware that automated messaging may violate WhatsApp's Terms of Service
- **Account Safety**: Use responsibly to avoid account suspension
- **Rate Limits**: Don't send too many messages in short periods
- **Personal Use**: This tool is intended for personal/educational use only

## 📝 License
This project is provided as-is for educational purposes.
## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
## 👤 Author
Sahir Ul Hassan
## 🙏 Acknowledgments
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - The library that makes this possible
- Express.js community

**Disclaimer**: This project is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp or any of its affiliates or subsidiaries. Use at your own risk.