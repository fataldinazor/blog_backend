const prisma = require("./prisma");
const cloudinary = require("../cloudinaryConfig");
const { extractPublicId } = require("../utils");

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
    const authorInfo = await prisma.user.findUnique({
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
    res.status(200).json({success:true, authorInfo});
  } catch (error) {
    return res.status(500).json({success:false, msg: "Internal Server Error", error });
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
    return res
      .status(200)
      .json({ success: true, msg: "Profile update successful" });
  } catch (error) {
    return res.status(500).json({ success: false, error });
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
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({ success: false, error });
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
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const getBookmarkedPosts = async (req, res) => {
  const { authorId } = req.params;
  try {
    const posts = await prisma.bookmark.findMany({
      where: {
        userId: parseInt(authorId),
      },
      select: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            published:true,
            user: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
          },
        },
      },
    });
    const formattedPosts = posts.map((bookmark) => bookmark.post);
    return res.status(200).json({ success: true, posts: formattedPosts });
  } catch (error) {
    return res.status(500).json({ success: false, error });
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
  getBookmarkedPosts,
};
