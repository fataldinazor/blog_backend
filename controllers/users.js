const prisma = require("./prisma");

// get all the author
const getAllAuthors = async (req, res) => {
  try {
    const authors = await prisma.user.findMany({
      where: {
        OR: [{ role: "AUTHOR" }, { role: "ADMIN" }],
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        createdAt: true,
        role: true,
        profile: {
          select: {
            avatar_url: true,
            bio: true,
          },
        },
      },
    });
    return res.status(200).json(authors);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", err });
  }
};

// create the profile for an author
const createAuthorProfile = async (req, res) => {
  const { id } = req.user;
  const { authorId } = req.params;
  console.log(id, authorId);
  if (id !== parseInt(authorId)) {
    return res.status(401).json({ msg: "Not Authorized" });
  }
  const { avatarUrl, bio } = req.body;
  try {
    const authorProfile = await prisma.profile.create({
      data: {
        userId: id,
        avatar_url: avatarUrl,
        bio: bio,
      },
    });
    res.status(200).json({ msg: "Author Profile created", authorProfile });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", err });
  }
};

// get info about a particular Author
const getAuthorPage = async (req, res) => {
  const { authorId } = req.params;
  try {
    const author = await prisma.user.findUnique({
      where: {
        id: parseInt(authorId),
      },
      include: {
        profile: {
          select: {
            bio: true,
            avatar_url: true,
          },
        },
        password: false,
      },
    });
    res.status(200).json(author);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", err });
  }
};

//get all posts by a user
const getAuthorPosts = async (req, res) => {
  const { authorId } = req.params;
  try {
    const posts = await prisma.post.findMany({
      where: {
        userId: parseInt(authorId),
      },
    });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", posts });
  }
};

module.exports = {
  getAllAuthors,
  createAuthorProfile,

  getAuthorPage,
  getAuthorPosts,
};
