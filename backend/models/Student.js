const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 0 }
}, { _id: false });

const DailyHabitsSchema = new mongoose.Schema({
  adhkar: { type: Boolean, default: false },
  werd: { type: Boolean, default: false },
  murajaah: { type: Boolean, default: false }
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plan: { type: String, default: 'حفظ القرآن كاملاً' },
  currentSurah: { type: String, default: 'سورة الفاتحة' },
  progress: { type: Number, default: 0 },
  sheikh: { type: String, default: 'الشيخ عبد الرحمن الشريف' },
  lastGrade: { type: String, default: 'مبتدئ' },
  status: { type: String, default: 'نشط' },
  homework: { type: String, default: 'حفظ وجه التسميع الأول والبدء بالخطة' },
  lastUpdate: { type: String, default: 'الآن' },
  
  // Gamification fields
  points: { type: Number, default: 0 },
  level: { type: String, default: 'مبتدئ' },
  streak: { type: Number, default: 0 },
  dailyHabits: { type: DailyHabitsSchema, default: () => ({}) },
  activityData: {
    type: [ActivitySchema],
    default: [
      { name: 'السبت', points: 0 },
      { name: 'الأحد', points: 0 },
      { name: 'الإثنين', points: 0 },
      { name: 'الثلاثاء', points: 0 },
      { name: 'الأربعاء', points: 0 },
      { name: 'الخميس', points: 0 },
      { name: 'الجمعة', points: 0 }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
