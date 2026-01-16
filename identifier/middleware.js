const { validateApiKey } = require("./identifierServices");

const authMiddleware = (req, res, next) => {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  const validation = validateApiKey(apiKey);

  if (validation.status !== "success") {
    return res.status(401).json({
      status: "error",
      message: validation.message || "Unauthorized access",
    });
  }

  req.user = validation.data;

  next();
};

/**
 * Middleware opsional - hanya log jika ada API key, tapi tidak block
 */
const optionalAuthMiddleware = (req, res, next) => {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (apiKey) {
    const validation = validateApiKey(apiKey);
    if (validation.valid) {
      req.user = validation.user;
    }
  }

  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware };
