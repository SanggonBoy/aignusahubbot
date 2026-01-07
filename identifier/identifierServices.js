const { API } = require("../routes/api");
const axios = require("axios");

let identifierData = [];

const fetchIdentifierData = async () => {
  try {
    const response = await axios.get(`${API}users`);
    identifierData = response.data;
    console.log("Identifier data loaded successfully");
    return identifierData;
  } catch (error) {
    console.error("Error fetching identifier data:", error.message);
    throw error;
  }
};

const getIdentifierData = () => {
  return identifierData;
};

const validateApiKey = (apiKey) => {
  if (!apiKey) return { valid: false, message: "API key is required" };
  if (!identifierData || identifierData.length === 0) {
    return { valid: false, message: "Identifier data not loaded" };
  }

  // Cari apakah API key cocok dengan data dari backend
  // Sesuaikan field 'key' dengan struktur data dari backend Anda
  const user = identifierData.find(
    (item) => item.apiKey === apiKey
  );

  if (user) {
    return { valid: true, user };
  }

  return { valid: false, message: "Invalid API key" };
};

const startAutoRefresh = (intervalMs = 60000) => {
    
  fetchIdentifierData();

  setInterval(async () => {
    try {
      await fetchIdentifierData();
    } catch (error) {
      console.error("Auto refresh failed:", error.message);
    }
  }, intervalMs);
};

module.exports = {
  fetchIdentifierData,
  getIdentifierData,
  validateApiKey,
  startAutoRefresh,
};
