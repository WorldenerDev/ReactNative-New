const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, ".env");

module.exports = function (api) {
  // Re-transform when `.env` changes. Metro also keys its cache on this file via metro.config.js.
  api.cache.using(() => {
    let file = "";
    try {
      file = fs.readFileSync(envPath, "utf8");
    } catch (e) {
      file = "";
    }
    // Release bundling sets NODE_ENV=production. Debug does not.
    return file + "\0" + (process.env.NODE_ENV || "");
  });

  return {
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
          path: envPath,
          // Replace process.env.* with the .env literal so the device does not
          // read React Native's process.env (NODE_ENV only).
          unsafe: true,
          // `.env` wins over a leftover shell API_ENV.
          systemVar: "disable",
          // NODE_ENV is not in .env. Leaving it unset makes unsafe mode replace
          // process.env.NODE_ENV with undefined, so release bundles ship React's
          // development JSX runtime and the first render throws.
          env: process.env.NODE_ENV
            ? { NODE_ENV: process.env.NODE_ENV }
            : undefined,
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
