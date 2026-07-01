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
          "@mocks": "./src/mocks",
          "@services": "./src/services",
        },
      },
    ],
    [
      "module:babel-plugin-inline-dotenv",
      {
        path: ".env",
      },
    ],
    'react-native-worklets/plugin',
  ],
};
