import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import ButtonComp from "@components/ButtonComp";
import fonts from "@assets/fonts";
import colors from "@assets/colors";
import navigationStrings from "@navigation/navigationStrings";

const Notification = ({ navigation }) => {
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
        title="Enable Notification"
        containerStyle={styles.buttonStyle}
        onPress={() => {
          navigation.navigate(navigationStrings.SIGNINSCREEN);
        }}
        disabled={false}
      />
      <Text style={styles.notificationText}>Skip for now</Text>
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
