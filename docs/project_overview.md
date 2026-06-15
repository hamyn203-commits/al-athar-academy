# 📚 أكاديمية الأثر الطيب — الدليل الشامل للمشروع

> **الإصدار:** v6.3.0 | **تاريخ التوثيق:** 15 يونيو 2026
> **الرابط:** [al-athar-academy.vercel.app](https://al-athar-academy.vercel.app)
> **API:** [al-athar-api.azurewebsites.net](https://al-athar-api.azurewebsites.net)

---

## 1. 🎯 الفكرة والرسالة

**أكاديمية الأثر الطيب** منصة تعليمية إسلامية عالمية لتعليم **القرآن الكريم والعلوم الإسلامية** عبر الإنترنت، تجمع بين:

- **الأصالة العلمية:** معلمون مجازون من الأزهر الشريف بسند متصل إلى النبي ﷺ
- **التقنية الحديثة:** ذكاء اصطناعي لتحليل التلاوة + جلسات مباشرة + نظام LMS متكامل
- **الوصول العالمي:** 9 لغات، إشعار جغرافي تلقائي، أسعار ملائمة لكل سوق

### الشعار
> **"أثر يساوي حياة"**

### الجمهور المستهدف
| السوق | المناطق |
|-------|---------|
| العالم العربي | مصر، السعودية، الإمارات، الكويت... |
| جنوب شرق آسيا | إندونيسيا، ماليزيا |
| أوروبا وأمريكا | الجاليات المسلمة |
| جنوب آسيا | باكستان، بنغلاديش |
| تركيا وكردستان | تركيا، العراق، إيران |

---

## 2. 🏗️ البنية التقنية الكاملة

### 2.1 المنظومة الكلية (Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend)                        │
│   React 19 + Vite 8 + TailwindCSS 4 + React Router 7       │
│   https://al-athar-academy.vercel.app                        │
│                          │ /api/* proxy                      │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               AZURE APP SERVICE (Backend)                    │
│   Node.js + Express 5 + MongoDB + LiveKit                   │
│   https://al-athar-api.azurewebsites.net                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │ MongoDB  │    │  Azure   │    │   LiveKit    │
    │ (Cloud)  │    │  Blob    │    │ (Video Live) │
    └──────────┘    │ Storage  │    └──────────────┘
                    └──────────┘
```

### 2.2 مكدس التقنيات التفصيلي

#### Frontend (الواجهة الأمامية)
| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| **React** | 19.2.6 | إطار العمل الأساسي |
| **Vite** | 8.0.12 | بناء وتطوير سريع |
| **React Router DOM** | 7.16.0 | التنقل والـ routing |
| **TailwindCSS** | 4.3.0 | نظام CSS المساعد |
| **Framer Motion** | 12.40 | الحركات والانتقالات |
| **Recharts** | 3.8 | مخططات الإحصاءات |
| **Lucide React** | 1.17.0 | أيقونات |
| **LiveKit Client** | 2.19 | جلسات الفيديو المباشرة |
| **jsPDF** | 4.2 | إنشاء شهادات PDF |
| **Zod** | 4.4.3 | التحقق من صحة البيانات |

#### Backend (الخادم)
| التقنية | الغرض |
|---------|-------|
| **Node.js + Express 5** | الخادم والـ API |
| **MongoDB + Mongoose 6** | قاعدة البيانات |
| **JWT (jsonwebtoken)** | المصادقة والتفويض |
| **Bcryptjs** | تشفير كلمات المرور |
| **Helmet** | حماية HTTP headers |
| **Express Rate Limit** | حماية من DDoS |
| **express-mongo-sanitize** | حماية من NoSQL injection |
| **Morgan** | تسجيل الطلبات |
| **Multer** | رفع الملفات |
| **LiveKit Server SDK** | إدارة غرف الفيديو |
| **QRCode** | توليد QR للشهادات |
| **Azure Storage Blob** | تخزين الملفات والصور |

---

## 3. 📁 هيكل الملفات الكامل

```
اكادمية الاثر الطيب/
├── 📂 src/                          ← الواجهة الأمامية
│   ├── 📂 pages/                    ← 43 صفحة
│   ├── 📂 components/               ← مكونات مشتركة
│   │   ├── 📂 shared/               ← 13 مكون مشترك
│   │   ├── 📂 games/                ← ألعاب تعليمية
│   │   ├── 📂 lms/                  ← مكونات نظام LMS
│   │   ├── GlobalHeader.jsx
│   │   ├── GlobalFooter.jsx
│   │   ├── BrandLogo.jsx
│   │   ├── LazyImage.jsx
│   │   ├── SEOHead.jsx
│   │   └── LocalizedLink.jsx
│   ├── 📂 context/                  ← 3 providers
│   │   ├── AppProvider.jsx
│   │   ├── MarketProvider.jsx
│   │   └── ToastProvider.jsx
│   ├── 📂 hooks/                    ← 9 custom hooks
│   ├── 📂 i18n/                     ← 9 ملفات لغات
│   ├── 📂 styles/
│   │   └── brand.css                ← نظام التصميم
│   ├── 📂 seo/
│   │   └── brand.js                 ← بيانات SEO
│   ├── 📂 lib/                      ← مكتبات مساعدة
│   ├── 📂 utils/                    ← أدوات مساعدة
│   ├── 📂 data/                     ← بيانات ثابتة
│   ├── 📂 config/                   ← إعدادات
│   ├── index.css                    ← CSS عالمي
│   ├── App.jsx                      ← التطبيق الرئيسي
│   └── main.jsx                     ← نقطة الدخول
├── 📂 backend/                      ← الخادم
│   ├── 📂 routes/                   ← 35 مسار API
│   ├── 📂 models/                   ← 30 نموذج MongoDB
│   ├── 📂 middleware/               ← وسطاء
│   ├── 📂 uploads/                  ← ملفات مرفوعة
│   └── server.js
├── vercel.json                       ← إعداد النشر
├── vite.config.js
└── package.json                      ← v6.3.0
```

---

## 4. 📄 الصفحات الـ 43 — تفصيل كامل

### 🌐 الصفحات العامة (Public)
| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **NewLandingPage** | `/` | الصفحة الرئيسية الجديدة (12 قسم) |
| **LandingPage** | `/landing` | النسخة القديمة (احتياط) |
| **Teachers** | `/teachers` | قائمة المعلمين مع فلاتر وبحث |
| **TeacherProfile** | `/teachers/:id` | ملف المعلم + التقييمات + الحجز |
| **Courses** | `/courses` | دليل الدورات |
| **CourseDetail** | `/courses/:slug` | تفاصيل الدورة |
| **Blog** | `/blog` | المقالات الإسلامية |
| **BlogDetail** | `/blog/:slug` | تفاصيل المقال |
| **Programs** | `/programs` | البرامج الدراسية |
| **About** | `/about` | عن الأكاديمية |
| **Contact** | `/contact` | تواصل معنا |
| **FAQ** | `/faq` | الأسئلة الشائعة |
| **Library** | `/library` | المكتبة الصوتية والمرئية |
| **Donate** | `/donate` | التبرع |
| **Careers** | `/careers` | فرص العمل |
| **Women** | `/women` | برنامج خاص للمعلمات |
| **GlobalPlatform** | `/global` | استعراض الانتشار العالمي |
| **Markets** | `/markets` | الأسواق والأسعار |
| **Privacy** | `/privacy` | سياسة الخصوصية |
| **Terms** | `/terms` | شروط الاستخدام |

### 🔐 صفحات المصادقة
| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **Login** | `/login` | تسجيل الدخول |
| **Register** | `/register` | إنشاء حساب جديد |
| **ForgotPassword** | `/forgot-password` | استعادة كلمة المرور |
| **SetupAdmin** | `/setup-admin` | إعداد أول مدير |
| **TeacherRegistration** | `/register/teacher` | تسجيل المعلمين |

### 🎓 لوحات التحكم
| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **StudentDashboard** | `/student/dashboard` | لوحة تحكم الطالب الجديدة |
| **StudentPortal** | `/student` | البوابة القديمة (legacy) |
| **TeacherDashboard** | `/teacher/dashboard` | لوحة تحكم المعلم |
| **TeacherPortal** | `/teacher` | البوابة القديمة |
| **AdminDashboard** | `/admin` | لوحة تحكم المدير |
| **GuardianDashboard** | `/guardian` | لوحة ولي الأمر |
| **Settings** | `/settings` | إعدادات الحساب |
| **Notifications** | `/notifications` | الإشعارات |

### 📚 ميزات التعلم
| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **CourseLearn** | `/courses/:slug/learn` | واجهة تعلم الدورة |
| **BookSession** | `/book-trial/:teacherId` | حجز جلسة تجريبية |
| **LiveSessions** | `/live` | قائمة جلسات البث |
| **LiveRoom** | `/live/:roomId` | غرفة الفيديو المباشر |
| **Meeting** | `/meeting/:id` | اجتماع (Jitsi/Zoom) |
| **AIHub** | `/ai` | مركز الذكاء الاصطناعي |
| **Certificate** | `/certificate/:id` | عرض وتحميل الشهادة |
| **Leaderboard** | `/leaderboard` | المتصدرون |

### 📱 صفحات أخرى
| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **Mobile** | `/mobile` | صفحة التطبيق المحمول |
| **NotFound** | `*` | صفحة 404 |

---

## 5. 🔌 الـ API — 35 مسار

### مجموعات الـ API

```
/api/auth          → تسجيل / دخول / تجديد token / استعادة كلمة المرور
/api/auth          → التحقق من البريد الإلكتروني (OTP)
/api/students      → إدارة بيانات الطلاب
/api/students/dashboard → لوحة بيانات الطالب
/api/teachers      → إدارة المعلمين + بحث + فلترة
/api/teachers/dashboard → لوحة بيانات المعلم
/api/sessions      → الجلسات (حجز، جدولة، إلغاء)
/api/sessions/:id/translate → ترجمة محادثات الجلسة
/api/courses       → الدورات (إنشاء، تعديل، نشر)
/api/lms           → نظام إدارة التعلم (دروس، اختبارات)
/api/live          → جلسات البث المباشر (LiveKit)
/api/meetings      → الاجتماعات (Jitsi/Zoom/Google Meet)
/api/assessments   → التقييمات والاختبارات
/api/assignments   → الواجبات المدرسية
/api/quizzes       → الاختبارات
/api/progress      → تتبع تقدم الطالب
/api/homework      → رفع وتقييم الواجبات
/api/certificates  → إصدار الشهادات + QR Code
/api/reviews       → التقييمات والمراجعات
/api/notifications → الإشعارات
/api/gamification  → نقاط + شارات + مستويات
/api/guardians     → حسابات أولياء الأمور
/api/ai            → الذكاء الاصطناعي (تحليل تلاوة، مساعد)
/api/audio         → معالجة الصوت وتسجيل التلاوة
/api/translate     → الترجمة الآلية
/api/blog          → إدارة المقالات
/api/contact       → رسائل التواصل
/api/markets       → بيانات الأسواق والأسعار
/api/referrals     → نظام الإحالات
/api/donations     → التبرعات
/api/videos        → إدارة الفيديوهات (Azure Blob)
/api/careers       → طلبات التوظيف
/api/women         → برنامج المعلمات
/api/admin         → لوحة التحكم الإدارية
/api/admin/growth  → تحليلات النمو
/api/setup         → إعداد النظام لأول مرة
/api/system        → حالة النظام
/api/health        → فحص صحة الـ API
```

---

## 6. 🗄️ قواعد البيانات — 30 نموذج MongoDB

### نماذج المستخدمين
```
User.js           → الحساب الأساسي (email, password, role, JWT)
Student.js        → بيانات الطالب الإضافية
Teacher.js        → ملف المعلم (sanad, ijazah, subjects, availability)
Guardian.js       → ولي الأمر وربطه بالطلاب
VerificationCode.js → رموز التحقق (OTP)
```

### نماذج التعليم
```
Course.js         → الدورة (title, lessons, price, level, language)
Lesson.js         → الدرس (video, text, quiz, order)
Enrollment.js     → تسجيل الطالب في الدورة
Session.js        → الجلسة (teacher, student, time, status, recording)
LiveSession.js    → الجلسة المباشرة (LiveKit roomId)
Assessment.js     → تقييم الأداء
Assignment.js     → الواجب (deadline, attachment, grade)
HomeworkSubmission.js → رفع الواجب
Quiz.js           → اختبار (questions, options, correct answers)
Progress.js       → تقدم الطالب في الدورة
RecitationReport.js → تقرير تحليل التلاوة بالـ AI
Certificate.js    → الشهادة (QR, signature, template)
```

### نماذج التفاعل
```
Review.js         → التقييم والتعليق (stars, text, verified)
Notification.js   → الإشعار (type, recipient, isRead, action)
SessionChatMessage.js → رسائل الدردشة أثناء الجلسة
VideoAsset.js     → أصول الفيديو (Azure Blob URL, metadata)
```

### نماذج الميزات
```
Gamification.js   → النقاط، المستويات، الشارات، العادات اليومية
Referral.js       → رمز الإحالة
ReferralReward.js → مكافأة الإحالة
Blog.js           → مقال المدونة
ContactMessage.js → رسالة التواصل
Donation.js       → التبرع (amount, currency, status)
JobApplication.js → طلب التوظيف
TeacherTask.js    → مهمة المعلم
WithdrawRequest.js → طلب سحب الأرباح
```

---

## 7. 🌍 نظام اللغات والأسواق

### اللغات المدعومة (9 لغات)
| الكود | اللغة | الاتجاه | السوق |
|-------|-------|---------|-------|
| `ar` | العربية | RTL ← | عموم العالم العربي |
| `en` | الإنجليزية | LTR → | أوروبا، أمريكا، أستراليا |
| `fr` | الفرنسية | LTR → | فرنسا، المغرب العربي |
| `de` | الألمانية | LTR → | ألمانيا، النمسا |
| `tr` | التركية | LTR → | تركيا |
| `ur` | الأردية | RTL ← | باكستان |
| `id` | الإندونيسية | LTR → | إندونيسيا |
| `ms` | الماليزية | LTR → | ماليزيا |
| `ku` | الكردية | RTL ← | كردستان |

### الكشف التلقائي للموقع الجغرافي
```js
// في MarketProvider.jsx
1. يفحص localStorage أولاً
2. يحاول FreeIPAPI لمعرفة الدولة
3. يحدد السوق المناسب تلقائياً
4. يضبط العملة والأسعار
5. يعرض اللغة المناسبة
```

### الأسواق وأنظمة الأسعار
- كل سوق له عملته الخاصة وسعر تحويل
- الأسعار تتكيف ديناميكياً حسب البلد
- يمكن تجاوز السوق يدوياً عبر `?mock_country=ID`

---

## 8. 🔒 نظام المصادقة والأمان

### آلية المصادقة (JWT Dual Token)
```
تسجيل الدخول → يحصل على:
  ├── accessToken  (قصير الأجل — لكل طلب API)
  └── refreshToken (طويل الأجل — لتجديد الـ access)

عند انتهاء accessToken:
  → إرسال refreshToken إلى /api/auth/refresh
  → الحصول على tokens جديدة تلقائياً
  → فشل التجديد → تسجيل خروج تلقائي
```

### طبقات الحماية
| الطبقة | التقنية | الوصف |
|--------|---------|-------|
| **HTTPS** | Vercel + Azure | تشفير كل الاتصالات |
| **Helmet** | HTTP Headers | حماية headers و CSP |
| **Rate Limiting** | express-rate-limit | 100 طلب/15 دقيقة عام، 5 تسجيل دخول |
| **CORS** | Whitelist | أصول محددة فقط |
| **NoSQL Injection** | mongo-sanitize | تعقيم كل المدخلات |
| **JWT Verification** | Middleware | التحقق من كل طلب محمي |
| **Password Hashing** | bcryptjs | تشفير لا عكسي |
| **Validation** | Zod | التحقق من صحة البيانات |

### الأدوار (Roles)
```
student   → طالب
teacher   → معلم
admin     → مدير
guardian  → ولي أمر
```

---

## 9. 🎮 نظام التلاعب (Gamification)

### المستويات
```
مبتدئ  → 0   نقطة
باحث   → 100  نقطة
قارئ   → 500  نقطة
متقن   → 1000 نقطة
```

### العادات اليومية
- ✅ الأذكار (adhkar)
- ✅ الورد اليومي (werd)
- ✅ المراجعة (murajaah)

### الشارات
- شارات الحضور المتواصل (streak)
- شارات إتمام الدورات
- شارات التقدم في الحفظ

### لوحة المتصدرين
- `/leaderboard` → ترتيب الطلاب بالنقاط
- تُحدّث كل 24 ساعة

---

## 10. 🤖 الذكاء الاصطناعي (AI Hub)

### الميزات المتاحة

| الميزة | الوصف | API المستخدم |
|--------|-------|-------------|
| **تحليل التلاوة** | تحليل صوت الطالب وتقييم التجويد والمخارج | AWS Bedrock / OpenAI / Gemini |
| **مساعد القرآن** | إجابة أسئلة التفسير والتجويد | LLM |
| **خطة الحفظ** | جدول يومي مخصص (سباق/سبق/منزل) | خوارزمية ذكية |
| **تصحيح الأخطاء** | تحديد الأخطاء في التلاوة بدقة | معالجة صوت |
| **الترجمة الفورية** | ترجمة محادثات الجلسات | /api/translate |

### مزودو الـ AI (حسب الأولوية)
```
1. AWS Bedrock (BEARER TOKEN) ← الأساسي
2. Gemini API                 ← احتياطي
3. OpenAI API                 ← احتياطي ثانٍ
```

---

## 11. 📹 الجلسات المباشرة (Live System)

### نوعان من الاجتماعات

#### LiveKit (المتقدم)
- غرف فيديو عالية الجودة
- يتطلب `LIVEKIT_API_KEY` و `LIVEKIT_API_SECRET`
- تسجيل الجلسات
- دعم حتى 50 مشارك

#### Jitsi/Zoom/Google Meet (البديل)
- عبر `/api/meetings`
- يعمل بدون إعداد مسبق
- مجاني وسريع

### سير العمل
```
المعلم ينشئ جلسة → يحصل على رابط → يشاركه مع الطالب
→ الطالب ينضم → جلسة مباشرة بالفيديو والصوت
→ التقييم + الواجبات + التقارير بعد الجلسة
```

---

## 12. 🏆 نظام LMS (نظام إدارة التعلم)

### مسار التعلم
```
الدورة (Course)
  └── الوحدات (Modules)
        └── الدروس (Lessons)
              ├── فيديو (VideoLesson)
              ├── نص (TextLesson)
              └── اختبار (QuizLesson)
```

### الميزات
- **تتبع التقدم** (Progress tracking)
- **الواجبات** مع رفع ملفات
- **الشهادات التلقائية** عند إتمام الدورة
- **QR Code** للتحقق من الشهادة
- **تقييمات الطلاب** للمعلم

---

## 13. 📢 نظام الإشعارات والتواصل

### قنوات الإشعار
| القناة | المتطلبات | الاستخدام |
|--------|-----------|-----------|
| **داخل التطبيق** | دائماً متاح | كل الأحداث |
| **البريد الإلكتروني** | RESEND_API_KEY | تأكيد الحجوزات، الشهادات |
| **تيليجرام** | TELEGRAM_BOT_TOKEN | إشعارات المدير |
| **واتساب** | TWILIO | إشعارات الطلاب المهمة |

### أنواع الإشعارات
- تأكيد الجلسة
- تذكير قبل الجلسة
- اكتمال الدورة
- تقييم جديد
- واجب جديد
- شارة جديدة

---

## 14. 💰 نظام الأسعار والمدفوعات

### هيكل الأسعار
- أسعار للجلسات الفردية (بالساعة)
- أسعار الاشتراك الشهري
- أسعار الدورات (one-time)
- خصومات حسب السوق الجغرافي

### المدفوعات (CheckoutMock)
- حالياً: mock/تجريبي
- مدفوعات بطاقة (PayPal / Stripe جاهز للتكامل)
- نظام تبرع مستقل (`/api/donations`)

### نظام الإحالات
- كود إحالة فريد لكل مستخدم
- مكافأة عند اشتراك محال

---

## 15. 🎨 نظام التصميم "الأزهري الفاخر"

### الهوية البصرية
- **الألوان الرئيسية:** ذهبي `#d4a843` + أخضر أزهري `#166534` + كحلي `#0a1628`
- **الخطوط:** Cairo + Noto Naskh + Amiri + Scheherazade
- **الأنماط:** نجوم إسلامية ثمانية + زخارف عربية (SVG)
- **التأثيرات:** glassmorphism + gold shimmer + scroll reveal

### الوضع الليلي (Dark Mode)
- يعمل عبر `data-theme="dark"` على `<html>`
- يُحفظ في localStorage
- يكشف تفضيلات النظام تلقائياً

### Skeleton Loading
7 أنواع: `Skeleton`, `SkeletonText`, `SkeletonAvatar`, `SkeletonCard`, `SkeletonTable`, `SkeletonList`, `SkeletonDashboard`

---

## 16. 🚀 النشر والبنية التحتية

### Frontend → Vercel
```
Branch: main → Auto deploy
Domain: al-athar-academy.vercel.app
CDN: Vercel Edge Network
Cache: /assets/* → 1 سنة (immutable)
/api/* → Proxy إلى Azure
```

### Backend → Azure App Service
```
URL: al-athar-api.azurewebsites.net
Runtime: Node.js
Database: MongoDB Atlas (Cloud)
Storage: Azure Blob Storage
```

### متغيرات البيئة الجوهرية
```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# AI
OPENAI_API_KEY=...
GEMINI_API_KEY=...
AWS_BEARER_TOKEN_BEDROCK=...

# Email
RESEND_API_KEY=...

# Notifications
TELEGRAM_BOT_TOKEN=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Video
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# Storage
AZURE_STORAGE_CONNECTION_STRING=...

# SEO
SUBMIT_INDEXNOW=true/false
```

---

## 17. 📊 إحصاءات المشروع

| المقياس | القيمة |
|---------|--------|
| **إجمالي الصفحات** | 43 صفحة |
| **مسارات API** | 35 مسار |
| **نماذج MongoDB** | 30 نموذج |
| **Custom Hooks** | 9 hooks |
| **Context Providers** | 3 providers |
| **اللغات** | 9 لغات |
| **الأسواق** | 5+ أسواق |
| **إصدار الكود** | v6.3.0 |
| **API Backend** | v6.2.0 |

---

## 18. 🔄 دورة تطوير الميزات

```
1. الفكرة
    ↓
2. تصميم الـ API (routes + models)
    ↓
3. Backend implementation (Express + MongoDB)
    ↓
4. Frontend (React components + pages)
    ↓
5. i18n (ترجمة 9 لغات)
    ↓
6. Design polish (Azhari Luxurious theme)
    ↓
7. Testing + ESLint
    ↓
8. Deploy (Vercel + Azure)
```

---

## 19. ⚠️ النقاط التي تحتاج تطوير

| الأولوية | الميزة | الحالة |
|---------|--------|--------|
| 🔴 عاجل | بوابة دفع حقيقية (Stripe/PayPal) | mock فقط |
| 🔴 عاجل | تطبيق جوال (React Native/Flutter) | صفحة تسويقية فقط |
| 🟠 متوسط | تسجيل الجلسات المباشرة | جاهز في LiveKit |
| 🟠 متوسط | ربط Zoom/Google Meet الحقيقي | Jitsi فقط الآن |
| 🟡 تحسين | اختبارات Jest/Vitest | لا توجد اختبارات |
| 🟡 تحسين | PWA (Progressive Web App) | غير مفعّل |
| 🟡 تحسين | Dashboard تحليلات متقدمة | أساسي الآن |

---

## 20. 📞 نقاط التواصل والدعم

### داخل المنصة
- نموذج تواصل: `/contact`
- واتساب مباشر: من الـ footer
- تيليجرام: إشعارات للمدير

### وسائل التواصل الاجتماعي
- من `GlobalFooter` → أيقونات سوشيال

---

*📝 تم إعداد هذا الدليل بواسطة Antigravity — 15 يونيو 2026*
*🔄 يُحدَّث هذا الملف مع كل تغيير رئيسي في المشروع*
