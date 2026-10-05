const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { getConfigurationReadiness } = require('../config/readiness');

const report = getConfigurationReadiness();

console.log(JSON.stringify({
  configurationReady: report.configurationReady,
  databaseConfigured: report.databaseConfigured,
  authConfigured: report.authConfigured,
  runtimeConfigured: report.runtimeConfigured,
  urlsConfigured: report.urlsConfigured,
  corsConfigured: report.corsConfigured,
  schedulerConfigured: report.schedulerConfigured,
  storageConfigured: report.storageConfigured,
  storageDriver: report.storageDriver,
  missingConfiguration: report.missingConfiguration,
}, null, 2));

if (!report.configurationReady) {
  process.exitCode = 1;
}
