const jwt = require("jsonwebtoken");
const User = require("../../models/userModels/auth.js");

const authMiddleware = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({
      Success: false,
      message: "Token Not Found invalid",
    });
  }

  // Check if token is in the Bearer format
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      Success: false,
      message: "Token Not Valid, Authorization denied",
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, "secret");
    let user = await User.findById(decoded.id).select("-password");
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = authMiddleware;
