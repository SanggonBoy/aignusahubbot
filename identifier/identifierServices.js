const { json } = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log("Berhasil Koneksi ke Firestore");

let identifierData = [];
async function fetchIdentifierData() {
  try {
    const userDoc = await db.collection("users").get();

    if(userDoc.empty) {
      console.log("Tidak ada data ditemukan.");
      identifierData = [];
      return;
    }

    const allUsers = [];
    userDoc.forEach(doc => {
      allUsers.push({ apiKey: doc.id, ...doc.data() });
    })
    identifierData = allUsers;
    console.log(`Berhasil memuat ${identifierData.length} API Keys.`);
  } catch (error) {
    console.log(error);
    return json({ status: "error", message: "Error fetching identifier data" });
  }
}

function validateApiKey(apiKey) {
  if (!apiKey) return { status: "error", message: "API key is required" };
  const user = identifierData.find((user) => user.apiKey === apiKey);

  if (user) {
    return { status: "success", data: user };
  }

  return { status: "error", message: "Invalid API key" };
}

function getIdentifierData() {
  return identifierData;
}

function startAutoRefresh(intervalMs = 86400000) {
  fetchIdentifierData();
  setInterval(async () => {
    try {
      await fetchIdentifierData();
    } catch (error) {
      console.error("Auto refresh failed:", error.message);
    }
  }, intervalMs);
}

module.exports = {
  fetchIdentifierData,
  getIdentifierData,
  validateApiKey,
  startAutoRefresh,
};
