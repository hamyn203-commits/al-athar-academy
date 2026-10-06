'use strict';

const { getConfigurationReadiness } = require('./readiness');
const { getEmailProviderStatus } = require('./emailProvider');

const DEFAULT_PUBLIC_FEATURES = ['email', 'manual-payment', 'livekit', 'whatsapp'];

function hasValue(name) {
  return Boolean(String(process.env[name] || '').trim());
}

function isTrue(name) {
  return ['1', 'true', 'yes', 'on'].includes(String(process.env[name] || '').trim().toLowerCase());
}

function isPublicCustomDomain(urlValue) {
  try {
    const url = new URL(String(urlValue || '').trim());
    const hostname = url.hostname.toLowerCase();
    return url.protocol === 'https:'
      && hostname !== 'localhost'
      && hostname !== '127.0.0.1'
      && !hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function getRequiredFeatures(mode) {
  const explicit = String(process.env.LAUNCH_REQUIRED_FEATURES || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (explicit.length > 0) return [...new Set(explicit)];
  return mode === 'public' ? DEFAULT_PUBLIC_FEATURES : ['email'];
}

function getFeatureProofs() {
  return {
    email: (() => {
      const emailProvider = getEmailProviderStatus();
      return {
        configured: emailProvider.configured,
        provider: emailProvider.provider,
        domainVerified: isTrue('EMAIL_DOMAIN_VERIFIED'),
        e2eVerified: isTrue('EMAIL_E2E_VERIFIED'),
      };
    })(),
    paymob: {
      configured: process.env.PAYMOB_ENABLED === 'true'
        && hasValue('PAYMOB_SECRET_KEY')
        && hasValue('PAYMOB_PUBLIC_KEY')
        && hasValue('PAYMOB_HMAC_SECRET')
        && (hasValue('PAYMOB_INTEGRATION_IDS') || hasValue('PAYMOB_INTEGRATION_ID_CARD')),
      e2eVerified: isTrue('PAYMOB_E2E_VERIFIED'),
    },
    'manual-payment': {
      configured: process.env.MANUAL_PAYMENT_ENABLED === 'true'
        && (
          hasValue('MANUAL_PAYMENT_INSTAPAY')
          || hasValue('MANUAL_PAYMENT_MOBILE_WALLET')
          || hasValue('MANUAL_PAYMENT_BANK_DETAILS')
        ),
      e2eVerified: isTrue('MANUAL_PAYMENT_E2E_VERIFIED'),
    },
    livekit: {
      configured: hasValue('LIVEKIT_API_KEY')
        && hasValue('LIVEKIT_API_SECRET')
        && hasValue('LIVEKIT_URL'),
      e2eVerified: isTrue('LIVEKIT_E2E_VERIFIED'),
    },
    whatsapp: (() => {
      const metaCloudConfigured = (hasValue('WHATSAPP_CLOUD_TOKEN') || hasValue('WHATSAPP_TOKEN'))
        && hasValue('WHATSAPP_PHONE_NUMBER_ID');
      const twilioConfigured = hasValue('TWILIO_ACCOUNT_SID')
        && hasValue('TWILIO_AUTH_TOKEN')
        && hasValue('TWILIO_WHATSAPP_FROM');

      return {
        configured: metaCloudConfigured || twilioConfigured,
        provider: metaCloudConfigured ? 'meta-cloud' : (twilioConfigured ? 'twilio' : null),
        e2eVerified: isTrue('WHATSAPP_E2E_VERIFIED'),
      };
    })(),
  };
}

function getLaunchReadiness({ databaseConnected = false } = {}) {
  const mode = String(process.env.LAUNCH_MODE || 'public').trim().toLowerCase() === 'closed-beta'
    ? 'closed-beta'
    : 'public';
  const configuration = getConfigurationReadiness();
  const requiredFeatures = getRequiredFeatures(mode);
  const features = getFeatureProofs();
  const customDomainConfigured = isPublicCustomDomain(process.env.SITE_URL)
    && isPublicCustomDomain(process.env.FRONTEND_URL);

  const blockers = [];

  if (!configuration.configurationReady) {
    blockers.push({
      code: 'CORE_CONFIGURATION_NOT_READY',
      detail: configuration.missingConfiguration,
    });
  }

  if (!databaseConnected) {
    blockers.push({ code: 'DATABASE_NOT_CONNECTED' });
  }

  if (mode === 'public' && !customDomainConfigured) {
    blockers.push({ code: 'CUSTOM_DOMAIN_NOT_CONFIGURED' });
  }

  for (const feature of requiredFeatures) {
    const proof = features[feature];

    if (!proof) {
      blockers.push({ code: 'UNKNOWN_REQUIRED_FEATURE', feature });
      continue;
    }

    if (!proof.configured) {
      blockers.push({ code: 'FEATURE_NOT_CONFIGURED', feature });
      continue;
    }

    if (feature === 'email' && !proof.domainVerified) {
      blockers.push({ code: 'EMAIL_DOMAIN_NOT_VERIFIED', feature });
    }

    if (!proof.e2eVerified) {
      blockers.push({ code: 'FEATURE_E2E_NOT_VERIFIED', feature });
    }
  }

  return {
    mode,
    ready: blockers.length === 0,
    requiredFeatures,
    customDomainConfigured,
    features,
    blockers,
  };
}

module.exports = {
  DEFAULT_PUBLIC_FEATURES,
  getFeatureProofs,
  getLaunchReadiness,
  getRequiredFeatures,
  isPublicCustomDomain,
};
