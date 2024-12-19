module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          'react-native-vector-icons/MaterialCommunityIcons':
            '@react-native-vector-icons/material-design-icons',
        },
      },
    ],
  ],
};
