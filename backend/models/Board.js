const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
});

module.exports = mongoose.model("Board", BoardSchema);