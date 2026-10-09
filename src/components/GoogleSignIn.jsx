import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../hooks/useAuth.jsx';
import { postAuthDestination } from '../lib/navigation';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignIn({ context = 'signin', role = 'student' }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState('');
  const { googleLogin } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let active = true;
    const scriptId = 'google-identity-services';
    let script = document.getElementById(scriptId);

    const start = () => {
      if (!active || !window.google?.accounts?.id || !buttonRef.current) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        callback: async (response) => {
          if (!active || !response?.credential) return;
          const result = await googleLogin(response.credential, role);
          if (!active) return;
          if (!result.success) return setError(result.error || 'Google sign-in failed');
          if (result.user?.onboarding?.required && !result.user?.onboarding?.completed) {
            navigate(locale === 'ar' ? '/ar/profile/setup' : `/${locale}/profile/setup`, { replace: true });
            return;
          }
          navigate(postAuthDestination({
            redirect: searchParams.get('redirect'),
            role: result.user?.role,
            locale,
          }), { replace: true });
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard', theme: 'outline', size: 'large',
        text: context === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular', width: 320,
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', start);
    if (window.google?.accounts?.id) start();
    return () => { active = false; script?.removeEventListener('load', start); };
  }, [context, googleLogin, locale, navigate, searchParams, role]);

  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div className="my-5 space-y-2 text-center">
      <p className="text-xs text-slate-500">{locale === 'ar' ? 'أو المتابعة باستخدام' : 'Or continue with'}</p>
      <div className="flex justify-center" ref={buttonRef} />
      {error && <p role="alert" className="text-red-700 text-xs">{error}</p>}
    </div>
  );
}
