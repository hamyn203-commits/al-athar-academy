const express = require('express');
const router = express.Router();
const GroupCircle = require('../models/GroupCircle');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/circles
// @desc    Get group circles with filtering (track, level, gender, status)
// @access  Public / Protected
router.get('/', async (req, res) => {
  try {
    const { track, level, gender, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (track) filter.track = track;
    if (level) filter.level = level;
    if (gender) filter.gender = gender;
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'completed' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [circles, total] = await Promise.all([
      GroupCircle.find(filter)
        .populate({
          path: 'teacher',
          select: 'personalInfo academicInfo quranInfo media rating status user',
          populate: { path: 'user', select: 'name avatar email' }
        })
        .populate('students', 'name avatar gender age currentLevel')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      GroupCircle.countDocuments(filter)
    ]);

    const enrichedCircles = circles.map((circle) => {
      const studentCount = circle.students ? circle.students.length : 0;
      const capacity = circle.capacity || 10;
      return {
        ...circle,
        currentCount: studentCount,
        availableSeats: Math.max(0, capacity - studentCount),
        isFull: studentCount >= capacity || circle.status === 'full'
      };
    });

    res.json({
      success: true,
      circles: enrichedCircles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب الحلقات الجماعية', details: error.message });
  }
});

// @route   GET /api/circles/:id
// @desc    Get details of a single circle with teacher, students, and schedule
// @access  Public / Protected
router.get('/:id', async (req, res) => {
  try {
    const circle = await GroupCircle.findById(req.params.id)
      .populate({
        path: 'teacher',
        select: 'personalInfo academicInfo quranInfo media rating status user',
        populate: { path: 'user', select: 'name avatar email phone' }
      })
      .populate('students', 'name avatar gender age currentLevel email');

    if (!circle) {
      return res.status(404).json({ error: 'الحلقة غير موجودة' });
    }

    const studentCount = circle.students ? circle.students.length : 0;
    const capacity = circle.capacity || 10;

    res.json({
      success: true,
      circle,
      stats: {
        currentCount: studentCount,
        capacity,
        availableSeats: Math.max(0, capacity - studentCount),
        isFull: studentCount >= capacity || circle.status === 'full'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب بيانات الحلقة', details: error.message });
  }
});

// @route   POST /api/circles
// @desc    Create a new group circle (admin or teacher)
// @access  Protected (admin, teacher)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const {
      name,
      track,
      level,
      gender,
      targetAgeGroup,
      teacherId,
      schedule,
      timezone,
      pricePerSession,
      currentSurah,
      notes
    } = req.body;

    if (!name || !gender) {
      return res.status(400).json({ error: 'اسم الحلقة وجنس الطلاب مطلوبان' });
    }

    let finalTeacherId = teacherId;

    if (req.user.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id });
      if (!teacherDoc) {
        return res.status(400).json({ error: 'لم يتم العثور على بروفايل المعلم الخاص بك' });
      }
      finalTeacherId = teacherDoc._id;
    } else if (!finalTeacherId) {
      return res.status(400).json({ error: 'يجب تحديد المعلم المسؤول عن الحلقة' });
    }

    const teacherExists = await Teacher.findById(finalTeacherId);
    if (!teacherExists) {
      return res.status(404).json({ error: 'المعلم المحدد غير موجود' });
    }

    const genderPrefix = String(gender).charAt(0).toUpperCase() || 'C';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const code = 'CIR-' + genderPrefix + '-' + randomCode;

    const circle = new GroupCircle({
      name,
      code,
      track: track || 'memorization',
      level: level || 'beginner',
      gender,
      targetAgeGroup: targetAgeGroup || 'kids_8_12',
      capacity: 10,
      teacher: finalTeacherId,
      students: [],
      schedule: Array.isArray(schedule) ? schedule : [],
      timezone: timezone || 'Africa/Cairo',
      status: 'forming',
      pricePerSession: pricePerSession || { egp: 20, usd: 1 },
      currentSurah: currentSurah || '',
      notes: notes || ''
    });

    await circle.save();

    await circle.populate({
      path: 'teacher',
      select: 'personalInfo academicInfo',
      populate: { path: 'user', select: 'name avatar' }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحلقة بنجاح',
      circle
    });
  } catch (error) {
    res.status(400).json({ error: 'فشل إنشاء الحلقة', details: error.message });
  }
});

