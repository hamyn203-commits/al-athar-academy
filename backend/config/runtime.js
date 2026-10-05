const hasDatabaseConfig = Boolean(process.env.MONGODB_URI || process.env.MONGODB_URL);
const isProduction = process.env.NODE_ENV === 'production';

// Mock data exists only for local development. Production must always fail closed
// instead of returning or mutating in-memory demo data.
const isMockMode = !isProduction && !hasDatabaseConfig;

module.exports = {
  hasDatabaseConfig,
  isProduction,
  isMockMode,
};
