export const generateMetaTags = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}) => {
  const defaultImage = '/og-image.jpg';
  const defaultUrl = 'https://al-athar-academy.vercel.app';
  
  return {
    title: `${title} | أكاديمية الأثر الطيب`,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'أكاديمية الأثر الطيب' },
      { name: 'robots', content: 'index, follow' },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image || defaultImage },
      { property: 'og:url', content: url || defaultUrl },
      { property: 'og:type', content: type },
      { property: 'og:locale', content: 'ar_EG' },
      { property: 'og:site_name', content: 'أكاديمية الأثر الطيب' },
      
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
      name: 'أكاديمية الأثر الطيب',
      url: 'https://al-athar-academy.vercel.app',
      logo: 'https://al-athar-academy.vercel.app/logo.png',
      description: 'منصة تعليم القرآن الكريم واللغة العربية عبر الإنترنت',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG'
      },
      sameAs: [
        'https://www.facebook.com/alatharacademy',
        'https://www.twitter.com/alatharacademy',
        'https://www.instagram.com/alatharacademy'
      ]
    },
    teacher: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name,
      image: data.image,
      jobTitle: 'معلم قرآن كريم',
      worksFor: {
        '@type': 'EducationalOrganization',
        name: 'أكاديمية الأثر الطيب'
      },
      description: data.bio,
      knowsAbout: ['القرآن الكريم', 'التجويد', 'الحفظ', 'الإجازة'],
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
        name: 'أكاديمية الأثر الطيب',
        url: 'https://al-athar-academy.vercel.app'
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
    description: 'أكاديمية الأثر الطيب - منصة تعليم القرآن الكريم واللغة العربية عبر الإنترنت مع أفضل المعلمين المجازين',
    keywords: 'تعليم القرآن, تحفيظ القرآن, تجويد, إجازة, لغة عربية, تعليم عن بعد, معلم قرآن'
  },
  teachers: {
    title: 'المعلمون',
    description: 'اختر معلمك من نخبة من أفضل المعلمين المجازين في تعليم القرآن الكريم والتجويد',
    keywords: 'معلم قرآن, معلم تجويد, معلم مجاز, أفضل معلم, اختيار معلم'
  },
  teacherProfile: (name) => ({
    title: `الملف الشخصي - ${name}`,
    description: `تعرف على ${name} - معلم قرآن كريم مجاز في أكاديمية الأثر الطيب`,
    keywords: `${name}, معلم قرآن, ملف شخصي, سيرة ذاتية`
  }),
  register: {
    title: 'تسجيل معلم جديد',
    description: 'انضم لفريق معلمي أكاديمية الأثر الطيب وابدأ رحلتك في تعليم القرآن الكريم',
    keywords: 'تسجيل معلم, انضم كمعلم, عمل معلم قرآن'
  },
  studentDashboard: {
    title: 'لوحة تحكم الطالب',
    description: 'إدارة حصصك وواجباتك وتقييماتك في أكاديمية الأثر الطيب',
    keywords: 'لوحة الطالب, حصصي, واجباتي, تقييماتي'
  },
  teacherDashboard: {
    title: 'لوحة تحكم المعلم',
    description: 'إدارة طلابك وحصصك وأرباحك في أكاديمية الأثر الطيب',
    keywords: 'لوحة المعلم, إدارة الطلاب, الأرباح, الحصص'
  }
};
