import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>وَحْيٌ وَنَمَاء — V2 تجريبي</h1>
      <p>هذا Scaffold تجريبي ومجمّد حاليًا. النسخة الإنتاجية هي React/Vite + Express.</p>
      <ul>
        <li><Link href="/courses">استكشاف واجهة V2 التجريبية</Link></li>
        <li><a href={process.env.NEXT_PUBLIC_V1_URL || 'http://localhost:5173'}>العودة لـ V1</a></li>
      </ul>
    </main>
  );
}
