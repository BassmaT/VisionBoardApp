// backend/controllers/boardController.js
import VisionBoard from '../models/VisionBoard.js';

export const createBoard = async (req, res) => {
  try {
    const board = new VisionBoard(req.body);
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBoard = async (req, res) => {
  try {
    const board = await VisionBoard.findById(req.params.id);
    res.json(board);
  } catch (err) {
    res.status(404).json({ error: 'Board not found' });
  }
};

export const addImage = async (req, res) => {
  try {
    const board = await VisionBoard.findById(req.params.id);
    board.images.push(req.body);
    await board.save();
    res.status(200).json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};