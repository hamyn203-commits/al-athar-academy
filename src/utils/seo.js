export const generateMetaTags = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}) => {
  const defaultImage = '/images/hero-reference-prompt10.png';
  const defaultUrl = 'https://wahy-wa-namaa-academy.vercel.app';
  
  return {
    title: `${title} | أكاديمية وَحْيٌ وَنَمَاء`,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'أكاديمية وَحْيٌ وَنَمَاء | WAHY WA NAMAA' },
      { name: 'robots', content: 'index, follow' },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image || defaultImage },
      { property: 'og:url', content: url || defaultUrl },
      { property: 'og:type', content: type },
      { property: 'og:locale', content: 'ar_EG' },
      { property: 'og:site_name', content: 'أكاديمية وَحْيٌ وَنَمَاء' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image || defaultImage },
      
      // Arabic specific
      { name: 'language', content: 'Arabic' },
      { name: 'revisit-after', content: '7 days' },
    ]
  };
};

export const generateStructuredData = ({
  type,
  data
}) => {
  const schemas = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'أكاديمية وَحْيٌ وَنَمَاء',
      url: 'https://wahy-wa-namaa-academy.vercel.app',
      logo: 'https://wahy-wa-namaa-academy.vercel.app/favicon.svg',
      description: 'أكاديمية رقمية لتعلّم القرآن الكريم والحفظ والتجويد عبر برامج ومسارات تعليمية.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG'
      }
    },
    teacher: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name,
      image: data.image,
      jobTitle: 'معلم قرآن كريم',
      worksFor: {
        '@type': 'EducationalOrganization',
        name: 'أكاديمية وَحْيٌ وَنَمَاء'
      },
      description: data.bio,
      knowsAbout: ['القرآن الكريم', 'التجويد', 'الحفظ'],
      hasCredential: data.certificates,
      aggregateRating: data.rating ? {
        '@type': 'AggregateRating',
        ratingValue: data.rating.average,
        reviewCount: data.rating.count
      } : undefined
    },
    course: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: data.name,
      description: data.description,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'أكاديمية وَحْيٌ وَنَمَاء',
        url: 'https://wahy-wa-namaa-academy.vercel.app'
      },
      educationalLevel: data.level,
      inLanguage: 'ar',
      courseMode: 'online',
      offers: {
        '@type': 'Offer',
        price: data.price || '50',
        priceCurrency: 'EGP'
      }
    },
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    }
  };
  
  return schemas[type] || {};
};

export const pageMeta = {
  home: {
    title: 'الرئيسية',
    description: 'أكاديمية وَحْيٌ وَنَمَاء — نتعلم القرآن، نحفظه، وننمو به. منصة رقمية للتعلم والحفظ والتجويد.',
    keywords: 'وحي ونماء, تعليم القرآن, تحفيظ القرآن, تجويد, إجازة, لغة عربية, تعليم عن بعد, معلم قرآن'
  },
  teachers: {
    title: 'المعلمون',
    description: 'استعرض ملفات المعلمين المنشورة واختر المعلم الأنسب لهدفك ومستواك في أكاديمية وَحْيٌ وَنَمَاء',
    keywords: 'معلم قرآن, معلم تجويد, معلم مجاز, سند متصل, اختيار معلم'
  },
  teacherProfile: (name) => ({
    title: `الملف الشخصي - ${name}`,
    description: `تعرف على ${name} وملفه التعليمي في أكاديمية وَحْيٌ وَنَمَاء`,
    keywords: `${name}, معلم قرآن, ملف شخصي, سيرة ذاتية`
  }),
  register: {
    title: 'تسجيل معلم جديد',
    description: 'انضم لفريق معلمي أكاديمية وَحْيٌ وَنَمَاء وشارك في رسالة تعليم كتاب الله',
    keywords: 'تسجيل معلم, انضم كمعلم, تعليم قرآن'
  },
  studentDashboard: {
    title: 'لوحة تحكم الطالب',
    description: 'إدارة حصصك وواجباتك وتقييماتك في أكاديمية وَحْيٌ وَنَمَاء',
    keywords: 'لوحة الطالب, حصصي, واجباتي, تقييماتي'
  },
  teacherDashboard: {
    title: 'لوحة تحكم المعلم',
    description: 'إدارة طلابك وحصصك وجداولك في أكاديمية وَحْيٌ وَنَمَاء',
    keywords: 'لوحة المعلم, إدارة الطلاب, الحصص'
  }
};
