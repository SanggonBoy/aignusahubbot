const { sendMessage } = require("../lib/services/whatsapp/whatsappClient");

const formatTanggal = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
};

const formatRupiah = (amount) => {
  const number = parseInt(amount);
  return "Rp" + number.toLocaleString("id-ID");
};

const sendTerminMessages = async (number, data) => {
  const tanggal = formatTanggal(data.dueDate);
  const jumlah = formatRupiah(data.amount);

  const message = `Halo! Pelanggan ${data.name} waktu termin pembayaran hutang anda akan tiba pada ${tanggal} dengan jumlah sebesar ${jumlah} Mohon untuk melakukan pembayaran tepat waktu. Terima kasih!`;

  const result = await sendMessage(number, message);
  return { status: result.status, message: result.message };
};

module.exports = {
  sendTerminMessages,
};
