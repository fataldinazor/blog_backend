const router = require("express").Router();
const users = require("../controllers/users");
const authorize = require("../controllers/authorize");

router.use(authorize.verifyToken);

// get all the authors 
router.get(
  "/",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  users.getAllAuthors
);

// get author profile 
router.get(
  "/:authorId",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  users.getAuthorPage
);

// creation of author Profile 
router.post(
  "/:authorId",
  users.createAuthorProfile
);

//getting all the posts by an author
router.get(
  "/:authorId/posts",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  users.getAuthorPosts
);

module.exports=router