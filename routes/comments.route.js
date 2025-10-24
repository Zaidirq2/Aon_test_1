const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");
const authMiddleware = require("../middleware/auth");

// GET all posts
router.get("/", authMiddleware, (req, res) => {
  let userId = parseInt(req.user.id);
  let comments = commentsController.getAllcomments(userId);
  res.json(comments);
});

// GET a single post by ID
router.get("/:id", authMiddleware, (req, res) => {
  let postId = parseInt(req.user.id);
  let id = parseInt(req.params.id);
  let comments = commentsController.getCommentsById(id);

  if (postId !== comments.postId) {
    return res.status(401).json({ message: "لاتصير لوتي!...." });
  }

  if (comments) {
    res.json(comments);
  } else {
    res.status(404).json({ message: "comments not found" });
  }
});

module.exports = router;