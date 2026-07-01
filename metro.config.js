const path = require('path');
const { loadEnvFile } = require('./scripts/loadEnvFile');

loadEnvFile(path.join(__dirname, '.env'));

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = mergeConfig(getDefaultConfig(__dirname), {});
