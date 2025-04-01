// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { upload } = require('../middleware/upload');

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      email,
      password,
      profileImage: req.file ? req.file.filename : 'default-profile.jpg'
    });

    await user.save();

    // Generate JWT
    const token = user.getSignedJwtToken();

    res.status(201).json({ 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({ 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;