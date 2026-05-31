import { useState, useEffect } from 'react';
import { BriefcaseBusiness, MapPin, CheckCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

export default function Careers() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '', experience: 0 });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get('/api/careers/jobs').then((d) => setJobs(d.jobs || [])).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    try {
      await api.post('/api/careers/apply', { ...form, position: selected, experience: Number(form.experience) });
      setDone(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead page={{ url: '/careers', title: isAr ? 'التوظيف | الأثر' : 'Careers | Al-Athar', description: isAr ? 'انضم لفريق أكاديمية الأثر' : 'Join Al-Athar Academy team' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <BriefcaseBusiness className="mx-auto text-blue-600 mb-4" size={48} />
            <h1 className="text-4xl font-bold mb-3">{isAr ? 'انضم إلينا' : 'Join Our Team'}</h1>
            <p className="text-gray-600">{isAr ? 'فرص عمل عن بُعد — معلمين ومترجمين ومشرفين' : 'Remote opportunities — teachers, translators, supervisors'}</p>
          </div>

          <div className="space-y-4 mb-10">
            {jobs.map((j) => (
              <button key={j.id} type="button" onClick={() => { setSelected(j.id); setDone(false); }}
                className={`w-full text-right p-6 rounded-2xl border-2 transition ${selected === j.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                <h3 className="font-bold text-lg">{isAr ? j.title.ar : j.title.en}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {j.type === 'remote' ? (isAr ? 'عن بُعد' : 'Remote') : j.type}</p>
                <ul className="mt-3 text-sm text-gray-600 space-y-1">
                  {(isAr ? j.requirements.ar : j.requirements.en).map((r) => <li key={r}>• {r}</li>)}
                </ul>
              </button>
            ))}
          </div>

          {selected && !done && (
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
              <h2 className="font-bold text-xl mb-2">{isAr ? 'قدّم طلبك' : 'Apply Now'}</h2>
              <input required placeholder={isAr ? 'الاسم' : 'Name'} className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder={isAr ? 'البريد' : 'Email'} className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required placeholder={isAr ? 'الهاتف' : 'Phone'} className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input type="number" min={0} placeholder={isAr ? 'سنوات الخبرة' : 'Years of experience'} className="input-field" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              <textarea required placeholder={isAr ? 'رسالة التقديم' : 'Cover letter'} className="input-field min-h-[120px]" value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading ? '...' : isAr ? 'إرسال الطلب' : 'Submit Application'}</button>
            </form>
          )}

          {done && (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <CheckCircle className="mx-auto text-emerald-600 mb-4" size={56} />
              <h2 className="text-2xl font-bold">{isAr ? 'تم استلام طلبك!' : 'Application received!'}</h2>
            </div>
          )}
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
