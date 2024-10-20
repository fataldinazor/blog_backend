const router = require("express").Router();
const posts = require("../controllers/posts");
const authorize = require("../controllers/authorize");

//every user on this route needs to be authenticated
router.use(authorize.verifyToken);

//route for getting all the posts
router.get(
  "/",
  authorize.authorizeRole(["USER", "AUHTOR", "ADMIN"]),
  posts.allPosts
);

//route for getting a particular post
router.get(
  "/:postId",
  authorize.authorizeRole(["USER", "AUHTOR", "ADMIN"]),
  posts.postWithId
);

//route for creating a new post
router.post(
  "/",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  posts.createPost
);

module.exports = router;
