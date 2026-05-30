import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Search, Plus, Edit3, X } from 'lucide-react';
import Logo from '../../components/Logo';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { useAppContext } from '../../context/AppProvider';

function UpdateModal({ isOpen, onClose, student, onSave, t }) {
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <UpdateForm key={student.id} student={student} onSave={onSave} onClose={onClose} t={t} />
    </Modal>
  );
}

function UpdateForm({ student, onSave, onClose, t }) {
  const [progress, setProgress] = useState(student.progress);
  const [surah, setSurah] = useState(student.currentSurah);
  const [grade, setGrade] = useState(student.lastGrade);
  const [homework, setHomework] = useState(student.homework || '');

  return (
    <>
      <h3 style={{ marginBottom: '20px' }}>{t.teacher.editModal.title}</h3>
      <span className="badge-gold" style={{ display: 'inline-block', marginBottom: '20px' }}>{student.name}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-surah" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.editModal.surahLabel}</label>
          <input id="edit-surah" type="text" value={surah} onChange={(e) => setSurah(e.target.value)} className="premium-input" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-progress" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.editModal.progressLabel}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input id="edit-progress" type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} style={{ flex: 1, accentColor: 'var(--primary-gold)' }} />
            <span style={{ minWidth: '40px', fontWeight: 'bold', color: 'var(--primary-gold-dark)' }}>{progress}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-grade" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.editModal.gradeLabel}</label>
          <input id="edit-grade" type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="premium-input" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="edit-homework" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.editModal.homeworkLabel}</label>
          <textarea id="edit-homework" value={homework} onChange={(e) => setHomework(e.target.value)} placeholder={t.teacher.editModal.homeworkPlaceholder} rows="3" className="premium-input" />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button onClick={() => onSave({ progress: Number(progress), currentSurah: surah, lastGrade: grade, homework })} className="btn-premium" style={{ flex: 1, justifyContent: 'center' }}>
            {t.teacher.editModal.save}
          </button>
          <button onClick={onClose} className="btn-premium-outline" style={{ flex: 1, justifyContent: 'center' }}>
            {t.common.cancel}
          </button>
        </div>
      </div>
    </>
  );
}

