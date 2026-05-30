export const sheikhs = [
  { id: 1, name: 'الشيخ القارئ عبد الرحمن الشريف', specialty: 'رواية حفص وشعبة ومجاز بالقراءات العشر الكبرى', bio: 'إمام وخطيب جامع النور، خبرة 15 سنة في تحفيظ القرآن الكريم وتدريس التجويد العملي.', audioUrl: '#', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 2, name: 'الشيخ المقرئ صابر عبد المولى', specialty: 'تصحح التلاوة والمقامات الصوتية', bio: 'أستاذ التجويد والقراءات بالأزهر الشريف سابقاً، محكم في مسابقات دولية متعددة للقرآن الكريم.', audioUrl: '#', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
  { id: 3, name: 'الشيخ الدكتور عمر الخالدي', specialty: 'تفسير القرآن والعلوم الشرعية', bio: 'حاصل على الدكتوراه في التفسير وعلوم القرآن، متخصص في ربط الحفظ بالتدبر وفهم المعاني.', audioUrl: '#', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];

export const honorBoard = [
  { name: 'يوسف عبد الرحمن العريفي', achievement: 'حفظ القرآن كاملاً مع الإجازة بسند متصل', date: 'شوال ١٤٤٧ هـ', badge: 'إجازة وسند' },
  { name: 'فيصل مساعد الحربي', achievement: 'المركز الأول في مسابقة الأثر الطيب الكبرى', date: 'رمضان ١٤٤٧ هـ', badge: 'المركز الأول' },
  { name: 'خالد وليد الرشيد', achievement: 'إتمام حفظ ١٥ جزءاً متتالية بتقدير ممتاز', date: 'شعبان ١٤٤٧ هـ', badge: 'تقدير ممتاز' }
];

export const quizQuestion = {
  text: "ما هو حكم النون الساكنة إذا جاء بعدها حرف 'الباء' في كلمة واحدة أو كلمتين؟",
  options: [
    { id: 'A', text: "الإدغام بغير غنة" },
    { id: 'B', text: "الإظهار الحلقي" },
    { id: 'C', text: "الإقلاب (قلب النون ميماً مخفاة بغنة)" },
    { id: 'D', text: "الإخفاء الحقيقي" }
  ],
  correctId: 'C',
  explanation: "يقلب النون الساكنة أو التنوين ميماً مخفاة بغنة إذا تلاها حرف الباء، ويرمز لها في المصحف بميم صغيرة قائمة (م)."
};
