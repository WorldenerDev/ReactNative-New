import { Image, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import navigationStrings from "@navigation/navigationStrings";
import { getItem, setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { SafeAreaView } from "react-native-safe-area-context";
import usePermissions from "@hooks/usePermissions";

const SplashScreen = ({ navigation }) => {
  const { requestNotificationPermission } = usePermissions();

  useEffect(() => {
    const checkFlow = async () => {
      try {
        const hasLaunched = await getItem(STORAGE_KEYS.HAS_LAUNCHED);
        const notificationScreenSeen = await getItem(
          STORAGE_KEYS.NOTIFICATION_SCREEN_SEEN
        );

        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!hasLaunched) {
          navigation.navigate(navigationStrings.ONBOARDINGSCREEN);
          return;
        }

        if (notificationScreenSeen) {
          navigation.navigate(navigationStrings.SIGNINSCREEN);
          return;
        }

        const existingPermission = await getItem(
          STORAGE_KEYS.NOTIFICATION_GRANTED
        );
        if (
          existingPermission === null ||
          existingPermission === undefined ||
          existingPermission === ""
        ) {
          const permissionGranted = await requestNotificationPermission();
          await setItem(
            STORAGE_KEYS.NOTIFICATION_GRANTED,
            permissionGranted ? "true" : "false"
          );
        }

        navigation.navigate(navigationStrings.ENABLENOTIFICATIONSCREEN);
      } catch (error) {
        console.error("Error reading storage:", error);
        navigation.navigate(navigationStrings.ONBOARDINGSCREEN);
      }
    };

    checkFlow();
  }, [navigation, requestNotificationPermission]);

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
