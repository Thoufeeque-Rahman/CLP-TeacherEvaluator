const express = require("express");
const DvtMarks = require("../models/DvtMarks");
const Student = require("../models/Students");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Get all DvtMarks
router.get('/', async (req, res) => {
    try {
        console.log("Fetching all DvtMarks...");
        const dvtMarks = await DvtMarks.find({})
            .sort({ date: -1 }); // Sort by date descending
        
        console.log(`Found ${dvtMarks.length} DvtMarks documents`);
        if (dvtMarks.length > 0) {
            console.log("Sample document:", JSON.stringify(dvtMarks[0], null, 2));
        }
        
        res.json(dvtMarks);
    } catch (error) {
        console.error("Error fetching DvtMarks:", error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new DvtMark
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { studentId, subject, mark, punishment } = req.body;

        // Find the student
        const student = await Student.findOne({ _id: studentId });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Create the mark object
        const dvtMark = {
            subject,
            mark,
            date: new Date(),
            punishment,
        };

        // Add to student's dvtMarks array
        student.dvtMarks.push(dvtMark);
        await student.save();

        // Create a new DvtMarks document
        const newDvtMark = new DvtMarks({
            studentId: student.id,
            class: student.class,
            subject,
            mark,
            date: new Date(),
            punishment
        });

        // Save the new DvtMarks document
        const savedDvtMark = await newDvtMark.save();

        // Return the updated student with the new DvtMarks document
        const result = {
            student,
            dvtMark: savedDvtMark
        };
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating DvtMark:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get DvtMarks by subject and class
router.get('/:subject/:class', async (req, res) => {
    try {
        console.log("Fetching DvtMarks by subject and class:", {
            subject: req.params.subject,
            class: req.params.class
        });
        
        const dvtMarks = await DvtMarks.find({
            subject: req.params.subject,
            class: parseInt(req.params.class)
        })
        .sort({ date: -1 });
        
        console.log(`Found ${dvtMarks.length} matching documents`);
        if (dvtMarks.length > 0) {
            console.log("Sample filtered document:", JSON.stringify(dvtMarks[0], null, 2));
        }
        
        res.json(dvtMarks);
    } catch (error) {
        console.error("Error fetching DvtMarks by subject and class:", error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a DvtMark
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await DvtMarks.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Also remove from student's dvtMarks array
    await Student.updateOne(
      { id: result.studentId },
      { $pull: { dvtMarks: { _id: result._id } } }
    );
    
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ message: 'Error deleting evaluation' });
  }
});

// Update a DvtMark
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { mark, punishment } = req.body;
    
    // Update in DvtMarks collection
    const updatedMark = await DvtMarks.findByIdAndUpdate(
      req.params.id,
      { mark, punishment },
      { new: true }
    );
    
    if (!updatedMark) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Update in student's dvtMarks array
    await Student.updateOne(
      { 
        id: updatedMark.studentId,
        'dvtMarks._id': updatedMark._id 
      },
      { 
        $set: { 
          'dvtMarks.$.mark': mark,
          'dvtMarks.$.punishment': punishment
        }
      }
    );
    
    res.json(updatedMark);
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ message: 'Error updating evaluation' });
  }
});

module.exports = router;