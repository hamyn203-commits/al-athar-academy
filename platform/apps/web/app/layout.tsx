export const metadata = {
  title: 'أكاديمية الأثر الطيب | V2',
  description: 'منصة تعليم القرآن — Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>{children}</body>
    </html>
  );
}
