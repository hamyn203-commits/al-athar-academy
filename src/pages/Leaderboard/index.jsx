import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Gift, Flame } from 'lucide-react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

function RankRow({ rank, name, score, label, highlight }) {
  const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${highlight ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
      <span className="w-8 text-center font-bold">
        {rank <= 3 ? <Medal className={colors[rank - 1]} size={22} /> : `#${rank}`}
      </span>
      <div className="flex-1 font-semibold">{name}</div>
      <div className="text-right">
        <span className="font-bold text-emerald-700">{score}</span>
        <span className="text-xs text-gray-500 mr-1">{label}</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [timeframe, setTimeframe] = useState('all-time');
  const [points, setPoints] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/gamification/leaderboard/points/${timeframe}`),
      api.get(`/api/referrals/leaderboard?limit=10${timeframe !== 'all-time' ? `&timeframe=${timeframe}` : ''}`),
    ]).then(([p, r]) => {
      setPoints((p.entries || []).map((e) => ({
        rank: e.rank,
        name: e.user?.name || (isAr ? 'طالب' : 'Student'),
        score: e.score || 0,
      })));
      setReferrals(r.leaderboard || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [timeframe, isAr]);

  return (
    <>
      <SEOHead page={{ url: '/leaderboard', title: isAr ? 'لوحة المتصدرين' : 'Leaderboard', description: isAr ? 'بطولات النقاط والسفراء' : 'Points and referral championships' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Trophy className="mx-auto text-amber-500 mb-4" size={52} />
            <h1 className="text-4xl font-bold mb-2">{isAr ? 'بطولات الأكاديمية' : 'Academy Championships'}</h1>
            <p className="text-gray-600">{isAr ? 'تنافس بالنقاط وادعُ أصدقاءك' : 'Compete with points and invite friends'}</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {['monthly', 'weekly', 'all-time'].map((tf) => (
              <button key={tf} type="button" onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${timeframe === tf ? 'bg-amber-500 text-white' : 'bg-white border text-gray-600'}`}>
                {tf === 'monthly' ? (isAr ? 'شهري' : 'Monthly') : tf === 'weekly' ? (isAr ? 'أسبوعي' : 'Weekly') : (isAr ? 'كل الأوقات' : 'All time')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner spinner-lg" /></div>
          ) : (
            <div className="space-y-10">
              <section>
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Flame className="text-orange-500" size={22} /> {isAr ? 'نقاط التعلم' : 'Learning Points'}</h2>
                <div className="space-y-2">
                  {points.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{isAr ? 'لا بيانات بعد — ابدأ بحصة أو دورة' : 'No data yet'}</p>
                  ) : points.map((p) => (
                    <RankRow key={p.rank} {...p} label={isAr ? 'نقطة' : 'pts'} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Gift className="text-emerald-600" size={22} /> {isAr ? 'سفراء الأكاديمية' : 'Academy Ambassadors'}</h2>
                <div className="space-y-2">
                  {referrals.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{isAr ? 'لا دعوات بعد' : 'No invites yet'}</p>
                  ) : referrals.map((r) => (
                    <RankRow key={r.rank} rank={r.rank} name={r.name} score={r.invites} label={isAr ? 'دعوة' : 'invites'} />
                  ))}
                </div>
                <p className="text-center mt-6">
                  <Link to={localizedPath('/student/dashboard', locale)} className="text-emerald-600 font-medium hover:underline">
                    {isAr ? 'احصل على رابطك من لوحة الطالب ←' : 'Get your link from student dashboard →'}
                  </Link>
                </p>
              </section>
            </div>
          )}
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
