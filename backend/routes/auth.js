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
  readRefreshTokenIfValid,
  requireRole 
} = require('../middleware/auth');
const { addMockUser, findMockUserByEmail, findMockUserById, updateMockUser } = require('../mockStore');
const { sendEmail } = require('../services/notificationDispatcher');
const { getTeacherAccessDecision } = require('../utils/teacherAccess');
const { normalizePhone } = require('../utils/phone');
const { createGuardianInvitation } = require('../services/guardianInvitations');

const { isMockMode } = require('../config/runtime');
const isDBConnected = () => mongoose.connection.readyState === 1;

const REFRESH_COOKIE = 'wn_refresh';
const REFRESH_COOKIE_MAX_AGE_SECONDS = Number(
  process.env.REFRESH_COOKIE_MAX_AGE_SECONDS || 7 * 24 * 60 * 60
);

function setRefreshCookie(res, refreshToken) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const sameSite = process.env.REFRESH_COOKIE_SAMESITE || 'Lax';
  res.setHeader(
    'Set-Cookie',
    `${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}; Path=/api/auth; HttpOnly; SameSite=${sameSite}; Max-Age=${REFRESH_COOKIE_MAX_AGE_SECONDS}${secure}`
  );
}

function clearRefreshCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const sameSite = process.env.REFRESH_COOKIE_SAMESITE || 'Lax';
  res.setHeader(
    'Set-Cookie',
    `${REFRESH_COOKIE}=; Path=/api/auth; HttpOnly; SameSite=${sameSite}; Max-Age=0${secure}`
  );
}

function sanitizeUserResponse(user) {
  if (!user) return null;
  const obj = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.__v;
  return obj;
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, guardianPhone, guardianRelationship, whatsappPhone, age, gender, currentLevel, preferredTrack, memorizedJuz, memorizationDetails, customLevel } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const allowedRoles = ['student', 'guardian'];

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'This role cannot be self-registered' });
    }
    const assignedRole = role || 'student';
    const normalizedPhone = normalizePhone(phone);

    if (assignedRole === 'guardian' && !normalizedPhone) {
      return res.status(400).json({ error: 'رقم هاتف ولي الأمر مطلوب لإنشاء الحساب' });
    }

    if (!isMockMode || isDBConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email already registered' 
        });
      }

      if (assignedRole === 'guardian') {
        const guardianPhoneOwner = await User.findOne({
          role: 'guardian',
          phoneNormalized: normalizedPhone,
          isActive: { $ne: false },
        }).select('_id');
        if (guardianPhoneOwner) {
          return res.status(409).json({
            error: 'يوجد حساب ولي أمر مسجل بالفعل بهذا الرقم. سجل الدخول إلى الحساب الحالي.',
            code: 'GUARDIAN_PHONE_ALREADY_REGISTERED',
          });
        }
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone,
        phoneNormalized: normalizedPhone || undefined,
        role: assignedRole,
        ...(assignedRole === 'student' ? {
          whatsappPhone: String(whatsappPhone || '').trim(),
          ...(age ? { age: Number(age) } : {}),
          ...(gender ? { gender } : {}),
          currentLevel: ['beginner', 'intermediate', 'advanced', 'ijazah'].includes(currentLevel) ? currentLevel : 'beginner',
          preferredTrack: ['memorization', 'tajweed_ijazah', 'kids_foundation'].includes(preferredTrack) ? preferredTrack : 'memorization',
          memorizedJuz: Math.max(0, Math.min(30, Math.trunc(Number(memorizedJuz) || 0))),
          memorizationDetails: String(memorizationDetails || '').trim().slice(0, 500),
          customLevel: String(customLevel || '').trim().slice(0, 120),
        } : {}),
      });

      if (req.body.referralCode && user.role === 'student') {
        const { processReferralSignup } = require('./referrals');
        await processReferralSignup(req.body.referralCode, user._id).catch(() => {});
      }

      if (user.role === 'student' && guardianPhone) {
        await createGuardianInvitation({
          studentId: user._id,
          guardianPhone,
          relationship: guardianRelationship || 'guardian',
          source: 'student-registration',
        }).catch((error) => {
          console.warn('Guardian invitation creation warning:', error.message);
        });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      setRefreshCookie(res, refreshToken);

      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        message: 'Registration successful',
        user: sanitizeUserResponse(user),
        accessToken
      });
      return;
    }

    const existingUser = findMockUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const user = addMockUser({
      _id: `mock-${Date.now()}`,
      email: normalizedEmail,
      password,
      name,
      phone,
      role: assignedRole,
      isActive: true,
      lastLogin: new Date(),
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      user: sanitizeUserResponse(user),
      accessToken
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
      : await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokenVersion +phoneNormalized');
    
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

    if (user.role === 'teacher') {
      const decision = await getTeacherAccessDecision(user._id || user.id);
      if (!decision.allowed) {
        clearRefreshCookie(res);
        return res.status(403).json({
          error: decision.error,
          code: decision.code,
          applicationStatus: decision.status,
        });
      }
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    if (!isMockMode || isDBConnected()) {
      user.lastLogin = new Date();
      if (user.phone) {
        user.phoneNormalized = normalizePhone(user.phone) || undefined;
      }
      await user.save();
    } else {
      updateMockUser(user._id || user.id, { lastLogin: new Date() });
    }

    res.json({
      message: 'Login successful',
      user: sanitizeUserResponse(user),
      accessToken
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
      : await User.findById(req.refreshToken.id).select('+refreshTokenVersion');
    
    if (!user || !user.isActive) {
      clearRefreshCookie(res);
      return res.status(401).json({ 
        error: 'User not found or deactivated' 
      });
    }

    const expectedVersion = Number(user.refreshTokenVersion || 0);
    const tokenVersion = Number(req.refreshToken.v || 0);
    if (tokenVersion !== expectedVersion) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Refresh session has been revoked' });
    }

    if (user.role === 'teacher') {
      const decision = await getTeacherAccessDecision(user._id || user.id);
      if (!decision.allowed) {
        clearRefreshCookie(res);
        return res.status(403).json({
          error: decision.error,
          code: decision.code,
          applicationStatus: decision.status,
        });
      }
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ 
      error: 'Token refresh failed' 
    });
  }
});

