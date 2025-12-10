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

module.exports = router;