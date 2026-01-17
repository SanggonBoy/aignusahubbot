const { sendMessage } = require("../lib/services/whatsapp/whatsappClient");

const sendContactMessages = async (number, data) => {
  const message = `Pesan baru dari client AIG Nusa Hub\n\nNama: ${data.fullName}\nEmail: ${data.email}\nNo HP: ${data.phoneNumber} (${data.countryCode})\nSubjek: ${data.subject}\n\nPesan:\n*${data.message}*`;

  const result = await sendMessage(number, message);
  return { status: result.status, message: result.message };
};

module.exports = {
  sendContactMessages,
};
