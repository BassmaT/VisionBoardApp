const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// limit repeated requests to auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});

// REGISTER
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // basic input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashed
    });

    // Create token (use fallback only for local/dev)
    const secret = process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '7d' });

    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Create token using same fallback as registration
    const secret = process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign(
      { id: user._id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
            email: user.email,
            name: user.name || '',
            avatar: user.avatar || ''
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name || '',
      avatar: user.avatar || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user profile
router.put('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof avatar === 'string') updates.avatar = avatar.trim();

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name || '',
      avatar: user.avatar || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
