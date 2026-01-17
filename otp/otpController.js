const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { sendOtpMessages } = require("./otpMessages");
const { createOtp, getAllData } = require("../lib/services/redis/otpService");
const crypto = require("crypto");

const otpSchema = Joi.object({
    phone: Joi.string().min(10).max(20).required().messages({
        "string.empty": "Phone number is required",
        "any.required": "Phone number is required",
        "string.min": "Phone number must be at least {#limit} digits",
        "string.max": "Phone number cannot exceed {#limit} digits",
    }),
});

router.get('/', async (req, res) => {
    try {
        const result = await getAllData();
        return res.json({
            status: "success",
            message: "Data retrieved successfully",
            data: result,
        });
    } catch (err) {
        console.error(
            "Failed to get OTP:",
            err && err.message ? err.message : err,
        );
        return res.status(500).json({
            status: "error",
            message:
                err && err.message ? err.message : "Failed to get OTP",
        });
    }
})

router.post("/createOtp", async (req, res) => {
    const { error, value } = otpSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });

    const otpCode = crypto.randomInt(100000, 999999).toString();

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

    try {
        const result = await createOtp(value.phone, otpCode);
        await sendOtpMessages(value.phone, otpCode);
        return res.json({
            status: result.status,
            message: result.message,
            otpCode: otpCode,
        });
    } catch (err) {
        console.error(
            "Failed to create OTP:",
            err && err.message ? err.message : err,
        );
        return res.status(500).json({
            status: "error",
            message:
                err && err.message ? err.message : "Failed to create OTP",
        });
    }
});

module.exports = router;