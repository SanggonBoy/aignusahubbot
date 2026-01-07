const express = require("express");
const router = express.Router();
const { sendMessage } = require("../services/whatsappClient");

router.post("/send", async (req, res) => {
  try {
    const { number, message } = req.body;

    console.log(
      `Request from user: ${req.user?.name || req.user?.key || "Unknown"}`
    );

    if (!number || !message) {
      return res
        .status(400)
        .json({ status: "error", message: "Number and message are required" });
    }

    const result = await sendMessage(number, message);
    res.json(result);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
