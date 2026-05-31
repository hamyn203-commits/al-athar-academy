const express = require('express');
const { markets, getMarketBySlug, detectMarketFromAcceptLanguage } = require('../config/markets');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ markets });
});

router.get('/detect', (req, res) => {
  const market = detectMarketFromAcceptLanguage(req.headers['accept-language'] || '');
  res.json({ market });
});

router.get('/:slug', (req, res) => {
  const market = getMarketBySlug(req.params.slug);
  if (!market) return res.status(404).json({ error: 'Market not found' });
  res.json({ market });
});

module.exports = router;
