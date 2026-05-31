const { detectMarketFromAcceptLanguage } = require('../config/markets');

function detectMarket(req, res, next) {
  req.detectedMarket = detectMarketFromAcceptLanguage(req.headers['accept-language'] || '');
  next();
}

module.exports = detectMarket;
