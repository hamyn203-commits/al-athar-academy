import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: true
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--athar-warm-white)',
          padding: '20px',
          direction: 'rtl'
        }}>
          <div className="azhar-card" style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            padding: '60px 40px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={40} style={{ color: '#dc2626' }} />
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--azhar-green-deep)',
              marginBottom: '12px',
              fontFamily: 'Amiri, serif'
            }}>
              عذراً، حدث خطأ غير متوقع
            </h1>

            <p style={{
              fontSize: '1rem',
              color: 'var(--athar-text-muted)',
              marginBottom: '32px',
              lineHeight: '1.7'
            }}>
              واجهنا مشكلة في تحميل الصفحة. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'right',
                marginBottom: '24px',
                padding: '16px',
                background: 'var(--athar-cream)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--athar-cream-dark)'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '8px'
                }}>
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre style={{
                  fontSize: '0.75rem',
                  color: 'var(--athar-text-muted)',
                  overflow: 'auto',
                  marginTop: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRetry}
                className="btn-azhar"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={18} />
                إعادة المحاولة
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Home size={18} />
                الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
