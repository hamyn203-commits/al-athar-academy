import { useI18n } from '../i18n';

// Schema.org structured data generator
export function useSEO() {
  const { locale, t } = useI18n();
  const baseUrl = 'https://al-athar-academy.vercel.app';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: t.common.appName,
    alternateName: 'Al-Athar Academy',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: t.hero.subtitle,
    foundingDate: '2024',
    slogan: t.hero.title,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Cairo'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+20-123-456-7890',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English', 'French', 'German', 'Turkish', 'Urdu', 'Indonesian', 'Malay']
    },
    sameAs: [
      'https://www.facebook.com/alatharacademy',
      'https://www.twitter.com/alatharacademy',
      'https://www.instagram.com/alatharacademy',
      'https://www.youtube.com/@alatharacademy',
      'https://www.linkedin.com/company/alatharacademy'
    ]
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t.common.appName,
    url: baseUrl,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/teachers?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // BreadcrumbList Schema
  const createBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}/${locale}${item.url}`
    }))
  });

  // Course Schema
  const createCourseSchema = (course) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: t.common.appName,
      sameAs: baseUrl
    },
    educationalLevel: course.level,
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: course.instructor ? {
        '@type': 'Person',
        name: course.instructor.name
      } : undefined
    }
  });

  // Person Schema for Teachers
  const createTeacherSchema = (teacher) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    image: teacher.image,
    jobTitle: teacher.specialty,
    worksFor: {
      '@type': 'Organization',
      name: t.common.appName
    },
    description: teacher.bio,
    knowsLanguage: teacher.languages || ['Arabic'],
    hasCredential: teacher.certifications || [],
    aggregateRating: teacher.rating ? {
      '@type': 'AggregateRating',
      ratingValue: teacher.rating,
      reviewCount: teacher.reviewCount,
      bestRating: '5',
      worstRating: '1'
    } : undefined
  });

  // FAQ Schema
  const createFAQSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  });

  // Article Schema for Blog
  const createArticleSchema = (article) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: t.common.appName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${locale}/blog/${article.slug}`
    }
  });

  // Generate meta tags
  const generateMetaTags = (page = {}) => {
    const title = page.title ? `${page.title} | ${t.common.appName}` : `${t.common.appName} | ${t.hero.title}`;
    const description = page.description || t.hero.subtitle;
    const url = page.url ? `${baseUrl}/${locale}${page.url}` : `${baseUrl}/${locale}`;
    const image = page.image || `${baseUrl}/og-image.jpg`;

    return {
      title,
      meta: [
        { name: 'description', content: description },
        { name: 'keywords', content: page.keywords || 'quran, arabic, islamic, education, online learning' },
        
        // Open Graph
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { property: 'og:url', content: url },
        { property: 'og:type', content: page.type || 'website' },
        { property: 'og:locale', content: locale },
        { property: 'og:site_name', content: t.common.appName },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:site', content: '@alatharacademy' },
        
        // Additional SEO
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'language', content: locale },
        { name: 'revisit-after', content: '7 days' },
        { name: 'author', content: t.common.appName },
        
        // Canonical URL
        { rel: 'canonical', href: url }
      ]
    };
  };

  return {
    organizationSchema,
    websiteSchema,
    createBreadcrumbSchema,
    createCourseSchema,
    createTeacherSchema,
    createFAQSchema,
    createArticleSchema,
    generateMetaTags
  };
}
