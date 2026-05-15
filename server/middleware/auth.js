const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      return next();
    } catch {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = { protect };
