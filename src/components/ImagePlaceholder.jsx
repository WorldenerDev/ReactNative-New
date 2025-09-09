import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";

const ImagePlaceholder = ({
  style,
  text = "Loading...",
  backgroundColor = colors.lightGray,
  textColor = colors.lightText,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  text: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    textAlign: "center",
  },
});

export default ImagePlaceholder;
