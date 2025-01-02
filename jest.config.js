module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-ble-plx|@react-native|react-native-safe-area-context|react-native-vector-icons|react-native-paper/lib/commonjs/assets)/)',
  ],
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  moduleDirectories: ['node_modules', 'src', __dirname],
};
