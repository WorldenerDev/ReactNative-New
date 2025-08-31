module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "@assets": "./src/assets",
          "@components": "./src/components",
          "@context": "./src/context",
          "@navigation": "./src/navigation",
          "@screens": "./src/screens",
          "@utils": "./src/utils",
          "@config": "./src/config",
          "@api": "./src/api",
          "@redux": "./src/redux",
          "@hooks": "./src/hooks",
        },
      },
    ],
    // 'react-native-worklets/plugin',
  ],
};
