import { useI18n } from '../i18n';
import { SITE_URL, ALTERNATE_NAMES, ALTERNATE_SLOGANS, OG_LOCALE, SEO_LOCALES, localePath } from '../seo/brand';

export function useSEO() {
  const { locale, t } = useI18n();
  const baseUrl = SITE_URL;
  const c = t.common;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: c.appName,
    alternateName: ALTERNATE_NAMES,
    url: baseUrl,
    logo: `${baseUrl}/assets/logo.png`,
    image: `${baseUrl}/assets/og-image.png`,
    description: c.seoDescription || t.hero.subtitle,
    foundingDate: '2024',
    slogan: c.slogan,
    keywords: c.seoKeywords,
    inLanguage: SEO_LOCALES,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Cairo',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English', 'French', 'German', 'Turkish', 'Urdu', 'Indonesian', 'Malay', 'Kurdish'],
    },
    sameAs: [
      'https://www.facebook.com/alatharacademy',
      'https://www.twitter.com/alatharacademy',
      'https://www.instagram.com/alatharacademy',
      'https://www.youtube.com/@alatharacademy',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: c.appName,
    alternateName: ALTERNATE_NAMES.slice(0, 8),
    url: baseUrl,
    description: c.seoDescription,
    inLanguage: SEO_LOCALES,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/teachers?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const createBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}/${locale}${item.url}`,
    })),
  });

  const createCourseSchema = (course) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: { '@type': 'Organization', name: c.appName, sameAs: baseUrl },
    educationalLevel: course.level,
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  });

  const createTeacherSchema = (teacher) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    image: teacher.image,
    jobTitle: teacher.specialty,
    worksFor: { '@type': 'Organization', name: c.appName },
    description: teacher.bio,
  });

  const createFAQSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  });

  const createArticleSchema = (article) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: c.appName,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/assets/logo.png` },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
  });

  const generateMetaTags = (page = {}) => {
    const defaultTitle = `${c.appName} | ${c.slogan}`;
    const title = page.title ? `${page.title} | ${c.appName}` : defaultTitle;
    const description = page.description || c.seoDescription || t.hero.subtitle;
    const pagePath = page.url || '/';
    const url = localePath(locale, pagePath);
    const image = page.image || `${baseUrl}/assets/og-image.png`;
    const keywords = page.keywords || c.seoKeywords;

    const meta = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'application-name', content: c.appName },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: page.type || 'website' },
      { property: 'og:locale', content: OG_LOCALE[locale] || locale },
      { property: 'og:site_name', content: c.appName },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:site', content: '@alatharacademy' },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { name: 'language', content: locale },
      { name: 'author', content: c.appNameFull || c.appName },
      { rel: 'canonical', href: url },
    ];

    SEO_LOCALES.filter((l) => l !== locale).forEach((l) => {
      meta.push({ property: 'og:locale:alternate', content: OG_LOCALE[l] || l });
    });

    return { title, meta };
  };

  return {
    organizationSchema,
    websiteSchema,
    createBreadcrumbSchema,
    createCourseSchema,
    createTeacherSchema,
    createFAQSchema,
    createArticleSchema,
    generateMetaTags,
  };
}
