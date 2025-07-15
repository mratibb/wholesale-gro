const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.js');
const router = express.Router();

// Register (Admin only)
router.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, password, email, role } = req.body;
  console.log('Register request:', { username, password, email, role });
  try {
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username ? 'Username already exists' : 'Email already exists',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      role: role || 'user',
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;