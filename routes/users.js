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
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  users.createAuthorProfile
);

router.put(
  "/:authorId",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  users.updateAuthorProfile
);

//getting all the posts by an author
router.get(
  "/:authorId/posts",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  users.getAuthorPosts
);

router.get(
  "/:authorId/posts/published",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  users.getPublishedPosts
)

router.get(
  "/:authorId/posts/unpublished",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  users.getUnpublishedPosts
);
router.get(
  "/:authorId/posts/bookmarks",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  users.getBookmarkedPosts
);

module.exports=router