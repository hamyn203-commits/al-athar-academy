import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// دالة لإنشاء sitemap ديناميكي
function generateSitemap() {
  const baseUrl = 'https://al-athar-academy.vercel.app';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/teachers', priority: '0.9', changefreq: 'daily' },
    { url: '/courses', priority: '0.9', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/teacher/register', priority: '0.8', changefreq: 'monthly' },
    { url: '/student/register', priority: '0.8', changefreq: 'monthly' },
    { url: '/login', priority: '0.6', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  const languages = ['ar', 'en', 'fr', 'de', 'tr', 'ur', 'id', 'ms'];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  pages.forEach(page => {
    languages.forEach(lang => {
      sitemap += `  <url>
    <loc>${baseUrl}/${lang}${page.url === '/' ? '' : page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;
      
      // إضافة hreflang tags للروابط متعددة اللغات
      languages.forEach(altLang => {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}/${altLang}${page.url === '/' ? '' : page.url}" />\n`;
      });
      
      sitemap += `  </url>\n`;
    });
  });

  sitemap += `</urlset>`;
  
  return sitemap;
}

// Plugin لإنشاء sitemap أثناء البناء
const sitemapPlugin = {
  name: 'sitemap-generator',
  closeBundle() {
    const sitemap = generateSitemap();
    const distPath = resolve(__dirname, 'dist');
    writeFileSync(resolve(distPath, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully');
  }
};

export default defineConfig({
  plugins: [react(), sitemapPlugin],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
        }
      }
    }
  }
});
