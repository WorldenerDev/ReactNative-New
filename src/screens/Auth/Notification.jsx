import { Image, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import ButtonComp from "@components/ButtonComp";
import fonts from "@assets/fonts";
import colors from "@assets/colors";
import navigationStrings from "@navigation/navigationStrings";
import usePermissions from "@hooks/usePermissions";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";

const Notification = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { requestNotificationPermission } = usePermissions();

  const handleEnableNotification = async () => {
    setIsLoading(true);
    try {
      const permissionGranted = await requestNotificationPermission();

      if (permissionGranted) {
        await setItem(STORAGE_KEYS.NOTIFICATION_GRANTED, "true");
        navigation.navigate(navigationStrings.SIGNINSCREEN);
      } else {
        await setItem(STORAGE_KEYS.NOTIFICATION_GRANTED, "false");
        navigation.navigate(navigationStrings.SIGNINSCREEN);
      }
    } catch (error) {
      await setItem(STORAGE_KEYS.NOTIFICATION_GRANTED, "false");
      navigation.navigate(navigationStrings.SIGNINSCREEN);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate(navigationStrings.SIGNINSCREEN);
  };

  return (
    <ResponsiveContainer>
      <StepTitle
        title="Enable Notification"
        subtitle="Enable notification to receive updates on your gigs and freelancers."
      />
      <Image
        source={imagePath.NOTIFICATION_IMAGE}
        style={styles.notificationImage}
        resizeMode="contain"
      />
      <ButtonComp
        title={isLoading ? "Checking Permission..." : "Enable Notification"}
        containerStyle={styles.buttonStyle}
        onPress={handleEnableNotification}
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
