const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/certificates/generate
// @desc    Generate a certificate for a completed course
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course')
      .populate('student');

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (enrollment.status !== 'completed') {
      return res.status(400).json({ error: 'Course not completed yet' });
    }

    const existingCert = await Certificate.findOne({
      student: req.user.id,
      course: enrollment.course._id
    });

    if (existingCert) {
      return res.status(400).json({ error: 'Certificate already exists' });
    }

    const certificateId = Certificate.generateCertificateId();
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://al-athar-academy.vercel.app'}/verify-certificate/${certificateId}`;
    
    const qrCode = await Certificate.generateQRCode(verificationUrl);

    const certificate = new Certificate({
      student: req.user.id,
      course: enrollment.course._id,
      enrollment: enrollmentId,
      certificateId,
      qrCode,
      metadata: {
        completionDate: enrollment.completedAt,
        score: enrollment.progress.percentage,
        instructor: enrollment.course.instructor,
        duration: enrollment.progress.timeSpent
      },
      language: req.body.language || 'ar'
    });

    await certificate.save();

    enrollment.certificate = {
      issued: true,
      issuedAt: new Date(),
      certificateId,
      qrCode
    };
    await enrollment.save();

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// @route   GET /api/certificates/my-certificates
// @desc    Get all certificates for the current user
// @access  Private
router.get('/my-certificates', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate('course', 'title slug image')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// @route   GET /api/certificates/:certificateId
// @desc    Get a specific certificate by ID
// @access  Public
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('student', 'name email')
      .populate('course', 'title slug image instructor')
      .populate('metadata.instructor', 'name');

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const verification = certificate.verify();
    
    res.json({
      certificate,
      verification
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// @route   GET /api/certificates/verify/:certificateId
// @desc    Verify a certificate
// @access  Public
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('student', 'name')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Certificate not found' 
      });
    }

    const verification = certificate.verify();

    res.json({
      valid: verification.valid,
      reason: verification.reason || null,
      certificate: {
        id: certificate.certificateId,
        studentName: certificate.student.name,
        courseTitle: certificate.course.title,
        issuedAt: certificate.issuedAt,
        status: certificate.status
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

// @route   PUT /api/certificates/:id/revoke
// @desc    Revoke a certificate (Admin only)
// @access  Private (Admin)
router.put('/:id/revoke', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    await certificate.revoke(reason);

    res.json({ message: 'Certificate revoked successfully', certificate });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete a certificate (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    await certificate.deleteOne();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

module.exports = router;
