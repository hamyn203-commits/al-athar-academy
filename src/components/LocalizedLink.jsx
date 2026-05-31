import { Link, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, localizedPath } from '../lib/locale';

export default function LocalizedLink({ to, locale, children, ...props }) {
  const { locale: paramLocale } = useParams();
  const activeLocale = locale || paramLocale || DEFAULT_LOCALE;
  const href = to.startsWith('http') ? to : localizedPath(to, activeLocale);
  return <Link to={href} {...props}>{children}</Link>;
}
