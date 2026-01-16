require("dotenv").config();
const express = require("express");
const { startAutoRefresh } = require("./identifier/identifierServices");
const { authMiddleware } = require("./identifier/middleware");
const { client } = require("./services/whatsappClient");
const termin = require("./termin/terminController");
const contact = require("./contact/contactController");

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

startAutoRefresh(60000);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.json(
    { status: "success", message: "AIGNusaHub WhatsApp Bot is running!" },
    200
  );
});

client.initialize();

app.use("/termin", authMiddleware, termin);
app.use("/contact", authMiddleware, contact);
