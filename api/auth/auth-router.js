const router = require("express").Router();
const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { checkFormat, checkNameTaken } = require("./auth-middleware");

const { BCRYPT_ROUNDS, JWT_SECRET } = require("../../config");

router.post(
  "/register",
  checkFormat,
  checkNameTaken,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "username and password required" });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const newUser = { username, password: hashedPassword };
      const [id] = await db("users").insert(newUser);
      newUser.id = id;

      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", checkFormat, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password required" });
    }

    const user = await db("users").where("username", username).first();
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = buildToken(user);
      res.status(200).json({
        message: `welcome, ${username}`,
        token: token,
      });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
