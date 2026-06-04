import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import { convertPrice, formatPrice } from '../config/currencies';
import { getMarketBySlug, resolveMarketPrefs, saveMarketPrefs } from '../lib/market';

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const { locale } = useI18n();
  const [prefs, setPrefs] = useState(() => resolveMarketPrefs(locale));

  useEffect(() => {
    setPrefs((prev) => {
      const next = resolveMarketPrefs(locale);
      if (prev.marketSlug === next.marketSlug) return prev;
      return { ...prev, ...next };
    });
  }, [locale]);

  useEffect(() => {
    let active = true;
    const detectGeo = async () => {
      try {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
            // Avoid external GeoIP lookup during local development to prevent CORS and network noise.
            return;
          }
        }

        let countryCode = '';

        // Check mock country parameter first for QA/testing
        if (typeof window !== 'undefined' && window.location.search.includes('mock_country=ID')) {
          countryCode = 'ID';
        }

        // 1. Try FreeIPAPI
        if (!countryCode) {
          try {
            const res = await fetch('https://freeipapi.com/api/json');
            if (res.ok) {
              const data = await res.json();
              countryCode = data.countryCode;
            }
          } catch (e) {
            console.warn('FreeIPAPI failed:', e);
          }
        }

        // 2. Fallback to ipapi.co
        if (!countryCode) {
          try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
              const data = await res.json();
              countryCode = data.country_code;
            }
          } catch (e) {
            console.warn('ipapi.co fallback failed:', e);
          }
        }

        // 3. Fallback to ip-api
        if (!countryCode) {
          try {
            const res = await fetch('https://ip-api.com/json/');
            if (res.ok) {
              const data = await res.json();
              countryCode = data.countryCode;
            }
          } catch (e) {
            console.warn('ip-api.com fallback failed:', e);
          }
        }

        if (active && countryCode === 'ID') {
          localStorage.setItem('is_indonesia_ip', 'true');
          const next = { marketSlug: 'indonesia-malaysia', currency: 'IDR', timezone: 'Asia/Jakarta' };
          setPrefs(next);
          saveMarketPrefs(next);
        }
      } catch (err) {
        console.warn('GeoIP detection failed:', err);
      }
    };
    detectGeo();
    return () => { active = false; };
  }, []);

  const market = getMarketBySlug(prefs.marketSlug);

  const setMarket = useCallback((slug) => {
    const isIndoIP = typeof window !== 'undefined' && localStorage.getItem('is_indonesia_ip') === 'true';
    if (isIndoIP) {
      console.warn('Market change blocked: User IP is geolocked to Indonesia');
      return;
    }
    const m = getMarketBySlug(slug);
    if (!m) return;
    const next = { marketSlug: slug, currency: m.currency, timezone: m.timezone };
    setPrefs(next);
    saveMarketPrefs(next);
  }, []);

  const setCurrency = useCallback((currency) => {
    const isIndoIP = typeof window !== 'undefined' && localStorage.getItem('is_indonesia_ip') === 'true';
    if (isIndoIP) return;
    setPrefs((prev) => {
      const next = { ...prev, currency };
      saveMarketPrefs(next);
      return next;
    });
  }, []);

  const setTimezone = useCallback((timezone) => {
    setPrefs((prev) => {
      const next = { ...prev, timezone };
      saveMarketPrefs(next);
      return next;
    });
  }, []);

  const displayPrice = useCallback(
    (amount, sourceCurrency = 'USD') => {
      const converted = convertPrice(amount, sourceCurrency, prefs.currency);
      const fmtLocale = locale === 'ar' ? 'ar-EG' : locale;
      return formatPrice(converted, prefs.currency, fmtLocale);
    },
    [prefs.currency, locale]
  );

  const formatDateTime = useCallback(
    (date, options = {}) => {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : locale, {
        timeZone: prefs.timezone,
        ...options,
      }).format(d);
    },
    [locale, prefs.timezone]
  );

  return (
    <MarketContext.Provider value={{ ...prefs, market, setMarket, setCurrency, setTimezone, displayPrice, formatDateTime }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
