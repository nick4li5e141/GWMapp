const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for importing from the app directory
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json', 'mjs'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf'];

// Add support for expo-router
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native', 'browser', 'default'];

// Add support for ESM modules
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true
  }
};

// Add support for vector icons
config.resolver.extraNodeModules = {
  '@expo/vector-icons': require.resolve('@expo/vector-icons'),
};

module.exports = config; 