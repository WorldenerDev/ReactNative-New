import { Image, Linking, Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import StepTitle from "@components/StepTitle";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import ButtonComp from "@components/ButtonComp";
import fonts from "@assets/fonts";
import colors from "@assets/colors";
import navigationStrings from "@navigation/navigationStrings";
import { getItem, setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { checkNotifications, RESULTS } from "react-native-permissions";

const Notification = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const loadPermissionStatus = async () => {
      const stored = await getItem(STORAGE_KEYS.NOTIFICATION_GRANTED);
      if (stored === "true") {
        setPermissionGranted(true);
        return;
      }

      try {
        const { status } = await checkNotifications();
        setPermissionGranted(status === RESULTS.GRANTED);
      } catch (error) {
        console.warn("Failed to read notification permission:", error);
      }
    };

    loadPermissionStatus();
  }, []);

  const finishNotificationFlow = async () => {
    await setItem(STORAGE_KEYS.NOTIFICATION_SCREEN_SEEN, "true");
    navigation.navigate(navigationStrings.SIGNINSCREEN);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      if (!permissionGranted) {
        if (Platform.OS === "ios") {
          await Linking.openSettings();
        } else {
          await Linking.openSettings();
        }
      }
      await finishNotificationFlow();
    } catch (error) {
      console.warn("Failed to open notification settings:", error);
      await finishNotificationFlow();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await setItem(STORAGE_KEYS.NOTIFICATION_GRANTED, "skipped");
    await setItem(STORAGE_KEYS.NOTIFICATION_SCREEN_SEEN, "true");
    navigation.navigate(navigationStrings.SIGNINSCREEN);
  };

  const buttonTitle = permissionGranted
    ? "Continue"
    : isLoading
      ? "Opening Settings..."
      : "Open Notification Settings";

  return (
    <ResponsiveContainer>
      <StepTitle
        title="Stay updated with real-time alerts"
        subtitle="Get instant alerts when bookings are confirmed, groups are created or, friends respond are confirmed."
      />
      <Image
        source={imagePath.NOTIFICATION_IMAGE}
        style={styles.notificationImage}
        resizeMode="contain"
      />
      <ButtonComp
        title={buttonTitle}
        containerStyle={styles.buttonStyle}
        onPress={handleContinue}
        disabled={isLoading}
      />
      <Text style={styles.notificationText} onPress={handleSkip}>
        Skip for now
      </Text>
    </ResponsiveContainer>
  );
};

export default Notification;

const styles = StyleSheet.create({
  notificationImage: {
    width: getWidth(300),
    height: getHeight(300),
    alignSelf: "center",
    marginTop: getHeight(40),
  },
  buttonStyle: {
    marginTop: getHeight(120),
  },
  notificationText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: "center",
    marginTop: getHeight(30),
  },
});
