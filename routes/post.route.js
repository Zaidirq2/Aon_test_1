const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const authMiddleware = require("../middleware/auth");

// GET all posts
router.get("/", authMiddleware, (req, res) => {
  let userId = parseInt(req.user.id);
  let posts = postController.getAllPosts(userId);
  res.json(posts);
});

// GET a single post by ID
router.get("/:id", authMiddleware, (req, res) => {
  let userId = parseInt(req.user.id);
  let id = parseInt(req.params.id);
  let post = postController.getPostById(id);

  if (userId !== post.userId) {
    return res.status(401).json({ message: "لاتصير لوتي!...." });
  }

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

module.exports = router;