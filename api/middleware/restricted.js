const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config");

module.exports = (req, res, next) => {
  // Check for a valid token in the Authorization header
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token required." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Handle token expiration separately
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired." });
      }
      // Handle other JWT validation errors
      return res.status(401).json({ message: "Token invalid." });
    }

    // Token is valid; attach the decoded JWT to the request object
    req.decodedJwt = decoded;
    next();
  });
};
