const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { sendContactMessages } = require("./contactMessages");

const contactSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.base": "Full name must be text",
    "string.empty": "Full name is required",
    "any.required": "Full name is required",
    "string.min": "Full name must be at least {#limit} characters long",
    "string.max": "Full name cannot exceed {#limit} characters",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email address is required",
    "any.required": "Email address is required",
    "string.email": "Please provide a valid email address",
  }),

  phoneNumber: Joi.string().min(10).max(15).required().messages({
    "string.empty": "Phone number is required",
    "any.required": "Phone number is required",
    "string.min": "Phone number must be at least {#limit} digits",
    "string.max": "Phone number cannot exceed {#limit} digits",
  }),

  subject: Joi.string().min(5).max(150).required().messages({
    "string.empty": "Subject is required",
    "any.required": "Subject is required",
    "string.min": "Subject must be at least {#limit} characters long",
    "string.max": "Subject cannot exceed {#limit} characters",
  }),

  message: Joi.string().min(10).max(1000).required().messages({
    "string.empty": "Message is required",
    "any.required": "Message is required",
    "string.min": "Message is too short, minimum {#limit} characters",
    "string.max": "Message is too long, maximum {#limit} characters",
  }),
});

router.post("/", async (req, res) => {
  const adminNumber = process.env.ADMIN_NUMBER;
  const { error, value } = contactSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const formattedErrors = {};
    error.details.forEach((detail) => {
      const key = detail.path[0];
      const message = detail.message; 

      if (!formattedErrors[key]) {
        formattedErrors[key] = [];
      }
      formattedErrors[key].push(message);
    });
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: formattedErrors,
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
      err && err.message ? err.message : err,
    );
    return res.status(500).json({
      status: "error",
      message:
        err && err.message ? err.message : "Failed to send contact message",
    });
  }
});

module.exports = router;
