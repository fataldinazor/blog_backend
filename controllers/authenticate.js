const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");
const passport = require("passport");
require("./passport");
const jwt = require("jsonwebtoken");

// const dotenv = require("dotenv");
// dotenv.config({ pathFile: "../.env" });

const validateCreateUserData = [
  body("username")
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage("The username should have a length between 1-15 characters"),
  body("password")
    .trim()
    .isLength({ min: 4, max: 15 })
    .withMessage("The password should have a length between 1-15 characters"),
];

const usernameMatch = body("username").custom(async (value) => {
  const user = await prisma.user.findUnique({
    where: {
      username: value,
    },
  });
  if (user) {
    throw new Error("Email already in use");
  }
  return true;
});

const passwordsMatch = body("password").custom((value, { req }) => {
  if (value !== req.body.confirmPassword) {
    throw new Error("The Passwords don't Match");
  }
  return true;
});

const createUser = [
  validateCreateUserData,
  usernameMatch,
  passwordsMatch,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const { username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const user = await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword,
        },
      });
      const payload = { id: user.id, username: user.username };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        user: payload,
        token,
        status: 201,
        msg: "User created successfully",
      });
    } catch (err) {
      res.status(500).json({ status: 500, msg: "Internal Server Failure" });
    }
  },
];

const logUser = (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Problem logging in",
        user: user,
        error: info ? info.message : "Login Failed",
      });
    }
    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({ user: payload, token, msg: "User logged in" });
  })(req, res);
};

module.exports = {
  createUser,
  logUser,
};
