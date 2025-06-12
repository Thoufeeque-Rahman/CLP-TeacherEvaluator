const express = require('express');
const jwt = require('jsonwebtoken');
const Teachers = require('../models/Teachers');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, qualification } = req.body;
    
    // Check if teacher already exists
    const existingTeacher = await Teachers.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new teacher
    const teacher = new Teachers({
      email,
      password,
      name,
      phone,
      qualification,
      active: true,
      joinedAt: new Date()
    });

    await teacher.save();

    // Create session
    req.session.userId = teacher._id;
    req.session.email = teacher.email;

    // Return teacher data (excluding password)
    const teacherData = teacher.toObject();
    delete teacherData.password;

    res.status(201).json({
      message: 'Registration successful',
      teacher: teacherData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find teacher
    const teacher = await Teachers.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = teacher._id;
    req.session.email = teacher.email;

    // Return teacher data (excluding password)
    const teacherData = teacher.toObject();
    delete teacherData.password;

    res.json(teacherData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current teacher (requires authentication)
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teacher = await Teachers.findById(req.session.userId).select('-password');
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Fetch current teacher error:', error);
    res.status(500).json({ error: 'Failed to fetch teacher data' });
  }
});

// Get all teachers (admin only - you might want to add admin middleware)
router.get('/', async (req, res) => {
  try {
    const teachers = await Teachers.find().select('-password');
    res.json(teachers);
  } catch (error) {
    console.error('Fetch teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Get a teacher by ID (with authentication check)
router.get('/:teacherId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teacher = await Teachers.findById(req.params.teacherId).select('-password');
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Fetch teacher error:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

module.exports = router;