function AddStudentModal({ isOpen, onClose, onAdd, t }) {
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('');
  const [surah, setSurah] = useState('');
  const [homework, setHomework] = useState('');

  const handleAdd = () => {
    if (!name.trim()) { alert(t.teacher.addModal.nameRequired); return; }
    onAdd({ name, plan: plan || 'حفظ القرآن كاملاً', currentSurah: surah || 'سورة الفاتحة', homework: homework || 'حفظ الصفحة الأولى' });
    setName(''); setPlan(''); setSurah(''); setHomework('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 style={{ marginBottom: '20px' }} className="text-gradient-gold">{t.teacher.addModal.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="new-name" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.addModal.nameLabel}</label>
          <input id="new-name" type="text" placeholder={t.teacher.addModal.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className="premium-input" required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="new-plan" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.addModal.planLabel}</label>
          <input id="new-plan" type="text" placeholder={t.teacher.addModal.planPlaceholder} value={plan} onChange={(e) => setPlan(e.target.value)} className="premium-input" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="new-surah" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.addModal.surahLabel}</label>
          <input id="new-surah" type="text" placeholder={t.teacher.addModal.surahPlaceholder} value={surah} onChange={(e) => setSurah(e.target.value)} className="premium-input" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="new-homework" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.teacher.addModal.homeworkLabel}</label>
          <textarea id="new-homework" placeholder={t.teacher.addModal.homeworkPlaceholder} value={homework} onChange={(e) => setHomework(e.target.value)} rows="3" className="premium-input" />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button onClick={handleAdd} className="btn-premium" style={{ flex: 1, justifyContent: 'center' }}>
            <Plus size={16} /> {t.teacher.addModal.confirm}
          </button>
          <button onClick={onClose} className="btn-premium-outline" style={{ flex: 1, justifyContent: 'center' }}>
            {t.common.cancel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function TeacherPortal() {
  const navigate = useNavigate();
  const { studentsData, setStudentsData, loggedInStudentId, handleStudentLogout, t } = useAppContext();
  const [subTab, setSubTab] = useState('students');
  const [updateModal, setUpdateModal] = useState({ open: false, student: null });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const saveProgress = (updates) => {
    setStudentsData((prev) => prev.map((s) => s.id === updateModal.student.id ? { ...s, ...updates, lastUpdate: 'الآن' } : s));
    setUpdateModal({ open: false, student: null });
  };

  const addStudent = (data) => {
    const newStudent = { id: Date.now(), ...data, progress: 0, sheikh: 'الشيخ عبد الرحمن الشريف', lastGrade: 'لم يُقيّم بعد', status: 'نشط', lastUpdate: 'الآن' };
    setStudentsData((prev) => [...prev, newStudent]);
    setAddModalOpen(false);
  };

  const deleteStudent = (id) => {
    if (window.confirm(t.teacher.students.confirmDelete)) {
      setStudentsData((prev) => prev.filter((s) => s.id !== id));
      if (loggedInStudentId === id) handleStudentLogout();
    }
  };

  const filteredStudents = studentsData.filter((s) => s.name.includes(searchQuery));

  const tabs = [
    { id: 'students', icon: Users, label: t.teacher.tabs.students },
    { id: 'schedule', icon: Calendar, label: t.teacher.tabs.schedule },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
          <Logo size={44} showText />
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>ش</div>
          <div>
            <h4 style={{ fontSize: '0.92rem' }}>الشيخ عبد الرحمن الشريف</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-gold)' }}>مقرئ الأكاديمية الرئيسي</span>
          </div>
        </div>
        <ul className="sidebar-nav" style={{ flex: 1 }}>
          {tabs.map((tab) => (
            <li key={tab.id} className={`sidebar-item ${subTab === tab.id ? 'active' : ''}`} onClick={() => setSubTab(tab.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSubTab(tab.id); }}>
              <tab.icon size={18} /> {tab.label}
            </li>
          ))}
        </ul>
        <button onClick={() => navigate('/')} className="btn-premium-outline" style={{ justifyContent: 'center', width: '100%' }}>
          {t.teacher.logout}
        </button>
      </aside>

      <main className="dashboard-content animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-gold)' }}>{t.teacher.title}</span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{t.teacher.subtitle}</h2>
          </div>
          <span className="badge-gold">{t.teacher.studentsCount} {studentsData.length}</span>
        </div>

        {subTab === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="premium-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', flex: 1, maxWidth: '300px' }}>
                <Search size={18} style={{ color: 'var(--primary-gold)', flexShrink: 0 }} />
                <input type="text" placeholder={t.teacher.students.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.9rem' }} aria-label={t.common.search} />
              </div>
              <button onClick={() => setAddModalOpen(true)} className="btn-premium" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                <Plus size={16} /> {t.teacher.students.addStudent}
              </button>
            </div>

            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title={searchQuery ? t.teacher.students.noResults : t.teacher.students.noStudents}
                description={searchQuery ? t.teacher.students.noResultsDesc : t.teacher.students.noStudentsDesc}
                action={!searchQuery && <button onClick={() => setAddModalOpen(true)} className="btn-premium"><Plus size={16} /> {t.teacher.students.addFirst}</button>}
              />
            ) : (
              <div className="premium-card animate-fade" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="table-premium">
                  <thead>
                    <tr>
                      <th>{t.teacher.students.table.name}</th>
                      <th>{t.teacher.students.table.surah}</th>
                      <th>{t.teacher.students.table.progress}</th>
                      <th>{t.teacher.students.table.grade}</th>
                      <th>{t.teacher.students.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: '600' }}>{student.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{student.currentSurah}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="progress-bar" style={{ width: '80px', height: '6px' }}>
                              <div className="progress-bar-fill" style={{ width: `${student.progress}%` }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{student.progress}%</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--emerald)', fontWeight: '500' }}>{student.lastGrade}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setUpdateModal({ open: true, student })} className="btn-premium" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                              <Edit3 size={12} /> {t.teacher.students.update}
                            </button>
                            <button onClick={() => deleteStudent(student.id)} className="btn-premium-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                              <X size={12} /> {t.teacher.students.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {subTab === 'schedule' && (
          <div className="premium-card">
            <h3 style={{ marginBottom: '20px' }}>{t.teacher.schedule.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', borderRight: '4px solid var(--primary-gold)' }}>
                <div>
                  <strong style={{ fontSize: '1rem' }}>{t.teacher.schedule.generalCircle}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t.teacher.schedule.scheduleTime}</p>
                </div>
                <span className="badge-gold">{t.teacher.schedule.upcomingBadge}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <UpdateModal isOpen={updateModal.open} onClose={() => setUpdateModal({ open: false, student: null })} student={updateModal.student} onSave={saveProgress} t={t} />
      <AddStudentModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={addStudent} t={t} />
    </div>
  );
}
