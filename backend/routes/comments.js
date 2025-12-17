const router = require("express").Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 });
  res.json(comments);
});

router.post("/", auth, async (req, res) => {
  const comment = await Comment.create({
    user: req.user.username,
    text: req.body.text
  });
  res.json(comment);
});

module.exports = router;