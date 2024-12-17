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

router.get(
  "/authors/top",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.getTopAuthors
)

//route for getting a particular post
router.get(
  "/:postId",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.postWithId
);

router.put(
  "/:postId",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  posts.updatePostWithId
)

router.delete(
  "/:postId",
  authorize.authorizeRole(["AUTHOR","ADMIN"]),
  posts.deletePostWithId
)

router.get(
  "/:postId/more-posts",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.morePosts
);

//route for creating a new post
router.post(
  "/",
  authorize.authorizeRole(["AUTHOR", "ADMIN"]),
  posts.createPost
);

/*COMMENTS ON POST*/
router.get(
  "/:postId/comments",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.getComments
);

router.post(
  "/:postId/comments",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.createComment
);

//get if user liked the post or not
router.get(
  "/:postId/likes",
  authorize.authorizeRole(["USER","AUTHOR", "ADMIN"]),
  posts.findUserLikedPost
)

//gets if the user bookmarked the post or not 
router.get(
  "/:postId/bookmarks",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.findUserBookmarkPost
)

router.post(
  "/:postId/likes",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.toggleLike
);

router.post(
  "/:postId/bookmarks",
  authorize.authorizeRole(["USER", "AUTHOR", "ADMIN"]),
  posts.toggleBookmark
);

module.exports = router;
