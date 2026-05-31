import { useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { hreflangLinks } from '../seo/brand';

export default function SEOHead({ page = {} }) {
  const { generateMetaTags, organizationSchema, websiteSchema } = useSEO();
  const meta = generateMetaTags(page);
  const path = page.url || '/';
  const alternates = hreflangLinks(path);

  useEffect(() => {
    document.title = meta.title;

    meta.meta.forEach((tag) => {
      let element;
      if (tag.rel) {
        element = document.querySelector(`link[rel="${tag.rel}"]${tag.hreflang ? `[hreflang="${tag.hreflang}"]` : ''}`);
        if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', tag.rel);
          if (tag.hreflang) element.setAttribute('hreflang', tag.hreflang);
          document.head.appendChild(element);
        }
        element.setAttribute('href', tag.href);
      } else if (tag.property) {
        element = document.querySelector(`meta[property="${tag.property}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', tag.property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', tag.content);
      } else if (tag.name) {
        element = document.querySelector(`meta[name="${tag.name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', tag.name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', tag.content);
      }
    });

    document.querySelectorAll('link[data-seo-hreflang]').forEach((el) => el.remove());
    alternates.forEach((link) => {
      const el = document.createElement('link');
      el.setAttribute('rel', link.rel);
      el.setAttribute('hreflang', link.hreflang);
      el.setAttribute('href', link.href);
      el.setAttribute('data-seo-hreflang', '1');
      document.head.appendChild(el);
    });

    document.querySelectorAll('script[data-seo-schema]').forEach((s) => s.remove());

    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-seo-schema', 'org');
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    const webScript = document.createElement('script');
    webScript.type = 'application/ld+json';
    webScript.setAttribute('data-seo-schema', 'web');
    webScript.textContent = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    if (page.schema) {
      const pageScript = document.createElement('script');
      pageScript.type = 'application/ld+json';
      pageScript.setAttribute('data-seo-schema', 'page');
      pageScript.textContent = JSON.stringify(page.schema);
      document.head.appendChild(pageScript);
    }
  }, [meta, organizationSchema, websiteSchema, page.schema, path]);

  return null;
}
