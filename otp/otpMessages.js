const { sendMessage } = require("../lib/services/whatsapp/whatsappClient");

const sendOtpMessages = async (phoneNumber, otpCode) => {
    try {
        const result = await sendMessage(
            phoneNumber,
            `Kode OTP Anda adalah: ${otpCode}`
        );
        return {
            status: "success",
            message: "OTP sent successfully",
            result,
        };
    } catch (err) {
        console.error(
            "❌ Failed to send OTP:",
            err && err.message ? err.message : err,
        );
        return {
            status: "error",
            message:
                err && err.message ? err.message : "Failed to send OTP",
        };
    }
}   

module.exports = { sendOtpMessages };