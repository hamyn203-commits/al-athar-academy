// Legacy compatibility shim.
// New uploads use services/objectStorage.js and direct browser-to-storage flows.
// Kept temporarily so older imports fail closed rather than loading a cloud-specific SDK.

async function uploadToCDN() {
  throw new Error('Legacy CDN upload is retired. Use the object storage direct-upload flow.');
}

module.exports = {
  isConfigured: () => false,
  uploadToCDN,
};
