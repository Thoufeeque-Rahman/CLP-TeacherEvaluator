const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    qualification: { type: String, required: true },
    subjectsTaught: [
        {
            class: { type: Number, required: true },
            subject: { type: String, required: true },
            periodsInSemester: { type: Number, required: true }
        }
    ],
    joinedAt: { type: Date, required: true },
    active: { type: Boolean, required: true }
});

module.exports = mongoose.model("Teacher", teacherSchema);