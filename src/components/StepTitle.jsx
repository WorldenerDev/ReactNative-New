import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";

const StepTitle = ({ title = "", subtitle = "", containerStyle = {} }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle !== "" && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default StepTitle;

const styles = StyleSheet.create({
  container: {
    marginBottom: getVertiPadding(20),
    marginTop: getVertiPadding(20),
  },
  title: {
    fontSize: getFontSize(21),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(4),
  },
  subtitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(5),
  },
});
