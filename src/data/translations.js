export const languages = {
  ar: { code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  en: { code: 'en', name: 'English', dir: 'ltr', flag: '🇬🇧' },
  id: { code: 'id', name: 'Indonesia', dir: 'ltr', flag: '🇮🇩' },
  tr: { code: 'tr', name: 'Türkçe', dir: 'ltr', flag: '🇹🇷' }
};

export const translations = {
  ar: {
    common: {
      loading: 'جاري التحميل…',
      back: 'رجوع',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      send: 'إرسال',
      close: 'إغلاق',
      confirm: 'تأكيد',
      success: 'تم بنجاح',
      error: 'حدث خطأ',
      required: 'هذا الحقل مطلوب'
    },
    header: {
      about: 'عن الأكاديمية',
      sheikhs: 'شيوخ الأثر',
      honors: 'لوحة الشرف',
      contact: 'اتصل بنا',
      studentPortal: 'بوابة الطالب',
      teacherPortal: 'دخول المعلمين',
      developedBy: 'تم تصميم وتطوير هذا النظام بواسطة م/حسام السبعاوي'
    },
    hero: {
      title: 'أثرٌ يُساوي حياة',
      subtitle: 'أكاديمية رائدة لتعليم وتجويد القرآن الكريم والعلوم الشرعية، نخطو معك خطوة بخطوة في رحلتك مع كتاب الله تحت إشراف نخبة من كبار المقرئين والمشايخ الأجلاء بسند متصل.',
      joinAsStudent: 'انضم الآن كطالب',
      teacherPortal: 'بوابة المدرسين'
    },
    about: {
      badge: 'لماذا الأثر الطيب؟',
      title: 'تجربة تعليمية فريدة ومتكاملة',
      features: [
        {
          title: 'حلقات تعليمية مخصصة',
          desc: 'توفير حلقات فردية وجماعية لكل الأعمار والمستويات، تعتمد على التقييم المستمر وتعديل الخطط الفردية لكل طالب.'
        },
        {
          title: 'نظام الإجازات والسند',
          desc: 'الحصول على إجازات بروايات مختلفة للقرآن الكريم متصلة السند بسبل تيسير وتوثيق تليق بأهل القرآن.'
        },
        {
          title: 'أثرٌ يدوم وينفع',
          desc: 'نحن لا نهدف فقط للحفظ الآلي، بل نركز على فهم المعاني، تدبر الآيات، وغرس القيم القرآنية في سلوك الطالب.'
        }
      ]
    },
    sheikhs: {
      badge: 'شيوخ الأثر الطيب',
      title: 'استمع وشاهد نخبة من مشايخنا الفضلاء',
      subtitle: 'تصفح ملفات المشايخ واستمع لتلاواتهم أو شاهد الفيديو التعريفي لهم',
      watchVideo: 'عرض الفيديو',
      joinRequest: 'طلب الانضمام'
    },
    honors: {
      badge: 'لوحة الشرف والتميز',
      title: 'شرف الإنجاز وأثر المعرفة',
      subtitle: 'نحتفي بطلابنا المتميزين الذين نالوا الإجازات وتوجوا في المسابقات القرآنية'
    },
    contact: {
      badge: 'تواصل معنا',
      title: 'دعنا نتحدث عن مسارك القرآني',
      description: 'لديك استفسار حول المناهج، طريقة الحفظ الفردي، أو تود الانضمام لأحد الحلقات مباشرة؟ أرسل لنا رسالة وسنقوم بالرد عليك في أسرع وقت.',
      contactHours: 'مواعيد الاتصال',
      hoursValue: 'يومياً من ٢:٠٠ ظهراً حتى ١٠:٠٠ مساءً',
      nameLabel: 'الاسم الكامل',
      namePlaceholder: 'الاسم ثلاثي…',
      phoneLabel: 'رقم الجوال (واتساب)',
      messageLabel: 'الرسالة أو الاستفسار',
      messagePlaceholder: 'اكتب هنا تفاصيل طلبك أو الاستفسار…',
      sendButton: 'إرسال الرسالة',
      sentSuccess: 'تم الإرسال بنجاح ✓'
    },
    footer: {
      rights: 'جميع الحقوق محفوظة لأكاديمية الأثر الطيب',
      slogan: 'شعارنا أثرٌ يساوي حياة'
    },
    student: {
      title: 'بوابة دخول الطالب',
      subtitle: 'ادخل لمتابعة خطتك اليومية وتسميع تلاواتك واستعراض ملاحظات شيوخك.',
      selectStudent: 'اختر اسمك للدخول إلى لوحتك:',
      selectPlaceholder: '-- اختر الطالب --',
      backHome: 'رجوع للصفحة الرئيسية',
      noStudents: 'البوابة لا تحتوي على طلاب حالياً',
      noStudentsDesc: 'يرجى الدخول كمعلم وإضافة طالبك الأول أولاً، أو قم بإنشاء حساب طالب سريع للتحقق من البوابة.',
      quickRegister: 'تسجيل حساب طالب تجريبي سريع',
      greeting: 'السلام عليكم ورحمة الله',
      welcome: 'أهلاً بك يا',
      streakDays: 'أيام الحماس',
      days: 'أيام',
      pointsLabel: 'نقاط الأثر',
      points: 'نقطة',
      logout: 'تسجيل الخروج',
      tabs: {
        dashboard: 'لوحة الإنجاز',
        plan: 'متتبع الحفظ',
        sheikhs: 'شيوخ الأثر',
        record: 'مسجل التلاوات'
      },
      dashboard: {
        dailyHabits: 'العادات اليومية',
        pointsReward: '+20 نقطة',
        adhkar: 'أذكار الصباح والمساء',
        werd: 'ورد التلاوة اليومي (جزء)',
        murajaah: 'مراجعة المحفوظ القديم',
        weeklyActivity: 'نشاطك الأسبوعي',
        currentHomework: 'الواجب الحالي',
        noHomework: 'لا يوجد واجب محدد حالياً.',
        quizTitle: 'تحدي التجويد اليومي',
        quizReward: '+50 نقطة',
        submitAnswer: 'إرسال الإجابة',
        explanation: 'توضيح الشيخ:'
      },
      plan: {
        title: 'خريطة إنجاز الحفظ',
        totalProgress: 'معدل الحفظ الإجمالي',
        completed: 'مكتمل ومُراجع',
        completedTitle: 'سورة الفاتحة وجزء عم',
        completedDesc: 'تم التسميع بتقدير ممتاز مع الشيخ.',
        currentTarget: 'مستهدف الحفظ الحالي',
        currentDesc: 'أنت تقوم بحفظ هذه السورة حالياً.',
        reciteNew: 'تسميع الوجه الجديد',
        nextStep: 'الخطوة القادمة بالخطة',
        nextStepDesc: 'سيتم تحديدها بواسطة المعلم بعد إنهاء السورة الحالية.'
      },
      sheikhs: {
        changeSheikh: 'اختيار أو تغيير الشيخ',
        changeDesc: 'تستطيع التقديم بطلب لتغيير الشيخ الحالي أو الانضمام لمشايخ آخرين',
        video: 'فيديو',
        joinRequest: 'طلب الانضمام',
        joinSuccess: 'تم إرسال طلب انضمامك'
      },
      record: {
        badge: 'مسجل التلاوات الذكي',
        title: 'تدرب وسجل تلاوتك للشيخ',
        description: 'استعذ بالله ورتل الآيات المطلوبة',
        clearRecording: 'التسجيل الواضح يزيد فرصتك في الحصول على تقييم ممتاز.',
        readyToRecord: 'النظام جاهز للتسجيل',
        readyToSend: 'جاهز للإرسال',
        seconds: 'ثانية',
        startRecitation: 'بدء التلاوة',
        stopRecording: 'إنهاء المقطع',
        retry: 'إعادة المحاولة',
        submit: 'الاعتماد والإرسال',
        uploading: 'جاري الرفع…',
        micError: 'تعذر الوصول للميكروفون',
        uploadSuccess: 'تم إرسال تسجيلك بنجاح!',
        uploadError: 'حدث خطأ:'
      }
    },
    teacher: {
      title: 'بوابة المدرس وإدارة الحلقات',
      subtitle: 'لوحة التحكم والتمكين الفوري',
      studentsCount: 'عدد طلابك:',
      logout: 'خروج من البوابة',
      tabs: {
        students: 'إدارة طلاب',
        schedule: 'مواعيد الحلقات'
      },
      students: {
        searchPlaceholder: 'بحث باسم الطالب…',
        addStudent: 'إضافة طالب جديد',
        noResults: 'لا توجد نتائج مطابقة',
        noStudents: 'لا يوجد طلاب مسجلين في حلقتك',
        noResultsDesc: 'جرب البحث بكلمات مختلفة',
        noStudentsDesc: 'ابدأ بتسجيل أول طالب حقيقي في حلقتك',
        addFirst: 'إضافة طالبك الأول',
        table: {
          name: 'اسم الطالب',
          surah: 'سورة التسميع',
          progress: 'التقدم',
          grade: 'آخر تقييم',
          actions: 'التحكم'
        },
        update: 'تحديث',
        delete: 'حذف',
        confirmDelete: 'هل أنت متأكد من حذف هذا الطالب؟'
      },
      addModal: {
        title: 'تسجيل طالب جديد بالحلقة',
        nameLabel: 'اسم الطالب الكريم',
        namePlaceholder: 'أدخل الاسم ثلاثي…',
        planLabel: 'مسار الدراسة أو الخطة',
        planPlaceholder: 'مثال: حفظ جزء عم…',
        surahLabel: 'سورة البدء بالتسميع',
        surahPlaceholder: 'مثال: سورة البقرة…',
        homeworkLabel: 'تكليف الواجب الأولي',
        homeworkPlaceholder: 'حدد الصفحات المطلوبة…',
        confirm: 'تأكيد الإضافة',
        nameRequired: 'يرجى إدخال اسم الطالب'
      },
      editModal: {
        title: 'تعديل خطة وتقييم الطالب',
        surahLabel: 'سورة التسميع الحالية',
        progressLabel: 'نسبة تقدم الطالب (%)',
        gradeLabel: 'آخر درجة تقييم',
        homeworkLabel: 'الواجب والتكليف الجديد',
        homeworkPlaceholder: 'حدد الآيات المطلوبة…',
        save: 'حفظ التعديلات'
      },
      schedule: {
        title: 'جدول مواعيد الحلقات الأسبوعي',
        generalCircle: 'حلقة المسار العام (أولاد)',
        scheduleTime: 'السبت والاثنين والأربعاء - بعد صلاة المغرب',
        upcomingBadge: 'موعد الحفظ القادم قريباً'
      }
    },
    live: {
      title: 'الحصة المباشرة',
      live: 'مباشر',
      participants: 'مشارك',
      chat: 'المحادثة',
      noMessages: 'لا توجد رسائل بعد',
      typeMessage: 'اكتب رسالتك...',
      leave: 'مغادرة',
      connecting: 'جاري الاتصال...',
      error: 'حدث خطأ',
      sessionsTitle: 'الحصص المباشرة',
      sessionsSubtitle: 'انضم إلى الحصص المباشرة أو ابدأ حصة جديدة',
      createSession: 'إنشاء حصة جديدة',
      noSessions: 'لا توجد حصص مباشرة',
      noSessionsDesc: 'ابدأ بإنشاء حصة مباشرة جديدة لطلابك',
      createFirst: 'إنشاء أول حصة',
      scheduled: 'مجدولة',
      joinNow: 'انضم الآن',
      enterRoom: 'دخول الغرفة',
      copyLink: 'نسخ الرابط',
      confirmDelete: 'هل أنت متأكد من حذف هذه الحصة؟',
      createSessionDesc: 'أنشئ حصة مباشرة جديدة وشارك الرابط مع طلابك',
      sessionTitle: 'عنوان الحصة',
      sessionTitlePlaceholder: 'مثال: حصة تجويد - سورة البقرة',
      sessionSubject: 'المادة',
      selectSubject: 'اختر المادة',
      subjects: {
        quran: 'القرآن الكريم',
        tajweed: 'التجويد',
        tafseer: 'التفسير',
        hadith: 'الحديث',
        fiqh: 'الفقه',
        arabic: 'اللغة العربية'
      },
      sessionDescription: 'الوصف',
      sessionDescriptionPlaceholder: 'وصف مختصر للحصة...',
      startSession: 'بدء الحصة',
      general: 'عام'
    },
    notFound: {
      title: 'الصفحة غير موجودة',
      description: 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.',
      backHome: 'العودة للرئيسية',
      tryInstead: 'أو جرب أحد هذه الروابط:',
      needHelp: 'تحتاج مساعدة؟',
      contactUs: 'تواصل معنا وسنساعدك في العثور على ما تبحث عنه',
      suggestions: {
        home: 'الصفحة الرئيسية',
        student: 'بوابة الطالب',
        teacher: 'بوابة المعلم'
      }
    },
    days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
  },
  en: {
    common: {
      loading: 'Loading…',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      send: 'Send',
      close: 'Close',
      confirm: 'Confirm',
      success: 'Success',
      error: 'Error occurred',
      required: 'This field is required'
    },
    header: {
      about: 'About',
      sheikhs: 'Our Sheikhs',
      honors: 'Honor Board',
      contact: 'Contact Us',
      studentPortal: 'Student Portal',
      teacherPortal: 'Teacher Portal',
      developedBy: 'Designed & Developed by Eng. Hossam Al-Sabawi'
    },
    hero: {
      title: 'A Legacy Worth a Life',
      subtitle: 'A leading academy for Quran memorization and Tajweed, walking with you step by step in your journey with the Book of Allah under the supervision of elite reciters and scholars with connected chains of narration.',
      joinAsStudent: 'Join as Student',
      teacherPortal: 'Teacher Portal'
    },
    about: {
      badge: 'Why Al-Athar Al-Tayyib?',
      title: 'A Unique & Complete Learning Experience',
      features: [
        {
          title: 'Customized Learning Circles',
          desc: 'Individual and group circles for all ages and levels, based on continuous assessment and personalized plans for each student.'
        },
        {
          title: 'Ijazah & Sanad System',
          desc: 'Obtain Ijazahs in various Quran recitations with connected chains of narration through methods befitting the people of Quran.'
        },
        {
          title: 'A Lasting Beneficial Legacy',
          desc: 'We don\'t just aim for mechanical memorization, but focus on understanding meanings, reflecting on verses, and instilling Quranic values in student behavior.'
        }
      ]
    },
    sheikhs: {
      badge: 'Al-Athar Al-Tayyib Sheikhs',
      title: 'Listen & Watch Our Esteemed Sheikhs',
      subtitle: 'Browse sheikh profiles, listen to their recitations, or watch their introduction videos',
      watchVideo: 'Watch Video',
      joinRequest: 'Join Request'
    },
    honors: {
      badge: 'Honor & Excellence Board',
      title: 'The Honor of Achievement & Knowledge',
      subtitle: 'We celebrate our distinguished students who earned Ijazahs and excelled in Quran competitions'
    },
    contact: {
      badge: 'Contact Us',
      title: 'Let\'s Talk About Your Quran Journey',
      description: 'Have questions about curricula, individual memorization methods, or want to join a circle directly? Send us a message and we\'ll respond as soon as possible.',
      contactHours: 'Contact Hours',
      hoursValue: 'Daily from 2:00 PM to 10:00 PM',
      nameLabel: 'Full Name',
      namePlaceholder: 'Enter your full name…',
      phoneLabel: 'Phone Number (WhatsApp)',
      messageLabel: 'Message or Inquiry',
      messagePlaceholder: 'Write your request or inquiry details here…',
      sendButton: 'Send Message',
      sentSuccess: 'Sent Successfully ✓'
    },
    footer: {
      rights: 'All rights reserved to Al-Athar Al-Tayyib Academy',
      slogan: 'Our slogan: A Legacy Worth a Life'
    },
    student: {
      title: 'Student Portal Login',
      subtitle: 'Enter to track your daily plan, recite your recitations, and review your sheikhs\' notes.',
      selectStudent: 'Select your name to enter your dashboard:',
      selectPlaceholder: '-- Select Student --',
      backHome: 'Back to Home',
      noStudents: 'Portal has no students currently',
      noStudentsDesc: 'Please login as teacher and add your first student, or create a quick test student account.',
      quickRegister: 'Quick Test Student Registration',
      greeting: 'Peace be upon you',
      welcome: 'Welcome,',
      streakDays: 'Streak Days',
      days: 'days',
      pointsLabel: 'Legacy Points',
      points: 'points',
      logout: 'Logout',
      tabs: {
        dashboard: 'Achievement Board',
        plan: 'Memorization Tracker',
        sheikhs: 'Sheikhs',
        record: 'Recitation Recorder'
      },
      dashboard: {
        dailyHabits: 'Daily Habits',
        pointsReward: '+20 points',
        adhkar: 'Morning & Evening Adhkar',
        werd: 'Daily Recitation Wird (1 Juz)',
        murajaah: 'Review Old Memorization',
        weeklyActivity: 'Weekly Activity',
        currentHomework: 'Current Homework',
        noHomework: 'No homework assigned currently.',
        quizTitle: 'Daily Tajweed Challenge',
        quizReward: '+50 points',
        submitAnswer: 'Submit Answer',
        explanation: 'Sheikh\'s Explanation:'
      },
      plan: {
        title: 'Memorization Achievement Map',
        totalProgress: 'Overall Progress Rate',
        completed: 'Completed & Reviewed',
        completedTitle: 'Surah Al-Fatihah & Juz Amma',
        completedDesc: 'Recited with excellent grade with the Sheikh.',
        currentTarget: 'Current Memorization Target',
        currentDesc: 'You are currently memorizing this Surah.',
        reciteNew: 'Recite New Page',
        nextStep: 'Next Step in Plan',
        nextStepDesc: 'Will be determined by teacher after completing current Surah.'
      },
      sheikhs: {
        changeSheikh: 'Select or Change Sheikh',
        changeDesc: 'You can request to change your current sheikh or join other sheikhs',
        video: 'Video',
        joinRequest: 'Join Request',
        joinSuccess: 'Your join request has been sent'
      },
      record: {
        badge: 'Smart Recitation Recorder',
        title: 'Practice & Record Your Recitation',
        description: 'Seek refuge in Allah and recite the required verses',
        clearRecording: 'Clear recording increases your chances of getting an excellent grade.',
        readyToRecord: 'System ready for recording',
        readyToSend: 'Ready to send',
        seconds: 'seconds',
        startRecitation: 'Start Recitation',
        stopRecording: 'Stop Recording',
        retry: 'Retry',
        submit: 'Approve & Send',
        uploading: 'Uploading…',
        micError: 'Cannot access microphone',
        uploadSuccess: 'Recording sent successfully!',
        uploadError: 'Error occurred:'
      }
    },
    teacher: {
      title: 'Teacher Portal & Circle Management',
      subtitle: 'Control Panel & Instant Empowerment',
      studentsCount: 'Your students:',
      logout: 'Exit Portal',
      tabs: {
        students: 'Student Management',
        schedule: 'Circle Schedule'
      },
      students: {
        searchPlaceholder: 'Search by student name…',
        addStudent: 'Add New Student',
        noResults: 'No matching results',
        noStudents: 'No students registered in your circle',
        noResultsDesc: 'Try different search terms',
        noStudentsDesc: 'Start by registering your first real student',
        addFirst: 'Add Your First Student',
        table: {
          name: 'Student Name',
          surah: 'Recitation Surah',
          progress: 'Progress',
          grade: 'Last Grade',
          actions: 'Actions'
        },
        update: 'Update',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this student?'
      },
      addModal: {
        title: 'Register New Student',
        nameLabel: 'Student Name',
        namePlaceholder: 'Enter full name…',
        planLabel: 'Study Plan or Track',
        planPlaceholder: 'e.g., Memorize Juz Amma…',
        surahLabel: 'Starting Recitation Surah',
        surahPlaceholder: 'e.g., Surah Al-Baqarah…',
        homeworkLabel: 'Initial Homework Assignment',
        homeworkPlaceholder: 'Specify required pages…',
        confirm: 'Confirm Addition',
        nameRequired: 'Please enter student name'
      },
      editModal: {
        title: 'Edit Student Plan & Grade',
        surahLabel: 'Current Recitation Surah',
        progressLabel: 'Student Progress (%)',
        gradeLabel: 'Last Grade',
        homeworkLabel: 'New Homework Assignment',
        homeworkPlaceholder: 'Specify required verses…',
        save: 'Save Changes'
      },
      schedule: {
        title: 'Weekly Circle Schedule',
        generalCircle: 'General Track Circle (Boys)',
        scheduleTime: 'Saturday, Monday & Wednesday - After Maghrib Prayer',
        upcomingBadge: 'Next memorization session coming soon'
      }
    },
    live: {
      title: 'Live Session',
      live: 'Live',
      participants: 'participants',
      chat: 'Chat',
      noMessages: 'No messages yet',
      typeMessage: 'Type your message...',
      leave: 'Leave',
      connecting: 'Connecting...',
      error: 'Error occurred',
      sessionsTitle: 'Live Sessions',
      sessionsSubtitle: 'Join live sessions or start a new one',
      createSession: 'Create New Session',
      noSessions: 'No live sessions',
      noSessionsDesc: 'Start by creating a new live session for your students',
      createFirst: 'Create First Session',
      scheduled: 'Scheduled',
      joinNow: 'Join Now',
      enterRoom: 'Enter Room',
      copyLink: 'Copy Link',
      confirmDelete: 'Are you sure you want to delete this session?',
      createSessionDesc: 'Create a new live session and share the link with your students',
      sessionTitle: 'Session Title',
      sessionTitlePlaceholder: 'e.g., Tajweed Class - Surah Al-Baqarah',
      sessionSubject: 'Subject',
      selectSubject: 'Select Subject',
      subjects: {
        quran: 'Quran',
        tajweed: 'Tajweed',
        tafseer: 'Tafseer',
        hadith: 'Hadith',
        fiqh: 'Fiqh',
        arabic: 'Arabic Language'
      },
      sessionDescription: 'Description',
      sessionDescriptionPlaceholder: 'Brief description of the session...',
      startSession: 'Start Session',
      general: 'General'
    },
    notFound: {
      title: 'Page Not Found',
      description: 'Sorry, we could not find the page you are looking for. It may have been moved or deleted.',
      backHome: 'Back to Home',
      tryInstead: 'Or try one of these links:',
      needHelp: 'Need help?',
      contactUs: 'Contact us and we will help you find what you are looking for',
      suggestions: {
        home: 'Home',
        student: 'Student Portal',
        teacher: 'Teacher Portal'
      }
    },
    days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  id: {
    common: {
      loading: 'Memuat…',
      back: 'Kembali',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      add: 'Tambah',
      search: 'Cari',
      send: 'Kirim',
      close: 'Tutup',
      confirm: 'Konfirmasi',
      success: 'Berhasil',
      error: 'Terjadi kesalahan',
      required: 'Kolom ini wajib diisi'
    },
    header: {
      about: 'Tentang',
      sheikhs: 'Para Syekh',
      honors: 'Papan Kehormatan',
      contact: 'Hubungi Kami',
      studentPortal: 'Portal Siswa',
      teacherPortal: 'Portal Guru',
      developedBy: 'Dirancang & Dikembangkan oleh Eng. Hossam Al-Sabawi'
    },
    hero: {
      title: 'Warisan Seharga Kehidupan',
      subtitle: 'Akademi terkemuka untuk hafalan dan Tajwid Al-Quran, melangkah bersama Anda dalam perjalanan dengan Kitab Allah di bawah pengawasan para qari dan ulama elit dengan sanad yang bersambung.',
      joinAsStudent: 'Daftar sebagai Siswa',
      teacherPortal: 'Portal Guru'
    },
    about: {
      badge: 'Mengapa Al-Athar Al-Tayyib?',
      title: 'Pengalaman Belajar Unik & Lengkap',
      features: [
        {
          title: 'Halaqah Pembelajaran Khusus',
          desc: 'Halaqah individu dan kelompok untuk semua usia dan tingkat, berdasarkan penilaian berkelanjutan dan rencana pribadi untuk setiap siswa.'
        },
        {
          title: 'Sistem Ijazah & Sanad',
          desc: 'Dapatkan ijazah dalam berbagai qiraat Al-Quran dengan sanad bersambung melalui metode yang layak bagi Ahlul Quran.'
        },
        {
          title: 'Warisan Abadi yang Bermanfaat',
          desc: 'Kami tidak hanya bertujuan hafalan mekanis, tetapi fokus pada pemahaman makna, merenungkan ayat, dan menanamkan nilai-nilai Quran dalam perilaku siswa.'
        }
      ]
    },
    sheikhs: {
      badge: 'Para Syekh Al-Athar Al-Tayyib',
      title: 'Dengarkan & Saksikan Para Syekh Mulia Kami',
      subtitle: 'Jelajahi profil syekh, dengarkan bacaan mereka, atau tonton video perkenalan mereka',
      watchVideo: 'Tonton Video',
      joinRequest: 'Permintaan Bergabung'
    },
    honors: {
      badge: 'Papan Kehormatan & Keunggulan',
      title: 'Kehormatan Prestasi & Pengetahuan',
      subtitle: 'Kami merayakan siswa berprestasi yang meraih ijazah dan unggul dalam kompetisi Quran'
    },
    contact: {
      badge: 'Hubungi Kami',
      title: 'Mari Bicara Tentang Perjalanan Quran Anda',
      description: 'Punya pertanyaan tentang kurikulum, metode hafalan individu, atau ingin bergabung dengan halaqah? Kirim pesan dan kami akan merespons secepat mungkin.',
      contactHours: 'Jam Kontak',
      hoursValue: 'Setiap hari dari 14:00 hingga 22:00',
      nameLabel: 'Nama Lengkap',
      namePlaceholder: 'Masukkan nama lengkap…',
      phoneLabel: 'Nomor Telepon (WhatsApp)',
      messageLabel: 'Pesan atau Pertanyaan',
      messagePlaceholder: 'Tulis detail permintaan atau pertanyaan Anda di sini…',
      sendButton: 'Kirim Pesan',
      sentSuccess: 'Berhasil Dikirim ✓'
    },
    footer: {
      rights: 'Hak cipta Akademi Al-Athar Al-Tayyib',
      slogan: 'Slogan kami: Warisan Seharga Kehidupan'
    },
    student: {
      title: 'Login Portal Siswa',
      subtitle: 'Masuk untuk melacak rencana harian, membaca bacaan, dan meninjau catatan syekh Anda.',
      selectStudent: 'Pilih nama Anda untuk masuk ke dashboard:',
      selectPlaceholder: '-- Pilih Siswa --',
      backHome: 'Kembali ke Beranda',
      noStudents: 'Portal belum memiliki siswa',
      noStudentsDesc: 'Silakan login sebagai guru dan tambahkan siswa pertama, atau buat akun siswa uji cepat.',
      quickRegister: 'Pendaftaran Siswa Uji Cepat',
      greeting: 'Assalamu\'alaikum',
      welcome: 'Selamat datang,',
      streakDays: 'Hari Beruntun',
      days: 'hari',
      pointsLabel: 'Poin Warisan',
      points: 'poin',
      logout: 'Keluar',
      tabs: {
        dashboard: 'Papan Prestasi',
        plan: 'Pelacak Hafalan',
        sheikhs: 'Para Syekh',
        record: 'Perekam Bacaan'
      },
      dashboard: {
        dailyHabits: 'Kebiasaan Harian',
        pointsReward: '+20 poin',
        adhkar: 'Dzikir Pagi & Petang',
        werd: 'Wird Bacaan Harian (1 Juz)',
        murajaah: 'Ulangi Hafalan Lama',
        weeklyActivity: 'Aktivitas Mingguan',
        currentHomework: 'PR Saat Ini',
        noHomework: 'Belum ada PR yang ditugaskan.',
        quizTitle: 'Tantangan Tajwid Harian',
        quizReward: '+50 poin',
        submitAnswer: 'Kirim Jawaban',
        explanation: 'Penjelasan Syekh:'
      },
      plan: {
        title: 'Peta Prestasi Hafalan',
        totalProgress: 'Tingkat Kemajuan Keseluruhan',
        completed: 'Selesai & Diulang',
        completedTitle: 'Surah Al-Fatihah & Juz Amma',
        completedDesc: 'Dibaca dengan nilai sangat baik bersama Syekh.',
        currentTarget: 'Target Hafalan Saat Ini',
        currentDesc: 'Anda sedang menghafal surah ini.',
        reciteNew: 'Baca Halaman Baru',
        nextStep: 'Langkah Berikutnya',
        nextStepDesc: 'Akan ditentukan guru setelah menyelesaikan surah saat ini.'
      },
      sheikhs: {
        changeSheikh: 'Pilih atau Ganti Syekh',
        changeDesc: 'Anda dapat meminta untuk mengganti syekh atau bergabung dengan syekh lain',
        video: 'Video',
        joinRequest: 'Permintaan Bergabung',
        joinSuccess: 'Permintaan bergabung Anda telah dikirim'
      },
      record: {
        badge: 'Perekam Bacaan Cerdas',
        title: 'Latihan & Rekam Bacaan Anda',
        description: 'Berlindunglah kepada Allah dan bacalah ayat yang diminta',
        clearRecording: 'Rekaman yang jelas meningkatkan peluang mendapat nilai sangat baik.',
        readyToRecord: 'Sistem siap merekam',
        readyToSend: 'Siap dikirim',
        seconds: 'detik',
        startRecitation: 'Mulai Membaca',
        stopRecording: 'Berhenti Merekam',
        retry: 'Coba Lagi',
        submit: 'Setujui & Kirim',
        uploading: 'Mengunggah…',
        micError: 'Tidak dapat mengakses mikrofon',
        uploadSuccess: 'Rekaman berhasil dikirim!',
        uploadError: 'Terjadi kesalahan:'
      }
    },
    teacher: {
      title: 'Portal Guru & Manajemen Halaqah',
      subtitle: 'Panel Kontrol & Pemberdayaan Instan',
      studentsCount: 'Jumlah siswa:',
      logout: 'Keluar Portal',
      tabs: {
        students: 'Manajemen Siswa',
        schedule: 'Jadwal Halaqah'
      },
      students: {
        searchPlaceholder: 'Cari nama siswa…',
        addStudent: 'Tambah Siswa Baru',
        noResults: 'Tidak ada hasil yang cocok',
        noStudents: 'Belum ada siswa terdaftar di halaqah Anda',
        noResultsDesc: 'Coba kata pencarian berbeda',
        noStudentsDesc: 'Mulai daftarkan siswa pertama Anda',
        addFirst: 'Tambah Siswa Pertama',
        table: {
          name: 'Nama Siswa',
          surah: 'Surah Bacaan',
          progress: 'Kemajuan',
          grade: 'Nilai Terakhir',
          actions: 'Aksi'
        },
        update: 'Perbarui',
        delete: 'Hapus',
        confirmDelete: 'Apakah Anda yakin ingin menghapus siswa ini?'
      },
      addModal: {
        title: 'Daftarkan Siswa Baru',
        nameLabel: 'Nama Siswa',
        namePlaceholder: 'Masukkan nama lengkap…',
        planLabel: 'Rencana atau Jalur Studi',
        planPlaceholder: 'mis., Hafalan Juz Amma…',
        surahLabel: 'Surah Awal Bacaan',
        surahPlaceholder: 'mis., Surah Al-Baqarah…',
        homeworkLabel: 'Tugas PR Awal',
        homeworkPlaceholder: 'Tentukan halaman yang diminta…',
        confirm: 'Konfirmasi Penambahan',
        nameRequired: 'Mohon masukkan nama siswa'
      },
      editModal: {
        title: 'Edit Rencana & Nilai Siswa',
        surahLabel: 'Surah Bacaan Saat Ini',
        progressLabel: 'Kemajuan Siswa (%)',
        gradeLabel: 'Nilai Terakhir',
        homeworkLabel: 'Tugas PR Baru',
        homeworkPlaceholder: 'Tentukan ayat yang diminta…',
        save: 'Simpan Perubahan'
      },
      schedule: {
        title: 'Jadwal Halaqah Mingguan',
        generalCircle: 'Halaqah Jalur Umum (Laki-laki)',
        scheduleTime: 'Sabtu, Senin & Rabu - Setelah Sholat Maghrib',
        upcomingBadge: 'Sesi hafalan berikutnya segera'
      }
    },
    live: {
      title: 'Sesi Langsung',
      live: 'Langsung',
      participants: 'peserta',
      chat: 'Obrolan',
      noMessages: 'Belum ada pesan',
      typeMessage: 'Ketik pesan Anda...',
      leave: 'Keluar',
      connecting: 'Menghubungkan...',
      error: 'Terjadi kesalahan',
      sessionsTitle: 'Sesi Langsung',
      sessionsSubtitle: 'Bergabung dengan sesi langsung atau mulai yang baru',
      createSession: 'Buat Sesi Baru',
      noSessions: 'Tidak ada sesi langsung',
      noSessionsDesc: 'Mulai dengan membuat sesi langsung baru untuk siswa Anda',
      createFirst: 'Buat Sesi Pertama',
      scheduled: 'Dijadwalkan',
      joinNow: 'Gabung Sekarang',
      enterRoom: 'Masuk Ruangan',
      copyLink: 'Salin Tautan',
      confirmDelete: 'Apakah Anda yakin ingin menghapus sesi ini?',
      createSessionDesc: 'Buat sesi langsung baru dan bagikan tautan dengan siswa Anda',
      sessionTitle: 'Judul Sesi',
      sessionTitlePlaceholder: 'mis., Kelas Tajwid - Surah Al-Baqarah',
      sessionSubject: 'Mata Pelajaran',
      selectSubject: 'Pilih Mata Pelajaran',
      subjects: {
        quran: 'Al-Quran',
        tajweed: 'Tajwid',
        tafseer: 'Tafsir',
        hadith: 'Hadis',
        fiqh: 'Fikih',
        arabic: 'Bahasa Arab'
      },
      sessionDescription: 'Deskripsi',
      sessionDescriptionPlaceholder: 'Deskripsi singkat sesi...',
      startSession: 'Mulai Sesi',
      general: 'Umum'
    },
    notFound: {
      title: 'Halaman Tidak Ditemukan',
      description: 'Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin telah dipindahkan atau dihapus.',
      backHome: 'Kembali ke Beranda',
      tryInstead: 'Atau coba salah satu tautan ini:',
      needHelp: 'Butuh bantuan?',
      contactUs: 'Hubungi kami dan kami akan membantu Anda menemukan yang Anda cari',
      suggestions: {
        home: 'Beranda',
        student: 'Portal Siswa',
        teacher: 'Portal Guru'
      }
    },
    days: ['Sabtu', 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  },
  tr: {
    common: {
      loading: 'Yükleniyor…',
      back: 'Geri',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      search: 'Ara',
      send: 'Gönder',
      close: 'Kapat',
      confirm: 'Onayla',
      success: 'Başarılı',
      error: 'Hata oluştu',
      required: 'Bu alan zorunludur'
    },
    header: {
      about: 'Hakkında',
      sheikhs: 'Hocalarımız',
      honors: 'Onur Listesi',
      contact: 'İletişim',
      studentPortal: 'Öğrenci Portalı',
      teacherPortal: 'Öğretmen Portalı',
      developedBy: 'Müh. Hossam Al-Sabawi tarafından tasarlandı ve geliştirildi'
    },
    hero: {
      title: 'Hayata Değer Bir Miras',
      subtitle: 'Kur\'an ezberleme ve tecvid alanında öncü bir akademi, Allah\'ın Kitabı ile yolculuğunuzda senetli hocalar gözetiminde adım adım sizinle yürüyoruz.',
      joinAsStudent: 'Öğrenci Olarak Katıl',
      teacherPortal: 'Öğretmen Portalı'
    },
    about: {
      badge: 'Neden Al-Athar Al-Tayyib?',
      title: 'Benzersiz ve Kapsamlı Bir Öğrenme Deneyimi',
      features: [
        {
          title: 'Özel Öğretim Halkaları',
          desc: 'Her yaş ve seviyeye uygun bireysel ve grup halkaları, sürekli değerlendirme ve her öğrenci için kişiselleştirilmiş planlara dayanır.'
        },
        {
          title: 'İcazet ve Senet Sistemi',
          desc: 'Kur\'an-ı Kerim\'in çeşitli kıraatlerinde, Kur\'an ehline yaraşır yöntemlerle bağlı senetlerle icazet alın.'
        },
        {
          title: 'Kalıcı ve Faydalı Bir Miras',
          desc: 'Sadece mekanik ezberlemeyi hedeflemiyoruz, anlamları anlamaya, ayetleri düşünmeye ve Kur\'ani değerleri öğrenci davranışına yerleştirmeye odaklanıyoruz.'
        }
      ]
    },
    sheikhs: {
      badge: 'Al-Athar Al-Tayyib Hocaları',
      title: 'Değerli Hocalarımızı Dinleyin ve İzleyin',
      subtitle: 'Hoca profillerini inceleyin, tilavetlerini dinleyin veya tanıtım videolarını izleyin',
      watchVideo: 'Videoyu İzle',
      joinRequest: 'Katılma Talebi'
    },
    honors: {
      badge: 'Onur ve Başarı Listesi',
      title: 'Başarının ve Bilginin Onuru',
      subtitle: 'İcazet alan ve Kur\'an yarışmalarında başarılı olan seçkin öğrencilerimizi kutluyoruz'
    },
    contact: {
      badge: 'İletişime Geçin',
      title: 'Kur\'an Yolculuğunuz Hakkında Konuşalım',
      description: 'Müfredat, bireysel ezberleme yöntemleri hakkında sorularınız mı var veya bir halkaya katılmak mı istiyorsunuz? Bize mesaj gönderin, en kısa sürede yanıt vereceğiz.',
      contactHours: 'İletişim Saatleri',
      hoursValue: 'Her gün 14:00 - 22:00 arası',
      nameLabel: 'Ad Soyad',
      namePlaceholder: 'Tam adınızı girin…',
      phoneLabel: 'Telefon Numarası (WhatsApp)',
      messageLabel: 'Mesaj veya Soru',
      messagePlaceholder: 'Talep veya soru detaylarınızı buraya yazın…',
      sendButton: 'Mesaj Gönder',
      sentSuccess: 'Başarıyla Gönderildi ✓'
    },
    footer: {
      rights: 'Al-Athar Al-Tayyib Akademisi tüm hakları saklıdır',
      slogan: 'Sloganımız: Hayata Değer Bir Miras'
    },
    student: {
      title: 'Öğrenci Portalı Girişi',
      subtitle: 'Günlük planınızı takip etmek, tilavetlerinizi okumak ve hocalarınızın notlarını incelemek için giriş yapın.',
      selectStudent: 'Panelinize girmek için adınızı seçin:',
      selectPlaceholder: '-- Öğrenci Seçin --',
      backHome: 'Ana Sayfaya Dön',
      noStudents: 'Portalda şu anda öğrenci yok',
      noStudentsDesc: 'Lütfen öğretmen olarak giriş yapın ve ilk öğrencinizi ekleyin veya hızlı test öğrenci hesabı oluşturun.',
      quickRegister: 'Hızlı Test Öğrenci Kaydı',
      greeting: 'Selamün aleyküm',
      welcome: 'Hoş geldiniz,',
      streakDays: 'Seri Günler',
      days: 'gün',
      pointsLabel: 'Miras Puanları',
      points: 'puan',
      logout: 'Çıkış Yap',
      tabs: {
        dashboard: 'Başarı Paneli',
        plan: 'Ezber Takipçisi',
        sheikhs: 'Hocalar',
        record: 'Tilavet Kaydedici'
      },
      dashboard: {
        dailyHabits: 'Günlük Alışkanlıklar',
        pointsReward: '+20 puan',
        adhkar: 'Sabah ve Akşam Zikirleri',
        werd: 'Günlük Tilavet Virdi (1 Cüz)',
        murajaah: 'Eski Ezberi Tekrarla',
        weeklyActivity: 'Haftalık Aktivite',
        currentHomework: 'Mevcut Ödev',
        noHomework: 'Şu anda ödev atanmamış.',
        quizTitle: 'Günlük Tecvid Meydan Okuması',
        quizReward: '+50 puan',
        submitAnswer: 'Cevabı Gönder',
        explanation: 'Hocanın Açıklaması:'
      },
      plan: {
        title: 'Ezber Başarı Haritası',
        totalProgress: 'Genel İlerleme Oranı',
        completed: 'Tamamlandı & Tekrarlandı',
        completedTitle: 'Fatiha Suresi ve Cüz Amme',
        completedDesc: 'Hoca ile mükemmel notla okundu.',
        currentTarget: 'Mevcut Ezber Hedefi',
        currentDesc: 'Şu anda bu sureyi ezberliyorsunuz.',
        reciteNew: 'Yeni Sayfa Oku',
        nextStep: 'Plandaki Sonraki Adım',
        nextStepDesc: 'Mevcut sure tamamlandıktan sonra hoca tarafından belirlenecek.'
      },
      sheikhs: {
        changeSheikh: 'Hoca Seç veya Değiştir',
        changeDesc: 'Mevcut hocanızı değiştirmek veya diğer hocalara katılmak için talep gönderebilirsiniz',
        video: 'Video',
        joinRequest: 'Katılma Talebi',
        joinSuccess: 'Katılma talebiniz gönderildi'
      },
      record: {
        badge: 'Akıllı Tilavet Kaydedici',
        title: 'Pratik Yapın ve Tilavetinizi Kaydedin',
        description: 'Allah\'a sığının ve istenen ayetleri okuyun',
        clearRecording: 'Net kayıt, mükemmel not alma şansınızı artırır.',
        readyToRecord: 'Sistem kayda hazır',
        readyToSend: 'Gönderilmeye hazır',
        seconds: 'saniye',
        startRecitation: 'Okumaya Başla',
        stopRecording: 'Kaydı Durdur',
        retry: 'Tekrar Dene',
        submit: 'Onayla ve Gönder',
        uploading: 'Yükleniyor…',
        micError: 'Mikrofona erişilemiyor',
        uploadSuccess: 'Kayıt başarıyla gönderildi!',
        uploadError: 'Hata oluştu:'
      }
    },
    teacher: {
      title: 'Öğretmen Portalı ve Halka Yönetimi',
      subtitle: 'Kontrol Paneli ve Anlık Güçlendirme',
      studentsCount: 'Öğrenci sayınız:',
      logout: 'Portaldan Çık',
      tabs: {
        students: 'Öğrenci Yönetimi',
        schedule: 'Halka Programı'
      },
      students: {
        searchPlaceholder: 'Öğrenci adıyla ara…',
        addStudent: 'Yeni Öğrenci Ekle',
        noResults: 'Eşleşen sonuç yok',
        noStudents: 'Halkanızda kayıtlı öğrenci yok',
        noResultsDesc: 'Farklı arama terimleri deneyin',
        noStudentsDesc: 'İlk gerçek öğrencinizi kaydederek başlayın',
        addFirst: 'İlk Öğrencinizi Ekleyin',
        table: {
          name: 'Öğrenci Adı',
          surah: 'Tilavet Suresi',
          progress: 'İlerleme',
          grade: 'Son Not',
          actions: 'İşlemler'
        },
        update: 'Güncelle',
        delete: 'Sil',
        confirmDelete: 'Bu öğrenciyi silmek istediğinizden emin misiniz?'
      },
      addModal: {
        title: 'Yeni Öğrenci Kaydet',
        nameLabel: 'Öğrenci Adı',
        namePlaceholder: 'Tam ad girin…',
        planLabel: 'Çalışma Planı veya Yol',
        planPlaceholder: 'örn., Cüz Amme Ezberi…',
        surahLabel: 'Başlangıç Tilavet Suresi',
        surahPlaceholder: 'örn., Bakara Suresi…',
        homeworkLabel: 'İlk Ödev Görevi',
        homeworkPlaceholder: 'İstenen sayfaları belirtin…',
        confirm: 'Eklemeyi Onayla',
        nameRequired: 'Lütfen öğrenci adını girin'
      },
      editModal: {
        title: 'Öğrenci Planı ve Notu Düzenle',
        surahLabel: 'Mevcut Tilavet Suresi',
        progressLabel: 'Öğrenci İlerlemesi (%)',
        gradeLabel: 'Son Not',
        homeworkLabel: 'Yeni Ödev Görevi',
        homeworkPlaceholder: 'İstenen ayetleri belirtin…',
        save: 'Değişiklikleri Kaydet'
      },
      schedule: {
        title: 'Haftalık Halka Programı',
        generalCircle: 'Genel Yol Halkası (Erkekler)',
        scheduleTime: 'Cumartesi, Pazartesi ve Çarşamba - Akşam Namazından Sonra',
        upcomingBadge: 'Sonraki ezber oturumu yakında'
      }
    },
    live: {
      title: 'Canlı Ders',
      live: 'Canlı',
      participants: 'katılımcı',
      chat: 'Sohbet',
      noMessages: 'Henüz mesaj yok',
      typeMessage: 'Mesajınızı yazın...',
      leave: 'Ayrıl',
      connecting: 'Bağlanıyor...',
      error: 'Hata oluştu',
      sessionsTitle: 'Canlı Dersler',
      sessionsSubtitle: 'Canlı derslere katılın veya yeni bir tane başlatın',
      createSession: 'Yeni Ders Oluştur',
      noSessions: 'Canlı ders yok',
      noSessionsDesc: 'Öğrencileriniz için yeni bir canlı ders oluşturarak başlayın',
      createFirst: 'İlk Dersi Oluştur',
      scheduled: 'Planlanmış',
      joinNow: 'Şimdi Katıl',
      enterRoom: 'Odaya Gir',
      copyLink: 'Bağlantıyı Kopyala',
      confirmDelete: 'Bu dersi silmek istediğinizden emin misiniz?',
      createSessionDesc: 'Yeni bir canlı ders oluşturun ve bağlantıyı öğrencilerinizle paylaşın',
      sessionTitle: 'Ders Başlığı',
      sessionTitlePlaceholder: 'örn., Tecvid Dersi - Bakara Suresi',
      sessionSubject: 'Konu',
      selectSubject: 'Konu Seçin',
      subjects: {
        quran: 'Kuran',
        tajweed: 'Tecvid',
        tafseer: 'Tefsir',
        hadith: 'Hadis',
        fiqh: 'Fıkıh',
        arabic: 'Arapça'
      },
      sessionDescription: 'Açıklama',
      sessionDescriptionPlaceholder: 'Dersin kısa açıklaması...',
      startSession: 'Dersi Başlat',
      general: 'Genel'
    },
    notFound: {
      title: 'Sayfa Bulunamadı',
      description: 'Üzgünüz, aradığınız sayfayı bulamadık. Taşınmış veya silinmiş olabilir.',
      backHome: 'Ana Sayfaya Dön',
      tryInstead: 'Veya bu bağlantılardan birini deneyin:',
      needHelp: 'Yardıma mı ihtiyacınız var?',
      contactUs: 'Bizimle iletişime geçin, aradığınızı bulmanıza yardımcı olalım',
      suggestions: {
        home: 'Ana Sayfa',
        student: 'Öğrenci Portalı',
        teacher: 'Öğretmen Portalı'
      }
    },
    days: ['Cumartesi', 'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
  }
};

export function useTranslation() {
  return translations;
}
