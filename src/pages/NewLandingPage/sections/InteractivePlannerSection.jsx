import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { useMarket } from '../../../context/MarketProvider';
import { CheckCircle2, Sparkles, Globe, Clock, ArrowLeft } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import { useReveal, GoldDivider } from './_shared';

export default function InteractivePlannerSection() {
  const ref = useReveal();
  const { locale } = useI18n();
  const { marketSlug } = useMarket();
  const isIndonesian = marketSlug === 'indonesia-malaysia';

  const [path, setPath] = useState('hifz');
  const [frequency, setFrequency] = useState(2);
  const [level, setLevel] = useState('beginner');
  const [studyMode, setStudyMode] = useState('private');

  const getDuration = () => {
    if (path === 'hifz') {
      if (frequency === 1) return locale === 'id' ? '4.5 Tahun' : locale === 'ar' ? '4.5 سنوات' : '4.5 Years';
      if (frequency === 2) return locale === 'id' ? '2.5 Tahun' : locale === 'ar' ? '2.5 سنة' : '2.5 Years';
      if (frequency === 3) return locale === 'id' ? '1.5 Tahun' : locale === 'ar' ? '1.5 سنة' : '1.5 Years';
      return locale === 'id' ? '10 Bulan' : locale === 'ar' ? '10 أشهر' : '10 Months';
    } else if (path === 'tajweed') {
      if (frequency === 1) return locale === 'id' ? '6 Bulan' : locale === 'ar' ? '6 أشهر' : '6 Months';
      if (frequency === 2) return locale === 'id' ? '4 Bulan' : locale === 'ar' ? '4 أشهر' : '4 Months';
      if (frequency === 3) return locale === 'id' ? '3 Bulan' : locale === 'ar' ? '3 أشهر' : '3 Months';
      return locale === 'id' ? '6 Minggu' : locale === 'ar' ? '6 أسابيع' : '6 Weeks';
    }
    if (frequency === 1) return locale === 'id' ? '1.5 Tahun' : locale === 'ar' ? '1.5 سنة' : '1.5 Years';
    if (frequency === 2) return locale === 'id' ? '9 Bulan' : locale === 'ar' ? '9 أشهر' : '9 Months';
    if (frequency === 3) return locale === 'id' ? '6 Bulan' : locale === 'ar' ? '6 أشهر' : '6 Months';
    return locale === 'id' ? '3 Bulan' : locale === 'ar' ? '3 أشهر' : '3 Months';
  };

  const getPrice = () => {
    if (isIndonesian) {
      if (studyMode === 'group') return { formatted: 'Rp 100.000', currency: 'IDR' };
      let rate = 450000;
      if (frequency === 1) rate = 250000;
      else if (frequency === 2) rate = 450000;
      else if (frequency === 3) rate = 600000;
      else if (frequency === 5) rate = 900000;
      return { formatted: `Rp ${rate.toLocaleString('id-ID')}`, currency: 'IDR' };
    }
    const monthlyHours = frequency * 4;
    return { usd: monthlyHours * 10, egp: monthlyHours * 50, currency: 'USD/EGP' };
  };

  const prices = getPrice();
  const duration = getDuration();

  const btnClass = (selected, current) =>
    `flex flex-col items-center justify-center p-4 rounded-xl border text-center transition ${
      selected === current
        ? 'border-[var(--athar-gold)] bg-[var(--athar-gold-50)] text-[var(--athar-gold-muted)] font-semibold shadow-sm'
        : 'border-[var(--athar-cream-dark)] hover:border-slate-300'
    }`;

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="planner">
      <div className="absolute inset-0 opacity-5 pointer-events-none geo-pattern" aria-hidden="true" />
      <div className="page-container relative">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="section-label mb-4">
            {locale === 'ar' ? 'مخطط الدراسة الذكي' : locale === 'id' ? 'Rencana Belajar Cerdas' : 'Smart Study Planner'}
          </span>
          <h2 className="section-heading mt-4">
            {locale === 'ar' ? 'احسب خطتك الدراسية المخصصة' : locale === 'id' ? 'Hitung Rencana Belajar Anda' : 'Calculate Your Custom Study Plan'}
          </h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">
            {locale === 'ar' ? 'حدد أهدافك وعدد الساعات لتصميم خطة تتناسب مع وقتك وميزانيتك' : locale === 'id' ? 'Tentukan tujuan dan jam belajar untuk merancang rencana yang sesuai' : 'Select your goals and hours to design a plan that fits your time and budget'}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 glass-card p-8 space-y-6">
            {isIndonesian && (
              <div>
                <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                  {locale === 'id' ? '1. Jenis Kelas:' : locale === 'ar' ? '1. نوع الدراسة:' : '1. Study Mode:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'private', label: locale === 'id' ? 'Kelas Privat (1-on-1)' : locale === 'ar' ? 'حصة فردية خاصة' : 'Private Class (1-on-1)', desc: locale === 'id' ? 'Guru Privat Al-Azhar' : locale === 'ar' ? 'معلم خاص أزهري' : 'Private Al-Azhar Tutor' },
                    { id: 'group', label: locale === 'id' ? 'Kelas Grup (Halaqah)' : locale === 'ar' ? 'حلقة جماعية اقتصادية' : 'Group Class (Halaqah)', desc: locale === 'id' ? 'Biaya Ekonomis (5-7 siswa)' : locale === 'ar' ? 'أقل سعر (5-7 طلاب)' : 'Economical (5-7 students)' }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setStudyMode(opt.id)} className={btnClass(studyMode, opt.id)}>
                      <span className="text-sm">{opt.label}</span>
                      <span className="text-[10px] text-[var(--athar-text-muted)] mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                {isIndonesian ? (locale === 'id' ? '2. Pilih Program Studi:' : locale === 'ar' ? '2. حدد المسار التعليمي:' : '2. Select Learning Path:') : (locale === 'id' ? '1. Pilih Program Studi:' : locale === 'ar' ? '1. حدد المسار التعليمي:' : '1. Select Learning Path:')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'hifz', label: locale === 'id' ? 'Hafalan & Tajwid' : locale === 'ar' ? 'حفظ القرآن وتجويده' : 'Quran Memorization', desc: locale === 'id' ? 'Dewasa & Anak-anak' : locale === 'ar' ? 'للكبار والصغار' : 'Adults & Kids' },
                  { id: 'tajweed', label: locale === 'id' ? 'Tajwid & Makhraj' : locale === 'ar' ? 'أحكام التجويد والنطق' : 'Tajweed & Makhraj', desc: locale === 'id' ? 'Perbaikan Pelafalan' : locale === 'ar' ? 'تصحيح ومخارج الحروف' : 'Recitation Correction' },
                  { id: 'arabic', label: locale === 'id' ? 'Bahasa Arab' : locale === 'ar' ? 'اللغة العربية الفصحى' : 'Arabic Language', desc: locale === 'id' ? 'Untuk Non-Arab' : locale === 'ar' ? 'لغير الناطقين بها' : 'For Non-Arabic Speakers' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => setPath(opt.id)} className={btnClass(path, opt.id)}>
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[10px] text-[var(--athar-text-muted)] mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                {isIndonesian ? (locale === 'id' ? '3. Tingkat Kemampuan:' : locale === 'ar' ? '3. المستوى الحالي للدارس:' : '3. Current Level:') : (locale === 'id' ? '2. Tingkat Kemampuan:' : locale === 'ar' ? '2. المستوى الحالي للدارس:' : '2. Current Level:')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: locale === 'id' ? 'Pemula' : locale === 'ar' ? 'مبتدئ' : 'Beginner', desc: locale === 'id' ? 'Belum bisa membaca' : locale === 'ar' ? 'لا يعرف القراءة' : 'Cannot read yet' },
                  { id: 'intermediate', label: locale === 'id' ? 'Menengah' : locale === 'ar' ? 'متوسط' : 'Intermediate', desc: locale === 'id' ? 'Bisa membaca & butuh perbaikan' : locale === 'ar' ? 'يقرأ ولكن يحتاج ضبطاً' : 'Can read but needs polish' },
                  { id: 'advanced', label: locale === 'id' ? 'Lanjutan' : locale === 'ar' ? 'متقدم' : 'Advanced', desc: locale === 'id' ? 'Hafal & mencari Sanad' : locale === 'ar' ? 'حافظ ويبحث عن السند' : 'Memorized & seeks Sanad' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => setLevel(opt.id)} className={btnClass(level, opt.id)}>
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[10px] text-[var(--athar-text-muted)] mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {(!isIndonesian || studyMode === 'private') ? (
              <div>
                <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                  {isIndonesian ? (locale === 'id' ? '4. Jumlah Jam Per Minggu:' : locale === 'ar' ? '4. عدد الساعات في الأسبوع:' : '4. Hours Per Week:') : (locale === 'id' ? '3. Jumlah Jam Per Minggu:' : locale === 'ar' ? '3. عدد الساعات في الأسبوع:' : '3. Hours Per Week:')}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 1, label: locale === 'id' ? '1 Jam' : locale === 'ar' ? 'ساعة واحدة' : '1 Hour', desc: locale === 'id' ? '1 sesi / minggu' : locale === 'ar' ? 'حصة / أسبوع' : '1 session / week' },
                    { id: 2, label: locale === 'id' ? '2 Jam' : locale === 'ar' ? 'ساعتان' : '2 Hours', desc: locale === 'id' ? '2 sesi / minggu' : locale === 'ar' ? '2 حصة / أسبوع' : '2 sessions / week' },
                    { id: 3, label: locale === 'id' ? '3 Jam' : locale === 'ar' ? '3 ساعات' : '3 Hours', desc: locale === 'id' ? '3 sesi / minggu' : locale === 'ar' ? '3 حصص / أسبوع' : '3 sessions / week' },
                    { id: 5, label: locale === 'id' ? '5 Jam' : locale === 'ar' ? '5 ساعات' : '5 Hours', desc: locale === 'id' ? '5 sesi / minggu' : locale === 'ar' ? '5 حصص / أسبوع' : '5 sessions / week' }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setFrequency(opt.id)} className={btnClass(frequency, opt.id)}>
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="text-[10px] text-[var(--athar-text-muted)] mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-[var(--athar-text)] mb-3">
                  {locale === 'id' ? '4. Jumlah Jam Per Minggu:' : locale === 'ar' ? '4. عدد الساعات في الأسبوع:' : '4. Hours Per Week:'}
                </label>
                <div className="p-4 rounded-xl border border-[var(--athar-gold)]/20 bg-[var(--athar-gold-50)] text-sm text-[var(--athar-gold-muted)] font-semibold flex items-center gap-2">
                  <Clock size={16} />
                  <span>{locale === 'id' ? '2 sesi per minggu (Jadwal kelas grup tetap)' : locale === 'ar' ? '2 حصة في الأسبوع (مجدولة جماعياً)' : '2 sessions per week (Fixed group schedule)'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border-2 border-[var(--athar-gold)]/30 bg-gradient-to-br from-white to-[var(--athar-gold-50)] p-8 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M60 0C26.863 0 0 26.863 0 60' fill='none' stroke='%23c9a227' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }} aria-hidden="true" />

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--athar-gold-100)] px-3 py-1 text-xs font-semibold text-[var(--athar-gold-muted)] mb-5">
                <Sparkles size={12} />
                {locale === 'ar' ? 'ملخص الخطة المقترحة' : locale === 'id' ? 'Ringkasan Rencana' : 'Plan Summary'}
              </span>
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'ar' ? 'المدة المتوقعة للختم / الإنجاز:' : locale === 'id' ? 'Estimasi Durasi Selesai:' : 'Estimated Duration:'}</p>
                  <p className="font-naskh text-3xl font-bold text-[var(--athar-text)] mt-1">
                    {studyMode === 'group' && isIndonesian ? (locale === 'id' ? '1.5 Tahun' : locale === 'ar' ? '1.5 سنة' : '1.5 Years') : duration}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-[var(--athar-gold)]/20 pt-4">
                  <div>
                    <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'ar' ? 'الرسوم الشهرية المقدرة:' : locale === 'id' ? 'Biaya Bulanan:' : 'Estimated Monthly Fee:'}</p>
                    <p className="text-xl font-extrabold text-[var(--athar-text)] mt-1">
                      {isIndonesian ? <span className="text-lg">{prices.formatted}</span> : <>{prices.egp} ج.م <span className="text-xs text-[var(--athar-text-muted)] font-normal">/ {prices.usd}$</span></>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--athar-text-muted)]">{locale === 'ar' ? 'معدل الحصص شهرياً:' : locale === 'id' ? 'Jumlah Sesi Bulanan:' : 'Monthly Sessions:'}</p>
                    <p className="text-lg font-bold text-[var(--athar-text)] mt-1">{studyMode === 'group' && isIndonesian ? '8' : frequency * 4} {locale === 'id' ? 'sesi' : locale === 'ar' ? 'حصص' : 'sessions'}</p>
                  </div>
                </div>

                {isIndonesian && (
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200/60 p-2.5 text-[11px] text-emerald-800 font-semibold leading-normal shadow-xs">
                    <Globe size={14} className="shrink-0 text-emerald-600 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>{locale === 'id' ? 'Terdeteksi IP Indonesia: Subsidi Biaya Khusus Aktif (Dukungan Guru Mesir Terjangkau)' : locale === 'ar' ? 'تم رصد عنوان IP من إندونيسيا: الرسوم المدعومة نشطة (معلمين مصريين بتكلفة مناسبة)' : 'Indonesian IP Detected: Subsidized Pricing Active (Affordable Egyptian Scholars)'}</span>
                  </div>
                )}

                <div className="border-t border-[var(--athar-gold)]/20 pt-4 space-y-2">
                  <p className="text-xs font-bold text-[var(--athar-text-muted)] mb-2">{locale === 'id' ? 'Fasilitas Termasuk:' : locale === 'ar' ? 'المزايا المشمولة في خطتك:' : 'Included Benefits:'}</p>
                  {(studyMode === 'group' && isIndonesian
                    ? (locale === 'id' ? ['Guru Al-Azhar (Kelas grup 5-7 siswa)', 'Kurikulum Iqro interaktif lengkap', 'Sertifikat kelulusan terverifikasi QR Code', 'Biaya ekonomis khusus Indonesia'] : locale === 'ar' ? ['معلم أزهري مباشر (حلقة جماعية 5-7 طلاب)', 'منهج إقرأ الإندونيسي التفاعلي المتكامل', 'شهادة إتمام معتمدة برمز QR عند التخرج', 'سعر اقتصادي مدعوم بالكامل لأندونيسيا'] : ['Direct Al-Azhar tutor (Group class 5-7 students)', 'Complete interactive Iqro curriculum', 'Accredited QR Code completion certificate', 'Fully subsidized economical price for Indonesia'])
                    : (locale === 'id' ? ['Guru privat 1-on-1 langsung dari Mesir', 'Laporan perkembangan siswa berkala', 'Sertifikat kelulusan berlisensi resmi', 'Rekaman sesi tersedia untuk diulang'] : locale === 'ar' ? ['معلم شخصي مباشر 1-on-1 (أزهري مجاز)', 'تقارير أداء دورية لولي الأمر والطالب', 'شهادة تخرج معتمدة برقم تحقق QR Code', 'إمكانية تسجيل الحصص لإعادة المراجعة'] : ['Direct 1-on-1 private tutor (Azhari certified)', 'Periodic performance reports for parents & students', 'Accredited QR Code completion certificate', 'Option to record sessions for revision'])
                  ).map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-[var(--athar-text)]">
                      <CheckCircle2 size={13} className="text-[var(--athar-gold)] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <LocalizedLink to={`/register/student?path=${path}&freq=${frequency}&level=${level}&mode=${studyMode}`} locale={locale} className="btn-gold w-full justify-center text-sm py-3 shadow-lg">
                {locale === 'ar' ? 'ابدأ خطتك التعليمية الآن' : locale === 'id' ? 'Mulai Belajar Sekarang' : 'Start Your Plan Now'}
                <ArrowLeft size={16} />
              </LocalizedLink>

              {isIndonesian && (
                <div className="mt-4 pt-3 border-t border-[var(--athar-gold)]/20 text-center">
                  <p className="text-[10px] text-[var(--athar-text-muted)] font-bold mb-2">{locale === 'id' ? 'Metode Pembayaran Lokal Didukung:' : locale === 'ar' ? 'طرق الدفع المحلية المدعومة:' : 'Supported Local Payment Methods:'}</p>
                  <div className="flex flex-wrap justify-center gap-1.5 opacity-90">
                    {['QRIS', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'Transfer Bank'].map(method => (
                      <span key={method} className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/50 rounded px-1.5 py-0.5">{method}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-center text-[var(--athar-text-muted)] mt-2">
                {locale === 'ar' ? '*الأسعار تقريبية وقد تتغير حسب خيارات التخصيص' : '*Biaya bersifat estimasi dan dapat disesuaikan'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}