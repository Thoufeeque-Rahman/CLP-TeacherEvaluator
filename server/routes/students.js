const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Students");
const DvtMarks = require("../models/DvtMarks");

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

// Get a student by Id
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching student with ID:", req.params.id);
    
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ message: "Student not found" });
    }
    
    console.log("Found student:", student);
    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;