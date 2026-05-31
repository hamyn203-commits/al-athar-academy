import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>أكاديمية الأثر الطيب — V2</h1>
      <p>Next.js scaffold — يعمل جنب V1 (React/Vite) أثناء الهجرة التدريجية.</p>
      <ul>
        <li><Link href="/courses">الدورات (TODO)</Link></li>
        <li><a href={process.env.NEXT_PUBLIC_V1_URL || 'http://localhost:5173'}>العودة لـ V1</a></li>
      </ul>
    </main>
  );
}
