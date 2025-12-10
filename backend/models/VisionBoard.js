// backend/models/VisionBoard.js
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  imageUrl: String,
  note: String,
  x: Number,
  y: Number,
  rotation: Number,
  width: Number,
  height: Number
});

const VisionBoardSchema = new mongoose.Schema({
  ownerName: String,
  year: Number,
  goals: [String],
  plans: [String],
  images: [ImageSchema]
});

const VisionBoard = mongoose.model('VisionBoard', VisionBoardSchema);

export default VisionBoard;