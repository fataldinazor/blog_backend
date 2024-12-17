const router = require("express").Router();
const prisma = require("../controllers/prisma");

router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      take: 10,
      where: {
        image_url: {
          not: null,
        },
        published: true,
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        title: true,
        image_url: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    return res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error: error });
  }
});

module.exports = router;
