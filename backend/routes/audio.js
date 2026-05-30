const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

// Multer setup (in-memory storage for uploading directly to Azure)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Azure Blob Storage Setup
// This will silently fail if AZURE_STORAGE_CONNECTION_STRING is missing, but won't crash the app
const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = 'student-recordings';

let blobServiceClient;
let containerClient;

if (AZURE_CONNECTION_STRING) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    containerClient = blobServiceClient.getContainerClient(containerName);
  } catch (error) {
    console.error('Error initializing Azure Blob Service:', error.message);
  }
}

// Upload Audio Route
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided.' });
    }

    if (!AZURE_CONNECTION_STRING) {
      return res.status(503).json({ 
        message: 'Azure Storage not configured.',
        mockUrl: 'https://mock-azure-url.com/audio.webm',
        note: 'The server received the file, but Azure connection string is missing.'
      });
    }

    // Generate unique blob name
    const blobName = `rec_${Date.now()}_${req.file.originalname || 'audio.webm'}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload to Azure
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype || 'audio/webm' }
    });

    res.status(200).json({
      message: 'Audio uploaded successfully to Azure',
      url: blockBlobClient.url
    });

  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Failed to upload audio', error: err.message });
  }
});

module.exports = router;
