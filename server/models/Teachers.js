const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: false },
    password: { type: String, required: true },
    email: { type: String, required: false, unique: false, sparse: true }, // Add `sparse: true` to allow multiple nulls
    phone: { type: String, required: true },
    qualification: { type: String, required: false },
    tId: { type: String, required: false },
    subjectsTaught: [
        {
            class: { type: Number, required: false },
            subject: { type: String, required: false },
            periodsInSemester: { type: Number, required: false }
        }
    ],
    joinedAt: { type: Date, required: false },
    active: { type: Boolean, required: false }
});

teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);