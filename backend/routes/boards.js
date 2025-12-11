const express = require("express");
const Board = require("../models/Board");
const auth = require("../middleware/auth");

const router = express.Router();

// Create board
router.post("/", auth, async (req, res) => {
  const board = await Board.create({
    ...req.body,
    owner: req.userId
  });

  res.json(board);
});

// Get all boards for logged-in user
router.get("/my", auth, async (req, res) => {
  const boards = await Board.find({ owner: req.userId });
  res.json(boards);
});
// Create board
router.post("/", auth, async (req, res) => {
  const board = await Board.create({
    ...req.body,
    owner: req.userId
  });

  res.json(board);
});
module.exports = router;
// Get single board by ID
router.get("/:id", auth, async (req, res) => {
  const board = await Board.findOne({ _id: req.params.id, owner: req.userId });
  if (!board) return res.status(404).json({ message: "Board not found" });
  res.json(board);
});
// DELETE board by ID
router.delete("/:id", auth, async (req, res) => {
  const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!board) return res.status(404).json({ message: "Board not found" });
  res.json({ message: "Board deleted" });
});