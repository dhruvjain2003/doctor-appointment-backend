const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET =process.env.JWT_SECRET;

const authenticateUser = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  token = token.replace("Bearer ", "").trim(); 

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(400).json({ message: "Invalid token" });
  }
};


module.exports = { authenticateUser };
