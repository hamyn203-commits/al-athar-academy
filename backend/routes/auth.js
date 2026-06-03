const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken,
  requireRole 
} = require('../middleware/auth');
const { addMockUser, findMockUserByEmail, findMockUserById, updateMockUser } = require('../mockStore');

const isMockMode = !process.env.MONGODB_URI;
const isDBConnected = () => mongoose.connection.readyState === 1;

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }

    if (!isMockMode || isDBConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email already registered' 
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role === 'teacher' ? 'teacher' : 'student',
      });

      if (req.body.referralCode && user.role === 'student') {
        const { processReferralSignup } = require('./referrals');
        await processReferralSignup(req.body.referralCode, user._id).catch(() => {});
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        message: 'Registration successful',
        user,
        accessToken,
        refreshToken
      });
      return;
    }

    const existingUser = findMockUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const user = addMockUser({
      _id: `mock-${Date.now()}`,
      email,
      password,
      name,
      phone,
      role: role === 'teacher' ? 'teacher' : 'student',
      isActive: true,
      lastLogin: new Date(),
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      message: 'Registration successful',
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const user = isMockMode && !isDBConnected()
      ? findMockUserByEmail(email)
      : await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account is deactivated. Please contact support.' 
      });
    }

    const isPasswordValid = isMockMode && !isDBConnected()
      ? user.password === password
      : await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    if (!isMockMode || isDBConnected()) {
      user.lastLogin = new Date();
      await user.save();
    } else {
      updateMockUser(user._id || user.id, { lastLogin: new Date() });
    }

    res.json({
      message: 'Login successful',
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed' 
    });
  }
});

router.post('/refresh', verifyRefreshToken, async (req, res) => {
  try {
    const user = isMockMode && !isDBConnected()
      ? findMockUserById(req.refreshToken.id)
      : await User.findById(req.refreshToken.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'User not found or deactivated' 
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ 
      error: 'Token refresh failed' 
    });
  }
});

router.post('/logout', verifyAccessToken, async (req, res) => {
  try {
    res.json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed' 
    });
  }
});

router.get('/me', verifyAccessToken, async (req, res) => {
  try {
    const user = isMockMode && !isDBConnected()
      ? findMockUserById(req.user.id)
      : await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile' 
    });
  }
});

router.patch('/me', verifyAccessToken, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'avatar', 'bio', 'preferences'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({ 
        error: 'Invalid update fields' 
      });
    }

    let user;
    if (isMockMode && !isDBConnected()) {
      user = updateMockUser(req.user.id, req.body);
    } else {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

router.post('/change-password', verifyAccessToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters' 
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password' 
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    console.log('Password reset token generated for:', email);
    console.log('Reset token (dev only):', resetToken);

    res.json({ 
      message: 'If your email is registered, you will receive a password reset link',
      ...(process.env.NODE_ENV !== 'production' && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process request' 
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password' 
    });
  }
});

module.exports = router;
