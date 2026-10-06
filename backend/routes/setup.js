const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const { addMockUser, findMockUserByEmail, updateMockUser } = require('../mockStore');

const { isMockMode } = require('../config/runtime');
const isDBConnected = () => mongoose.connection.readyState === 1;

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function bootstrapAllowed(req, res, next) {
  if (process.env.NODE_ENV !== 'production') return next();

  if (process.env.ALLOW_ADMIN_BOOTSTRAP !== 'true') {
    return res.status(404).json({ error: 'Route not found' });
  }

  const expected = process.env.ADMIN_BOOTSTRAP_SECRET;
  const supplied = req.get('x-admin-bootstrap-secret');

  if (!expected || !supplied || !safeEqual(expected, supplied)) {
    return res.status(403).json({ error: 'Admin bootstrap is not authorized' });
  }

  next();
}

const ensureAdminHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 12) {
      return res.status(400).json({ error: 'Name, email, and a password of at least 12 characters are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMockMode || !isDBConnected()) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ error: 'Database is unavailable' });
      }

      let mockUser = findMockUserByEmail(normalizedEmail);
      if (mockUser) {
        updateMockUser(mockUser._id || mockUser.id, { name, password, role: 'admin', isActive: true });
        return res.status(200).json({ message: 'Development admin updated', email: normalizedEmail });
      }

      mockUser = addMockUser({ name, email: normalizedEmail, password, role: 'admin', isActive: true });
      return res.status(201).json({ message: 'Development admin created', email: mockUser.email });
    }

    const existingAdmin = await User.findOne({ role: 'admin' }).select('_id email');
    if (existingAdmin) {
      return res.status(409).json({ error: 'An administrator already exists. Bootstrap is closed.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = 'admin';
      existingUser.isActive = true;
      await existingUser.save();
      return res.status(200).json({ message: 'Administrator account promoted', email: existingUser.email });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'admin',
      isActive: true,
    });

    return res.status(201).json({ message: 'Administrator created', email: user.email });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    return res.status(400).json({ error: error.message });
  }
};

router.get('/admin-provision', async (_req, res) => {
  if (process.env.VERCEL_ENV !== 'preview') {
    return res.status(404).json({ error: 'Route not found' });
  }

  try {
    const existingAdmin = await User.findOne({ role: 'admin' }).select('_id email');
    if (existingAdmin) {
      return res.status(409).json({ error: 'Administrator already exists' });
    }

    const name = String(process.env.OPS_ADMIN_NAME || '').trim();
    const email = String(process.env.OPS_ADMIN_EMAIL || '').trim().toLowerCase();
    if (!name || !email) {
      return res.status(503).json({ error: 'Provisioning identity is not configured' });
    }

    let user = await User.findOne({ email }).select('+password');
    let action = 'promoted';

    if (user) {
      user.name = name;
      user.role = 'admin';
      user.isActive = true;
      await user.save();
    } else {
      const temporaryPassword =
        crypto.randomBytes(48).toString('base64url') + 'A1!';
      user = await User.create({
        name,
        email,
        password: temporaryPassword,
        role: 'admin',
        isActive: true,
      });
      action = 'created';
    }

    return res.status(action === 'created' ? 201 : 200).json({
      success: true,
      action,
      adminCreated: true,
    });
  } catch (error) {
    console.error('Admin provision failed:', error?.message || 'unknown error');
    return res.status(500).json({ error: 'Admin provisioning failed' });
  }
});

router.get('/admin-exists', async (_req, res) => {
  if (process.env.VERCEL_ENV !== 'preview') {
    return res.status(404).json({ error: 'Route not found' });
  }

  try {
    const exists = Boolean(await User.exists({ role: 'admin' }));
    return res.json({ adminExists: exists });
  } catch {
    return res.status(503).json({ error: 'Database check failed' });
  }
});

router.post('/ensure-admin', bootstrapAllowed, ensureAdminHandler);
router.post('/admin', bootstrapAllowed, ensureAdminHandler);

module.exports = router;