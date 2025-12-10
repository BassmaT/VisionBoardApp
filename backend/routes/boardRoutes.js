// backend/routes/boardRoutes.js
import express from 'express';
import { createBoard, getBoard } from '../controllers/boardController.js';

const router = express.Router();

router.post('/', createBoard);
router.get('/:id', getBoard);

export default router;