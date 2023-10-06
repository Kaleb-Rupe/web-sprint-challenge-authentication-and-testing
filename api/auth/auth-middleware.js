const db = require("../../data/dbConfig");

const checkFormat = (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username && password) {
      next();
    } else {
      next({ status: 400, message: "username and password required" });
    }
  } catch (err) {
    next(err);
  }
};

const checkNameTaken = async (req, res, next) => {
  try {
    const { username } = req.body;
    const [user] = await db("users")
      .where("username", username)
      .select("username");
    if (!user) {
      next();
    } else {
      next({ status: 400, message: "username taken" });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkFormat,
  checkNameTaken,
};
