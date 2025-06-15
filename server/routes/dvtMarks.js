const express = require("express");
const DvtMarks = require("../models/DvtMarks");
const router = express.Router();
const Student = require('../models/Students');
const { authenticateToken } = require('../middleware/auth');

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
        .populate('studentId', 'name rollNumber')
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
    await Student.findByIdAndUpdate(
      result.studentId,
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
        _id: updatedMark.studentId,
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