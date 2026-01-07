const qrcode = require("qrcode-terminal");
const { LocalAuth, Client, MessageMedia } = require("whatsapp-web.js");

// Deteksi OS dan environment untuk menentukan path Chrome/Chromium
const getChromePath = () => {
  // Jika ada environment variable CHROME_PATH (untuk Pterodactyl/Docker)
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else {
    // Linux/Docker/Pterodactyl - cek beberapa lokasi umum
    const fs = require("fs");
    const possiblePaths = [
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }

    // Default fallback
    return "/usr/bin/chromium-browser";
  }
};

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "AIGNusaHub",
    dataPath: process.env.DATA_PATH || "./.wwebjs_auth",
  }),
  puppeteer: {
    headless: true,
    executablePath: getChromePath(),
    args: [
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-default-browser-check",
      "--ignore-certificate-errors",
      "--single-process",
      "--no-zygote",
    ],
  },
});

client.on("qr", (qr) => {
  console.log("Scan QR Code berikut untuk login:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Client is authenticated");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failed:", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client disconnected:", reason);
});

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
