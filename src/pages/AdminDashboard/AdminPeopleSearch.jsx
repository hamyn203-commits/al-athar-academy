import { useState } from 'react';
import { Search, UserRound, Users, GraduationCap, Calendar, CreditCard, X } from 'lucide-react';
import api from '../../lib/api';

function personIcon(role) {
  if (role === 'student') return UserRound;
  if (role === 'guardian') return Users;
  return GraduationCap;
}

function roleLabel(role) {
  return role === 'student' ? 'طالب' : role === 'guardian' ? 'ولي أمر' : role === 'teacher' ? 'معلم' : role;
}

export default function AdminPeopleSearch({
  onOpenStudent,
  onOpenGuardian,
  onOpenTeacher,
  onOpenPayments,
}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ people: [], sessions: [], payments: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const search = async (event) => {
    event?.preventDefault();
    const value = query.trim();
    if (value.length < 2) return;

    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/admin/people/search?q=' + encodeURIComponent(value), { auth: true });
      setResult(data || { people: [], sessions: [], payments: [] });
      setSearched(true);
    } catch (searchError) {
      setError(searchError.message || 'تعذر البحث');
      setResult({ people: [], sessions: [], payments: [] });
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const openPerson = (person) => {
    if (person.role === 'student') onOpenStudent?.(person._id);
    if (person.role === 'guardian') onOpenGuardian?.(person._id);
    if (person.role === 'teacher' && person.teacherProfileId) onOpenTeacher?.(person.teacherProfileId);
  };

  const total = (result.people?.length || 0) + (result.sessions?.length || 0) + (result.payments?.length || 0);

  return (
    <section className="wn-admin-global-search">
      <form onSubmit={search} className="wn-admin-global-search__bar">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث بالاسم، البريد، الهاتف، أو ID للمعلم/الحصة/الدفع..."
          aria-label="البحث الشامل في الأكاديمية"
        />
        {query ? (
          <button
            type="button"
            className="wn-admin-global-search__clear"
            onClick={() => {
              setQuery('');
              setSearched(false);
              setResult({ people: [], sessions: [], payments: [] });
            }}
            aria-label="مسح البحث"
          >
            <X size={16} />
          </button>
        ) : null}
        <button type="submit" disabled={loading || query.trim().length < 2}>
          {loading ? 'جاري البحث...' : 'بحث شامل'}
        </button>
      </form>

      {searched && (
        <div className="wn-admin-global-search__results">
          <div className="wn-admin-global-search__results-head">
            <strong>{total ? total + ' نتيجة' : 'لا توجد نتائج'}</strong>
            {error ? <span>{error}</span> : null}
          </div>

          {(result.people || []).length > 0 && (
            <div className="wn-admin-global-search__group">
              <span>الأشخاص</span>
              {(result.people || []).map((person) => {
                const Icon = personIcon(person.role);
                return (
                  <button type="button" key={person._id} onClick={() => openPerson(person)}>
                    <span><Icon size={17} /></span>
                    <span>
                      <strong>{person.name || 'بدون اسم'}</strong>
                      <small>{roleLabel(person.role)} · {person.email || person.phone || '—'}</small>
                    </span>
                    <small>{person.isActive === false ? 'موقوف' : 'نشط'}</small>
                  </button>
                );
              })}
            </div>
          )}

          {(result.sessions || []).length > 0 && (
            <div className="wn-admin-global-search__group">
              <span>الحصص</span>
              {(result.sessions || []).map((session) => (
                <div key={session._id} className="wn-admin-global-search__record">
                  <span><Calendar size={17} /></span>
                  <span>
                    <strong>حصة {session.student?.name || 'طالب'} مع {session.teacher?.user?.name || session.teacher?.personalInfo?.fullName || 'معلم'}</strong>
                    <small>{new Date(session.scheduledAt).toLocaleString('ar-EG')} · {session.status}</small>
                  </span>
                  <code>{session._id}</code>
                </div>
              ))}
            </div>
          )}

          {(result.payments || []).length > 0 && (
            <div className="wn-admin-global-search__group">
              <span>المدفوعات</span>
              {(result.payments || []).map((payment) => (
                <button type="button" key={payment._id} onClick={() => onOpenPayments?.(payment)}>
                  <span><CreditCard size={17} /></span>
                  <span>
                    <strong>{payment.student?.name || 'عملية دفع'} · {payment.status}</strong>
                    <small>{payment.currency} · {payment.provider}</small>
                  </span>
                  <code>{payment._id}</code>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
