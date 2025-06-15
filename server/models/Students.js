const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: String,
  rollNumber: Number,
  adNumber: Number,
  class: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dvtMarks: [
    {
      subject: String,
      mark: Number,
      date: Date,
      punishment: { type: String, required: false },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);