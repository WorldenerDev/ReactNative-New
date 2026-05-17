module.exports = {
    project: {
        ios: {
            // Avoid `bundle exec pod install` from the RN CLI; run `pod install` in ios/ manually.
            automaticPodsInstallation: false,
        },
        android: {},
    },
    assets: ["./src/assets/fonts/source/"],
};
