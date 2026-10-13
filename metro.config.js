const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./scripts/loadEnvFile');
const { writeEnvConfig } = require('./scripts/writeEnvConfig');

writeEnvConfig();

const envPath = path.join(__dirname, '.env');
loadEnvFile(envPath);

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const envContents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * cacheVersion includes `.env` so API_ENV / URL changes are not served from an old transform.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = mergeConfig(getDefaultConfig(__dirname), {
  cacheVersion: crypto.createHash('sha256').update(envContents).digest('hex'),
});
