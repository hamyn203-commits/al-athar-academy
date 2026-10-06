'use strict';

const METHOD_DEFINITIONS = Object.freeze([
  { id: 'instapay', label: 'InstaPay', env: 'MANUAL_PAYMENT_INSTAPAY' },
  { id: 'mobile_wallet', label: 'Mobile Wallet', env: 'MANUAL_PAYMENT_MOBILE_WALLET' },
  { id: 'bank_transfer', label: 'Bank transfer', env: 'MANUAL_PAYMENT_BANK_DETAILS' },
]);

function enabled() {
  return String(process.env.MANUAL_PAYMENT_ENABLED || '').trim().toLowerCase() === 'true';
}

function clean(value, max = 300) {
  return String(value || '').trim().slice(0, max);
}

function getMethods() {
  if (!enabled()) return [];

  return METHOD_DEFINITIONS
    .map((definition) => ({
      id: definition.id,
      label: definition.label,
      destination: clean(process.env[definition.env]),
    }))
    .filter((method) => method.destination);
}

function getPublicConfig() {
  const methods = getMethods();
  return {
    provider: 'manual',
    configured: methods.length > 0,
    checkoutMode: 'manual-review',
    recipientName: clean(process.env.MANUAL_PAYMENT_RECIPIENT_NAME, 120),
    methods,
  };
}

function getMethod(id) {
  const normalized = clean(id, 40).toLowerCase();
  return getMethods().find((method) => method.id === normalized) || null;
}

function isConfigured() {
  return getMethods().length > 0;
}

module.exports = {
  METHOD_DEFINITIONS,
  getMethods,
  getPublicConfig,
  getMethod,
  isConfigured,
};
