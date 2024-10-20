const prisma = require("./prisma");
const primsa = require("./prisma");

const allPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    if (!posts) {
      return res.status(404).json({ msg: "No posts available" });
    }
    return res.status(200).json({ posts });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const postWithId = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await primsa.post.findUnique({
      where: { postId },
    });
    if (!post) {
      res.status(404).json({ msg: "The Post doesn't exist" });
    }
    res.status(200).json({ post });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

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
        authorId: id,
      },
    });
    return res.status(200).json("The post is created");
  } catch (err) {
    return req.status(500).json(err);
  }
};

const createPublishedPost = () => {};

const createUnPublishedPost = () => {};

module.exports = {
  allPosts,
  postWithId,
  createPost,
};

