import express from "express";
import Board from "../models/Board.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check token
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Save board
router.post("/", auth, async (req, res) => {
  const board = await Board.create({
    userId: req.user.userId,
    ...req.body
  });

  res.json(board);
});

// Get all boards for user
router.get("/", auth, async (req, res) => {
  const boards = await Board.find({ userId: req.user.userId });
  res.json(boards);
});

export default router;