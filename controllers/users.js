const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);

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
      username:value,
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
    if(!errors.isEmpty()){
        return res.status(400).json(errors);
    }
    const {username, password} = req.body;
    try{
        const hashedPassword = await bcrypt(password, 10);
        const user = await prisma.user.create({
            data:{
                username:username,
                password:hashedPassword
            }
        })
        res.status(201).json({status:201,msg: "User created successfully"})
    }catch(err){
        res.status(500).json({status:500, msg:"Internal Server Failure"})
    }   
  },
];

module.exports = {
  createUser,
};
