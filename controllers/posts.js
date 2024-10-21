const prisma = require("./prisma");
const primsa = require("./prisma");

// fetches all the posts
const allPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// fetches particular post
const postWithId = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await primsa.post.findUnique({
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
const getComments= async(req, res)=>{
  const postId = req.params;
  try{
    const comments = await prisma.comments.findMany({
      where:{
        postId:parseInt(postId)
      }
    })
    return res.status(201).json(comments);
    // this will only give the comments and the userID associated with it
    // still need to send the username associated with the comments
  }catch(err){
    res.status(500).json({msg:"Internal Server Error", error:err});
  }
}

module.exports = {
  allPosts,
  postWithId,
  createPost,
  getComments,
};
