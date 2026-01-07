require("dotenv").config();
const express = require("express");
const { startAutoRefresh } = require("./identifier/identifierServices");
const { authMiddleware } = require("./identifier/middleware");
const { client } = require("./services/whatsappClient");
const termin = require("./termin/terminController");

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

startAutoRefresh(60000);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

client.initialize();

app.use("/termin", authMiddleware, termin);
