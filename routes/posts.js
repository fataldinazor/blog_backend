const router = require("express").Router();
const posts = require("../controllers/posts");
const authorize = require("../controllers/authorize");

//every user on this route needs to be authenticated
router.use(authorize.verifyToken);

/*POST*/
//route for getting all the posts
router.get(
  "/",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.allPosts
);

//route for getting a particular post
router.get(
  "/:postId",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.postWithId
);

//route for creating a new post
router.post(
  "/",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  posts.createPost
);

/*COMMENTS ON POST*/
router.get(
  "/:postId/comments/:page",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.getComments
);
router.post(
  "/:postId/comment", 
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.createComment
)

module.exports = router;
