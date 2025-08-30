import { Image, ImageBackground, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import navigationStrings from "@navigation/navigationStrings";
import { getItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { SafeAreaView } from "react-native-safe-area-context";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkFlow = async () => {
      try {
        const hasLaunched = await getItem(STORAGE_KEYS.HAS_LAUNCHED);
        const notifGranted = await getItem(STORAGE_KEYS.NOTIFICATION_GRANTED);
        const locationGranted = await getItem(STORAGE_KEYS.LOCATION_GRANTED);

        setTimeout(() => {
          navigation.navigate(navigationStrings.ONBOARDINGSCREEN);
          // if (!hasLaunched) {
          //     navigation.navigate(navigationStrings.ONBOARDINGSCREEN);
          // } else if (!notifGranted) {
          //     navigation.navigate(navigationStrings.ENABLENOTIFICATIONSCREEN);
          // } else if (!locationGranted) {
          //     navigation.navigate(navigationStrings.ENABLELOCATIONSCREEN);
          // } else {
          //     navigation.navigate(navigationStrings.SIGNINSCREEN);
          // }
        }, 3000);
      } catch (error) {
        console.error("Error reading storage:", error);
        navigation.navigate(navigationStrings.ONBOARDINGSCREEN);
      }
    };

    checkFlow();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.centered}>
        <Image
          source={imagePath.LOGO_TRANSPARENT}
          style={{ resizeMode: "contain" }}
        />
      </SafeAreaView>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
