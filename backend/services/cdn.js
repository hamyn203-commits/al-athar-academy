const { BlobServiceClient } = require('@azure/storage-blob');

let blobServiceClient = null;
let containerClient = null;

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (connStr) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
    containerClient = blobServiceClient.getContainerClient('uploads');
  } catch (err) {
    console.error('Failed to initialize Azure Blob Storage client:', err.message);
  }
}

/**
 * Uploads a buffer to Azure Blob Storage (CDN)
 * @param {Buffer} buffer 
 * @param {string} blobName 
 * @param {string} mimeType 
 * @returns {Promise<string>} Public URL of the uploaded blob
 */
async function uploadToCDN(buffer, blobName, mimeType) {
  if (!containerClient) {
    throw new Error('Azure Blob Storage is not configured or initialized');
  }
  
  // Ensure the container exists with public read access for blobs
  await containerClient.createIfNotExists({ access: 'blob' });
  
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });
  
  return blockBlobClient.url;
}

module.exports = {
  isConfigured: () => !!containerClient,
  uploadToCDN
};
