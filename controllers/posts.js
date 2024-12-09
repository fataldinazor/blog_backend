const { urlencoded } = require("express");
const prisma = require("./prisma");

// fetches all the posts
const allPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
            profile: {
              select: { avatar_url: true },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error " + err });
  }
};

//fetching top Authors
const getTopAuthors = async (req, res) => {
  try {
    const authors = await prisma.user.findMany({
      take: 10,
      where: {
        role: "AUTHOR",
      },
      select: {
        username: true,
        fname: true,
        lname: true,
        profile: {
          select: {
            avatar_url: true,
          },
        },
        _count: { select: { posts: true } },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
    });
    return res.status(200).json(authors);
  } catch (error) {
    return res.status(500).json({ msg: `Internal server Error ${error}` });
  }
};

// fetches particular post
const postWithId = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      include: {
        user: { select: { username: true, id:true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
    });
    if (!post) {
      res.status(404).json({ msg: "The Post doesn't exist" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


//fetches suggested posts to user
const morePosts = async (req, res) => {
  const { postId } = req.params;
  try {
    const posts = await prisma.post.findMany({
      take: 30,
      where: {
        id: {
          not: parseInt(postId),
        },
        image_url: {
          not: null,
        },
        published: true,
      },
      select: {
        id: true,
        title: true,
        image_url: true,
        updatedAt: true,
        user: {
          select: {
            id:true,
            username: true,
          },
        },
      },
    });
    return res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error: error });
  }
};

// fetches if the user liked the post
const findUserLikedPost = async (req, res) => {
  const { id: userId } = req.user;
  let { postId } = req.params;
  postId = parseInt(postId);
  try {
    const result = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    return res.status(200).json({ liked: !!result });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error " + error });
  }
};

// fetches if the user bookmarked the post
const findUserBookmarkPost = async (req, res) => {
  const { id: userId } = req.user;
  let { postId } = req.params;
  postId = parseInt(postId);
  try {
    const result = await prisma.bookmark.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    return res.status(200).json({ bookmarked: !!result });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error " + error });
  }
};

// post creation
const createPost = async (req, res) => {
  try {
    const { title, content, imageUrl, isPublished } = req.body;
    const { id } = req.user;
    await prisma.post.create({
      data: {
        title: title,
        content: content,
        image_url: imageUrl,
        published: isPublished,
        userId: id,
      },
    });
    return res.status(200).json("The post is created");
  } catch (err) {
    return res.status(500).json({ msg: `Internal Server Error ${error}` });
  }
};

// get comments for a particular post
const getComments = async (req, res) => {
  const { postId, page } = req.params;
  // const take = 8;
  // const skip = (parseInt(page) - 1) * take;
  try {
    const comments = await prisma.comment.findMany({
      // take: take,
      // skip: skip,
      where: {
        postId: parseInt(postId),
      },
      select: {
        id: true,
        text: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return res.status(201).json(comments);
  } catch (err) {
    return res.status(500).json({ msg: `Internal Server Error ${error}` });
  }
};

// creating a new comment on particular Post
const createComment = async (req, res) => {
  const { userComment } = req.body;
  const { id } = req.user;
  const { postId } = req.params;
  try {
    await prisma.comment.create({
      data: {
        text: userComment,
        userId: id,
        postId: parseInt(postId),
      },
    });
    return res.status(201).json({ msg: "Comment Created" });
  } catch (err) {
    return res.status(500).json({ msg: `Internal Server Error ${error}` });
  }
};

// toggle like function for a post
const toggleLike = async (req, res) => {
  const userId = req.user.id;
  let { postId } = req.params;
  postId = parseInt(postId);
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return res.status(200).json({ msg: "Liked removed" });
    } else {
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return res.status(200).json({ msg: "Post Liked!" });
    }
  } catch (error) {
    return res.status(500).json({ msg: `Internal Server Error ${error}` });
  }
};

const toggleBookmark = async (req, res) => {
  const userId = req.user.id;
  let { postId } = req.params;
  postId = parseInt(postId);
  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      return res.status(200).json({ msg: "Bookmark removed from Post" });
    } else {
      await prisma.bookmark.create({
        data: { userId, postId },
      });
      return res.status(200).json({ msg: "Post Bookmarked" });
    }
  } catch (error) {
    return res.status(500).json({ msg: `Internal Server Error ${error}` });
  }
};

// update a post 
// const editPostWithId=async (req, res)=>{
//   const {postId}=req.params;

// }


module.exports = {
  allPosts,
  getTopAuthors,
  postWithId,
  createPost,
  morePosts,
  findUserLikedPost,
  findUserBookmarkPost,
  
  getComments,
  createComment,

  toggleLike,
  toggleBookmark,
};
