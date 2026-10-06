'use strict';

function hasValue(name) {
  return Boolean(String(process.env[name] || '').trim());
}

function getEmailProviderStatus() {
  const requested = String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  const smtpReady = hasValue('SMTP_USER') && hasValue('SMTP_PASS') && hasValue('EMAIL_FROM');
  const resendReady = hasValue('RESEND_API_KEY') && hasValue('EMAIL_FROM');

  if (requested === 'smtp') return { provider: 'smtp', configured: smtpReady };
  if (requested === 'resend') return { provider: 'resend', configured: resendReady };
  if (smtpReady) return { provider: 'smtp', configured: true };
  if (resendReady) return { provider: 'resend', configured: true };
  return { provider: null, configured: false };
}

module.exports = { getEmailProviderStatus };
