const prisma = require("./prisma");

// fetches all the posts
const allPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where:{
        isPublished:true,
      }
    });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// fetches particular post
const postWithId = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });
    if (!post) {
      res.status(404).json({ msg: "The Post doesn't exist" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", error: err });
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
    return res.status(500).json(err);
  }
};

// get comments for a particular post
const getComments = async (req, res) => {
  const {postId, page} = req.params;
  const take=8;
  const skip=(parseInt(page)-1) * take;
  try {
    const comments = await prisma.comment.findMany({
      take:take,
      skip:skip,
      where: {
        postId: parseInt(postId),
      },
      select:{
        text:true,
        updatedAt:true,
        user:{
          select:{
            username:true,
            role:true,
          }
        }
      },
      orderBy:{
        updatedAt:"desc",
      }
    });
    return res.status(201).json(comments);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};

// creating a new comment on particular Post
const createComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;
  const { postId } = req.params;
  try {
    const comment = await prisma.comment.create({
      data: {
        text: text,
        userId: userId,
        postId: parseInt(postId),
      },
    });
    return res.status(201).json({ msg: "Comment Created", comment });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};

module.exports = {
  allPosts,
  postWithId,
  createPost,

  getComments,
  createComment,
};
