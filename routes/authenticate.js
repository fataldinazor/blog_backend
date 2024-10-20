const express = require("express");
const router= express.Router();
const authenticate=require("../controllers/authenticate.js")

router.post("/user/signup",authenticate.createUser);
router.post("/author/signup", authenticate.transitionUser);
router.post("/login", authenticate.logUser);

module.exports= router;