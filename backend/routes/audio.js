const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const objectStorage = require('../services/objectStorage');

router.get('/status', protect, (_req, res) => {
  res.json({
    configured: objectStorage.isConfigured(),
    driver: objectStorage.getDriver(),
    directUpload: true,
  });
});

router.post('/upload', protect, authorize('student', 'teacher'), async (req, res) => {
  try {
    const storageFile = req.body?.storageFile;
    const reference = storageFile?.url || storageFile?.pathname;

    if (!reference) {
      return res.status(400).json({
        error: 'Direct object-storage upload is required',
        code: 'DIRECT_UPLOAD_REQUIRED',
      });
    }

    const validReference =
      objectStorage.referenceMatches(reference, 'recitation-audio', req.user.id) &&
      (objectStorage.getDriver() !== 'vercel-blob' || objectStorage.isVercelBlobReference(reference));

    if (!validReference) {
      return res.status(400).json({ error: 'Invalid audio upload reference' });
    }

    return res.status(200).json({
      message: 'Audio upload finalized',
      file: {
        url: reference,
        name: storageFile.name || 'recitation',
        size: Number(storageFile.size || 0),
        contentType: storageFile.contentType || 'application/octet-stream',
      },
      driver: objectStorage.getDriver(),
    });
  } catch (error) {
    console.error('Audio finalization error:', error.message);
    return res.status(500).json({ error: 'Failed to finalize audio upload' });
  }
});

module.exports = router;
