const express = require("express");
const router = express.Router();
const Student = require("../models/Students");

// Add a new student
router.post("/", async (req, res) => {
  const student = new Student({
    // name: req.body.name,
    // rollNumber: req.body.rollNumber,
    // admissionNumber: req.body.admissionNumber,
    // photoUrl: req.body.photoUrl,
    // classId: req.body.classId,
    name: "John Doe",
    rollNumber: 20,
    admissionNumber: 84,
    photoUrl: "https://example.com/photo.jpg",
    classId: "60d5f484f1a2c8b8f8e4b8e4",
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get students by class
router.get("/class/:class", async (req, res) => {
  try {
    const students = await Student.find({ class: req.params.class });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single student by adNumber
router.get("/adNumber/:adNumber", async (req, res) => {
  try {
    const student = await Student.findOne({ adNumber: req.params.adNumber });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




module.exports = router;
