const prisma = require("./prisma");
const cloudinary = require("../cloudinaryConfig");

// Function to extract public_id from a URL
function extractPublicId(imageUrl) {
  const regex = /\/v\d+\/(.+)\.\w+$/; // Matches `/v<version>/<public_id>.<extension>`
  const match = imageUrl.match(regex);
  return match ? match[1] : null; // Returns public_id or null if not found
}

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
  // console.log(id, authorId);
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
      select: {
        id: true,
        username: true,
        fname: true,
        lname: true,
        createdAt: true,
        role: true,
        profile: {
          select: {
            bio: true,
            avatar_url: true,
          },
        },
        _count: { select: { posts: true, comments: true, likes: true } },
      },
    });
    res.status(200).json(author);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

const updateAuthorProfile = async (req, res) => {
  const { authorId } = req.params;
  const { fname, lname, bio, avatar_url, old_avatar_url } = req.body;
  if (old_avatar_url) {
    const publicId = extractPublicId(old_avatar_url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image", error);
      }
    }
  }

  try {
    await prisma.user.update({
      where: {
        id: parseInt(authorId),
      },
      data: {
        fname: fname,
        lname: lname,
        profile: {
          upsert: {
            create: { bio: bio, avatar_url: avatar_url },
            update: { bio: bio, avatar_url: avatar_url },
          },
        },
      },
    });
    return res.status(200).json({ msg: "Profile update successfull" });
  } catch (error) {
    return res.status(500).json({ error });
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

const getPublishedPosts = async (req, res) => {
  const { authorId } = req.params;
  try {
    const posts = await prisma.post.findMany({
      where: {
        userId: parseInt(authorId),
        published: true,
      },
      include: {
        user: true,
      },
    });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

const getUnpublishedPosts = async (req, res) => {
  const { authorId } = req.params;
  try {
    const posts = await prisma.post.findMany({
      where: {
        userId: parseInt(authorId),
        published: false,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
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
  updateAuthorProfile,

  getAuthorPage,
  getAuthorPosts,

  getPublishedPosts,
  getUnpublishedPosts,
};
