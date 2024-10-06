const express = require("express");
const router = express.Router();
const users= require("../controllers/users.js");

router.post("/signup", users.createUser);

module.exports = router;
