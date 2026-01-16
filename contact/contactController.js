const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { sendContactMessages } = require("./contactMessages");

const contactSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().min(10).max(15).required(),
  subject: Joi.string().min(3).max(150).required(),
  message: Joi.string().min(10).max(1000).required(),
});

router.post("/", async (req, res) => {
  const adminNumber = process.env.ADMIN_NUMBER;
  const { error, value } = contactSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }

  if (!adminNumber) {
    return res.status(500).json({
      status: "error",
      message: "ADMIN_NUMBER not configured on the server",
    });
  }

  try {
    const result = await sendContactMessages(adminNumber, value);
    return res.json({
      status: result.status,
      message: result.message,
    });
  } catch (err) {
    console.error(
      "❌ Failed to send contact message:",
      err && err.message ? err.message : err
    );
    return res.status(500).json({
      status: "error",
      message:
        err && err.message ? err.message : "Failed to send contact message",
    });
  }
});

module.exports = router;
