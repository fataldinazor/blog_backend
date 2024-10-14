const express = require("express");
const router= express.Router();
const authenticate=require("../controllers/authenticate.js")

router.post("/signup",authenticate.createUser);
router.post("/login", authenticate.logUser);

module.exports= router;