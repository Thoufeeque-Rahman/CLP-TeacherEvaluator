const express = require('express');
const jwt = require('jsonwebtoken');
const Teachers = require('../models/Teachers');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Registration
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = new Teachers({ phone, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body; 
    const user = await Teachers.findOne({ phone });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    console.log(user);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user._id, phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teachers.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Get a teacher by ID
router.get('/:teacherId', async (req, res) => {
  try {
    const teacher = await Teachers.findById(req.params.teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

module.exports = router;