// @route   POST /api/circles/:id/join
// @desc    Join circle for students (Strict validation: capacity <= 10, gender match, no duplicate, updates User.circle)
// @access  Protected
router.post('/:id/join', protect, async (req, res) => {
  try {
    const circle = await GroupCircle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ error: 'الحلقة غير موجودة' });
    }

    if (circle.status === 'completed' || circle.status === 'paused') {
      return res.status(400).json({ error: 'هذه الحلقة غير متاحة للانضمام حالياً' });
    }

    const currentStudents = circle.students || [];
    if (currentStudents.length >= (circle.capacity || 10)) {
      if (circle.status !== 'full') {
        circle.status = 'full';
        await circle.save();
      }
      return res.status(400).json({
        error: 'عذراً، الحلقة مكتملة بالكامل (السعة القصوى 10 طلاب)',
        code: 'CIRCLE_FULL'
      });
    }

    let studentId = req.user.id;
    if (req.user.role === 'guardian' && req.body.studentId) {
      studentId = req.body.studentId;
    }

    const studentUser = await User.findById(studentId);
    if (!studentUser) {
      return res.status(404).json({ error: 'حساب الطالب غير موجود' });
    }

    const alreadyJoined = currentStudents.some(
      (sId) => sId.toString() === studentUser._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({
        error: 'الطالب منضم بالفعل لهذه الحلقة',
        code: 'ALREADY_JOINED'
      });
    }

    const studentGender = studentUser.gender;
    if (circle.gender !== 'kids_mixed') {
      const maleCircleGenders = ['boys', 'men'];
      const femaleCircleGenders = ['girls', 'women'];

      if (maleCircleGenders.includes(circle.gender) && studentGender !== 'male') {
        return res.status(400).json({
          error: 'هذه الحلقة مخصصة للبنين/الرجال فقط، يرجى اختيار حلقة متطابقة',
          code: 'GENDER_MISMATCH'
        });
      }

      if (femaleCircleGenders.includes(circle.gender) && studentGender !== 'female') {
        return res.status(400).json({
          error: 'هذه الحلقة مخصصة للفتيات/النساء فقط، يرجى اختيار حلقة متطابقة',
          code: 'GENDER_MISMATCH'
        });
      }
    }

    circle.students.push(studentUser._id);

    if (circle.students.length >= (circle.capacity || 10)) {
      circle.status = 'full';
    } else if (circle.status === 'forming' && circle.students.length >= 3) {
      circle.status = 'active';
    }

    await circle.save();

    studentUser.circle = circle._id;
    await studentUser.save();

    res.json({
      success: true,
      message: 'تم الانضمام إلى الحلقة بنجاح',
      circle: {
        _id: circle._id,
        name: circle.name,
        code: circle.code,
        studentsCount: circle.students.length,
        status: circle.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل الانضمام للحلقة', details: error.message });
  }
});

// @route   PUT /api/circles/:id
// @desc    Update circle details or schedule (admin or assigned teacher)
// @access  Protected (admin, teacher)
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const circle = await GroupCircle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ error: 'الحلقة غير موجودة' });
    }

    if (req.user.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id });
      if (!teacherDoc || circle.teacher.toString() !== teacherDoc._id.toString()) {
        return res.status(403).json({ error: 'ليس لديك صلاحية تعديل هذه الحلقة' });
      }
    }

    const {
      name,
      track,
      level,
      gender,
      targetAgeGroup,
      schedule,
      timezone,
      status,
      currentSurah,
      notes,
      pricePerSession,
      teacherId
    } = req.body;

    if (name !== undefined) circle.name = name;
    if (track !== undefined) circle.track = track;
    if (level !== undefined) circle.level = level;
    if (gender !== undefined) circle.gender = gender;
    if (targetAgeGroup !== undefined) circle.targetAgeGroup = targetAgeGroup;
    if (Array.isArray(schedule)) circle.schedule = schedule;
    if (timezone !== undefined) circle.timezone = timezone;
    if (currentSurah !== undefined) circle.currentSurah = currentSurah;
    if (notes !== undefined) circle.notes = notes;
    if (pricePerSession !== undefined) circle.pricePerSession = pricePerSession;

    if (teacherId && req.user.role === 'admin') {
      const teacherExists = await Teacher.findById(teacherId);
      if (teacherExists) {
        circle.teacher = teacherId;
      }
    }

    if (status !== undefined) {
      if (status === 'full' || circle.students.length >= (circle.capacity || 10)) {
        circle.status = circle.students.length >= (circle.capacity || 10) ? 'full' : status;
      } else {
        circle.status = status;
      }
    }

    await circle.save();

    res.json({
      success: true,
      message: 'تم تحديث بيانات الحلقة بنجاح',
      circle
    });
  } catch (error) {
    res.status(400).json({ error: 'فشل تحديث بيانات الحلقة', details: error.message });
  }
});

// @route   DELETE /api/circles/:id
// @desc    Archive or delete a circle (admin only)
// @access  Protected (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { archive = 'true' } = req.query;
    const circle = await GroupCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ error: 'الحلقة غير موجودة' });
    }

    if (archive === 'true') {
      circle.status = 'completed';
      await circle.save();

      await User.updateMany({ circle: circle._id }, { $unset: { circle: '' } });

      return res.json({
        success: true,
        message: 'تمت أرشفة الحلقة بنجاح وإلغاء ارتباط الطلاب بها'
      });
    }

    await User.updateMany({ circle: circle._id }, { $unset: { circle: '' } });
    await GroupCircle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف الحلقة نهائياً'
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف أو أرشفة الحلقة', details: error.message });
  }
});

module.exports = router;
