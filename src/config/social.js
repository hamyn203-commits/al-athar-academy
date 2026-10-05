/** Public contact channels are optional and environment-driven.
 * Empty values are intentionally hidden rather than replaced with placeholders.
 */
export const SOCIAL_LINKS = {
  facebook: import.meta.env.VITE_FACEBOOK_URL || '',
  whatsapp: import.meta.env.VITE_WHATSAPP_URL || '',
  instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
  youtube: import.meta.env.VITE_YOUTUBE_URL || '',
  telegram: import.meta.env.VITE_TELEGRAM_URL || '',
};

export const CONTACT = {
  email: import.meta.env.VITE_SUPPORT_EMAIL || '',
  phone: import.meta.env.VITE_SUPPORT_PHONE || '',
  address: import.meta.env.VITE_SUPPORT_ADDRESS || '',
};
