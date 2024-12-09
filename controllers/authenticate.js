const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");
const passport = require("passport");
require("./passport");
const jwt = require("jsonwebtoken");
const authorize = require("./authorize");

//express-validator for validating username and password
const validateUsernamePassword = [
  body("username")
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage("The username should have a length between 1-15 characters"),
  body("password")
    .trim()
    .isLength({ min: 4, max: 15 })
    .withMessage("The password should have a length between 1-15 characters"),
];

//express-validator for validating fname and lname (for author creation/transition)
const validateName = [
  body("fname")
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage("Your first Name should be between 1-25 characters"),
  body("lname")
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage("Your Last Name should be between 1-15 characters"),
];

//validating the username doesn't exist prior for nerw user/author registration
const usernameMatch = body("username").custom(async (value) => {
  const user = await prisma.user.findUnique({
    where: {
      username: value,
    },
  });
  if (user) {
    throw new Error("Username already in use");
  }
  return true;
});

//validationg password and confirmPassword inputs match
const passwordsMatch = body("password").custom((value, { req }) => {
  if (value !== req.body.confirmPassword) {
    throw new Error("The Passwords don't Match");
  }
  return true;
});

//checking user password and form password are same or not
// used in transitionUser function
const checkPassword = async (id, formPassword) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return await bcrypt.compare(formPassword, user.password);
};

//Register a new User with Author Role
const createAuthor = [
  validateName,
  validateUsernamePassword,
  usernameMatch,
  passwordsMatch,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const { fname, lname, username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const author = await prisma.user.create({
        data: {
          fname: fname,
          lname: lname,
          username: username,
          password: hashedPassword,
          role: "AUTHOR",
        },
      });
      const payload = {
        id: author.id,
        username: author.username,
        role: author.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.status(200).json({
        success: true,
        user: payload,
        token: token,
        msg: "Author created Successfully!",
      });
    } catch (err) {
      res.status(500).json("Internal Server Error");
    }
  },
];

//Register a new User
const createUser = [
  validateUsernamePassword,
  usernameMatch,
  passwordsMatch,
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const { username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword,
        },
      });
      const payload = { id: user.id, username: user.username, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        success: true,
        user: payload,
        token,
        msg: "User created Successfully!",
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, status: 500, msg: "Internal Server Failure" });
    }
  },
];

//Transition of Existing user to author status
const transitionUser = [
  authorize.verifyToken,
  authorize.authorizeRole("USER"),
  validateName,
  async (req, res) => {
    const user = req.user;
    const id = user.id;
    const { fname, lname, password } = req.body;
    try {
      if (!checkPassword(id, password)) {
        return res
          .status(400)
          .json({ msg: "The password doesn't link to the account" });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          fname: fname,
          lname: lname,
          role: "AUTHOR",
        },
      });
      console.log("User updated:", updatedUser);
      let payload = {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
      };
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(201).json({
        user: payload,
        token: token,
        msg: "The User updated to Author status successfully!",
      });
    } catch (err) {
      console.error("Error during user update:", err);

      return res
        .status(500)
        .json({ msg: "Internal Server Failure", error: err.message });
    }
  },
];

//login existing user/Author
const logUser = (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        success: false,
        msg: "Problem logging in",
        user: user,
        error: err
          ? err
          : !user
            ? "Invalid username or password."
            : "Login Failed",
      });
    }
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      success: true,
      user: payload,
      token,
      msg: "User logged in",
    });
  })(req, res);
};

module.exports = {
  createUser,
  createAuthor,
  transitionUser,
  logUser,
};
