// Vercel adapter only. Business logic lives in ../app.js so the same Express
// application can run unchanged on a VPS, Docker, or any Node.js host.
module.exports = require('../app');
