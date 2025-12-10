import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerName: String,
  year: Number,
  goals: [String],
  plansByGoal: Object,
  images: [
    {
      src: String,
      labels: [String],
      notes: String
    }
  ]
}, { timestamps: true });

export default mongoose.model("Board", boardSchema);