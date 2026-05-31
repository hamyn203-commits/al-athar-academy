import { STEPS } from './constants';

export default function StepProgress({ current }) {
  const pct = Math.round(((current - 1) / (STEPS.length - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>الخطوة {current} من {STEPS.length}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const active = current === s.id;
          const done = current > s.id;
          return (
            <div key={s.id} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${
              active ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold' :
              done ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' :
              'border-slate-200 text-slate-400'
            }`}>
              <Icon size={16} />
              <span className="whitespace-nowrap">{s.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
