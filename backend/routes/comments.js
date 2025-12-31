const router = require("express").Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 }).select('-__v');
  res.json(comments);
});

router.post("/", auth, async (req, res) => {
  const user = req.user || {};
  const comment = await Comment.create({
    userId: user.id || user.id,
    user: req.user?.username || req.userId,
    name: req.user?.username || '',
    avatar: req.user?.avatar || '',
    text: req.body.text
  });
  res.json(comment);
});

module.exports = router;