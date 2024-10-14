const router= require("express").Router();
const posts = require("../controllers/posts");

router.get("/all", posts.allPosts)

module.exports=router