import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  getPageNumbers 
}) {
  const { t } = useAppContext();
  
  if (totalPages <= 1) return null;

  const pages = getPageNumbers();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-premium-outline"
        style={{
          padding: '8px 12px',
          opacity: currentPage === 1 ? 0.5 : 1,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
        aria-label={t.pagination?.previous || 'السابق'}
      >
        <ChevronRight size={18} />
      </button>

      {pages.map((page, i) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${i}`}
              style={{
                padding: '8px 12px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '8px 14px',
              background: currentPage === page ? 'var(--primary-gold)' : 'var(--bg-card)',
              color: currentPage === page ? '#fff' : 'var(--text-primary)',
              border: `1px solid ${currentPage === page ? 'var(--primary-gold)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: currentPage === page ? '700' : '500',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            aria-label={`${t.pagination?.page || 'صفحة'} ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-premium-outline"
        style={{
          padding: '8px 12px',
          opacity: currentPage === totalPages ? 0.5 : 1,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
        aria-label={t.pagination?.next || 'التالي'}
      >
        <ChevronLeft size={18} />
      </button>
    </div>
  );
}
