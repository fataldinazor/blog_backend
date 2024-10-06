const express = require("express");
const router = express.Router();
const authentication=require("../controllers/authentication.js")

router.post("/signup",authentication.createUser)

module.exports= router;