import { Star } from 'lucide-react';

export default function EmptyState({ icon: Icon = Star, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--azhar-gold-50)] flex items-center justify-center mb-6">
        <Icon size={36} className="text-[var(--azhar-gold-leaf)]" strokeWidth={1.5} />
      </div>
      {title && (
        <h3 className="font-amiri text-xl font-bold text-[var(--azhar-green-deep)] mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-[var(--athar-text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
