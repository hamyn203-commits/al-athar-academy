import { useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';

export default function SEOHead({ page = {} }) {
  const { generateMetaTags, organizationSchema, websiteSchema } = useSEO();
  const meta = generateMetaTags(page);

  useEffect(() => {
    // Update document title
    document.title = meta.title;

    // Update meta tags
    meta.meta.forEach(tag => {
      let element;
      
      if (tag.rel) {
        // Handle link tags (canonical)
        element = document.querySelector(`link[rel="${tag.rel}"]`);
        if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', tag.rel);
          document.head.appendChild(element);
        }
        element.setAttribute('href', tag.href);
      } else if (tag.property) {
        // Handle Open Graph tags
        element = document.querySelector(`meta[property="${tag.property}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', tag.property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', tag.content);
      } else if (tag.name) {
        // Handle regular meta tags
        element = document.querySelector(`meta[name="${tag.name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', tag.name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', tag.content);
      }
    });

    // Add structured data
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(schema => schema.remove());

    // Add organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add website schema
    const webScript = document.createElement('script');
    webScript.type = 'application/ld+json';
    webScript.textContent = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    // Add page-specific schema if provided
    if (page.schema) {
      const pageScript = document.createElement('script');
      pageScript.type = 'application/ld+json';
      pageScript.textContent = JSON.stringify(page.schema);
      document.head.appendChild(pageScript);
    }
  }, [meta, organizationSchema, websiteSchema, page.schema]);

  return null;
}
