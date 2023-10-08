const db = require("../../data/dbConfig");

// Middleware to check if username and password are provided
const checkFormat = (req, res, next) => {
  const { username, password } = req.body;
  if (username && password) {
    next();
  } else {
    res.status(400).json({ message: "Username and password are required." });
  }
};

// Middleware to check if the username is taken
const checkNameTaken = async (req, res, next) => {
  try {
    const { username } = req.body;
    const [existingUser] = await db("users").where("username", username);

    if (!existingUser) {
      next(); // Username is not taken
    } else {
      res.status(400).json({ message: "Username is already taken." });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkFormat,
  checkNameTaken,
};
