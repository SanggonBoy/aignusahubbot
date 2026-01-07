const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { sendTerminMessages } = require("./terminMessages");

const terminSchema = Joi.object({
  number: Joi.string()
    .pattern(/^62[0-9]{11,13}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base":
        "Phone number must start with 62 and have 13-15 digits",
      "any.required": "Phone number is required",
    }),
  data: Joi.object({
    name: Joi.string().required().min(3).messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters long",
      "any.required": "Name is required",
    }),
    dueDate: Joi.date().iso().required().messages({
      "date.base": "Due date must be a valid date",
      "date.format": "Due date must be in ISO format (YYYY-MM-DD)",
      "any.required": "Due date is required",
    }),
    amount: Joi.string().required().messages({
      "string.empty": "Amount is required",
      "any.required": "Amount is required",
    }),
  })
    .required()
    .messages({
      "any.required": "Data is required",
      "object.base": "Data must be an object",
    }),
});

router.post("/", async (req, res) => {
  req.body.number = req.body.number.toString();
  const { error, value } = terminSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }

  const data = await sendTerminMessages(value.number, value.data);
  res.json({
    status: data.status,
    message: data.message,
  });
});

module.exports = router;