router.post('/logout', readRefreshTokenIfValid, async (req, res) => {
  clearRefreshCookie(res);

  try {
    if (req.refreshToken?.id) {
      if (isMockMode && !isDBConnected()) {
        const user = findMockUserById(req.refreshToken.id);
        if (user) {
          updateMockUser(user._id || user.id, {
            refreshTokenVersion: Number(user.refreshTokenVersion || 0) + 1,
          });
        }
      } else {
        await User.findByIdAndUpdate(req.refreshToken.id, {
          $inc: { refreshTokenVersion: 1 },
        });
      }
    }
  } catch (error) {
    console.warn('Logout token revocation warning:', error.message);
  }

  return res.json({ message: 'Logged out successfully' });
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

    res.json({ user: sanitizeUserResponse(user) });
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
      user: sanitizeUserResponse(user) 
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

    const user = await User.findById(req.user.id).select('+password +refreshTokenVersion');

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    user.password = newPassword;
    user.refreshTokenVersion = Number(user.refreshTokenVersion || 0) + 1;
    await user.save();

    clearRefreshCookie(res);
    res.json({ 
      message: 'Password changed successfully. Please sign in again.' 
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

    if (process.env.NODE_ENV === 'production' && !process.env.RESEND_API_KEY) {
      return res.status(503).json({
        error: 'Password reset email service is temporarily unavailable'
      });
    }

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

    const frontendUrl = String(
      process.env.FRONTEND_URL || 'https://wahy-wa-namaa-academy.vercel.app'
    ).replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    if (process.env.RESEND_API_KEY) {
      await sendEmail({
        to: user.email,
        subject: 'استعادة كلمة المرور — وَحْيٌ وَنَمَاء',
        text: `استخدم الرابط التالي لإعادة تعيين كلمة المرور: ${resetUrl}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">
            <h2>استعادة كلمة المرور</h2>
            <p>وصلنا طلب لإعادة تعيين كلمة المرور لحسابك في أكاديمية وَحْيٌ وَنَمَاء.</p>
            <p><a href="${resetUrl}">اضغط هنا لإعادة تعيين كلمة المرور</a></p>
            <p>إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
          </div>
        `,
      });
    }

    res.json({ 
      message: 'If your email is registered, you will receive a password reset link',
      ...(process.env.NODE_ENV !== 'production' && { resetToken, resetUrl })
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
    }).select('+refreshTokenVersion');

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokenVersion = Number(user.refreshTokenVersion || 0) + 1;
    await user.save();

    clearRefreshCookie(res);
    res.json({ 
      message: 'Password reset successful. Please sign in again.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password' 
    });
  }
});

module.exports = router;
