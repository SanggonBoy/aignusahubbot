require("dotenv").config();
const express = require("express");
const { startAutoRefresh } = require("./identifier/identifierServices");
const { authMiddleware } = require("./identifier/middleware");
const { client } = require("./lib/services/whatsapp/whatsappClient");
const { startRedis } = require("./lib/services/redis/otpService");
const termin = require("./termin/terminController");
const contact = require("./contact/contactController");
const otp = require("./otp/otpController");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const startServer = async () => {
  try {
    startAutoRefresh(86400000);
    await startRedis();
    client.initialize();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Gagal menjalankan server:", error);
  }
};

startServer();

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "AIGNusaHub WhatsApp Bot is running!",
  });
});

app.use("/termin", authMiddleware, termin);
app.use("/contact", authMiddleware, contact);
app.use("/otp", authMiddleware, otp);
