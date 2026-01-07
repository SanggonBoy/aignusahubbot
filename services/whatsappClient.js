const qrcode = require("qrcode-terminal");
const { LocalAuth, Client, MessageMedia } = require("whatsapp-web.js");

// Deteksi OS dan environment untuk menentukan path Chrome/Chromium
const getChromePath = () => {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else {
    const fs = require("fs");
    const possiblePaths = [
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        console.log(`Chrome ditemukan di: ${path}`);
        return path;
      }
    }

    return "/usr/bin/google-chrome-stable";
  }
};

let clientReady = false;
let initAttempts = 0;
const MAX_ATTEMPTS = 3;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "AIGNusaHub",
    dataPath: process.env.DATA_PATH || "./.wwebjs_auth",
  }),
  puppeteer: {
    headless: true,
    executablePath: getChromePath(),
    timeout: 60000,
    args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"
    ],
  },
});

client.on("qr", (qr) => {
  console.log("📱 Scan QR Code berikut untuk login:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("✅ Client is authenticated");
  clientReady = true;
  initAttempts = 0;
});

client.on("ready", () => {
  console.log("🚀 Client is ready!");
  clientReady = true;
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication failed:", msg);
});

client.on("disconnected", (reason) => {
  console.log("⚠️ Client disconnected:", reason);
  clientReady = false;

  // Auto-reconnect setelah 10 detik
  setTimeout(() => {
    if (!clientReady) {
      console.log("🔄 Attempting to reconnect...");
      client.initialize().catch((err) => {
        console.error("❌ Reconnect failed:", err.message);
      });
    }
  }, 10000);
});

client.on("error", (err) => {
  console.error("❌ Client error:", err.message);
});

// Initialize dengan retry logic
const initializeClient = async () => {
  try {
    console.log(
      `🔄 Initializing WhatsApp Client (Attempt ${
        initAttempts + 1
      }/${MAX_ATTEMPTS})...`
    );
    await client.initialize();
  } catch (error) {
    initAttempts++;
    console.error(`❌ Initialization failed:`, error.message);

    if (initAttempts < MAX_ATTEMPTS) {
      console.log(`⏳ Retrying in 5 seconds...`);
      setTimeout(() => {
        initializeClient();
      }, 5000);
    } else {
      console.error(
        "❌ Max initialization attempts reached. Please check Chrome installation."
      );
      console.error(
        "Tip: Run 'google-chrome-stable --version' to verify Chrome is installed"
      );
      process.exit(1);
    }
  }
};

// Start initialization
initializeClient();

const sendMessage = async (number, message) => {
  const state = await client.getState();
  if (state !== "CONNECTED") {
    throw new Error("WhatsApp client is not ready");
  }

  let formattedNumber = number.replace(/[^\d]/g, "");

  if (!formattedNumber.startsWith("62")) {
    formattedNumber = "62" + formattedNumber.replace(/^0/, "");
  }

  formattedNumber = formattedNumber + "@c.us";

  await client.sendMessage(formattedNumber, message);
  return { status: "success", message: "Message sent successfully" };
};

module.exports = {
  client,
  sendMessage,
  MessageMedia,
};
